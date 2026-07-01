/**
 * @fileoverview Controller for course content management.
 * Handles upload signature generation, course sections CRUD,
 * course videos CRUD (with Cloudinary temp → permanent flow),
 * and secure content delivery for enrolled users.
 */

const { Course, CourseSection, CourseVideo, Admin, User, Comment, SuperAdmin } = require('../database/db');
const {
    generateSignature,
    moveAsset,
    deleteAsset,
    generateSignedUrl
} = require('../utils/cloudinary');
const ErrorHandler = require('../utils/ErrorHandler');

// ═══════════════════════════════════════════════════
// UPLOAD SIGNATURE
// ═══════════════════════════════════════════════════

/**
 * Generates a signed Cloudinary upload payload.
 * Checks the creator's storage quota before issuing the signature.
 *
 * @body {string} resourceType - 'image' or 'video'
 */
const getUploadSignature = async (req, res, next) => {
    const creatorId = req.userId;
    const { resourceType } = req.body;

    if (!resourceType || !['image', 'video'].includes(resourceType)) {
        return next(new ErrorHandler(400, 'resourceType must be "image" or "video"'));
    }

    try {
        // Quota check for video uploads
        if (resourceType === 'video') {
            const admin = await Admin.findById(creatorId);
            if (!admin) {
                return next(new ErrorHandler(404, 'Creator not found'));
            }

            const maxStorageBytes = (parseInt(process.env.MAX_CREATOR_STORAGE_MB) || 5000) * 1024 * 1024;
            if (admin.storageUsed >= maxStorageBytes) {
                return next(new ErrorHandler(403, 'Storage quota exceeded. Delete some videos to free up space.'));
            }
        }

        const signatureData = generateSignature(resourceType);

        res.status(200).json({
            success: true,
            ...signatureData
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════
// COURSE SECTIONS CRUD
// ═══════════════════════════════════════════════════

/**
 * Creates a new section in a course.
 * Verifies the course belongs to the logged-in admin.
 *
 * @body {string} title - Section title
 * @body {number} [order] - Display order
 */
const createSection = async (req, res, next) => {
    const { courseId } = req.params;
    const creatorId = req.userId;
    const { title, order } = req.body;

    try {
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        // Auto-calculate order if not provided
        let sectionOrder = order;
        if (sectionOrder === undefined) {
            const lastSection = await CourseSection.findOne({ courseId }).sort({ order: -1 });
            sectionOrder = lastSection ? lastSection.order + 1 : 0;
        }

        const section = await CourseSection.create({
            courseId,
            title,
            order: sectionOrder
        });

        res.status(201).json({
            message: 'Section created successfully',
            section
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Updates a section's title or order.
 */
const updateSection = async (req, res, next) => {
    const { courseId, sectionId } = req.params;
    const creatorId = req.userId;
    const { title, order } = req.body;

    try {
        // Verify course ownership
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        const section = await CourseSection.findOneAndUpdate(
            { _id: sectionId, courseId },
            { $set: { ...(title !== undefined && { title }), ...(order !== undefined && { order }) } },
            { new: true, runValidators: true }
        );

        if (!section) {
            return next(new ErrorHandler(404, 'Section not found'));
        }

        res.status(200).json({ message: 'Section updated successfully', section });
    } catch (err) {
        next(err);
    }
};

/**
 * Deletes a section and all its videos.
 * Also removes videos from Cloudinary and updates creator storage.
 */
const deleteSection = async (req, res, next) => {
    const { courseId, sectionId } = req.params;
    const creatorId = req.userId;

    try {
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        const section = await CourseSection.findOne({ _id: sectionId, courseId });
        if (!section) {
            return next(new ErrorHandler(404, 'Section not found'));
        }

        // Find all videos in this section to delete from Cloudinary
        const videos = await CourseVideo.find({ sectionId });
        let totalBytesFreed = 0;

        for (const video of videos) {
            try {
                await deleteAsset(video.publicId, 'video');
            } catch (cloudErr) {
                console.error(`Failed to delete Cloudinary asset ${video.publicId}:`, cloudErr.message);
            }
            totalBytesFreed += video.bytes || 0;
        }

        // Delete all videos from DB
        await CourseVideo.deleteMany({ sectionId });

        // Delete the section
        await CourseSection.findByIdAndDelete(sectionId);

        // Update creator's storage usage
        if (totalBytesFreed > 0) {
            await Admin.findByIdAndUpdate(creatorId, { $inc: { storageUsed: -totalBytesFreed } });
        }

        res.status(200).json({ message: 'Section and all its videos deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════
// COURSE VIDEOS CRUD
// ═══════════════════════════════════════════════════

/**
 * Saves video metadata after the client has uploaded directly to Cloudinary.
 * Moves the asset from the temp folder to a permanent course folder.
 *
 * @body {string} publicId - The Cloudinary public_id from the temp upload
 * @body {string} title - Video title
 * @body {string} [description] - Video description
 * @body {number} bytes - File size in bytes (from Cloudinary response)
 * @body {number} [duration] - Video duration in seconds
 * @body {number} [order] - Display order
 */
const createVideo = async (req, res, next) => {
    const { courseId, sectionId } = req.params;
    const creatorId = req.userId;
    const { publicId, title, description, bytes, duration, order } = req.body;

    if (!publicId || !title || bytes === undefined) {
        return next(new ErrorHandler(400, 'publicId, title, and bytes are required'));
    }

    try {
        // Verify course ownership
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        // Verify section belongs to this course
        const section = await CourseSection.findOne({ _id: sectionId, courseId });
        if (!section) {
            return next(new ErrorHandler(404, 'Section not found in this course'));
        }

        // Check storage quota
        const admin = await Admin.findById(creatorId);
        const maxStorageBytes = (parseInt(process.env.MAX_CREATOR_STORAGE_MB) || 5000) * 1024 * 1024;
        if ((admin.storageUsed || 0) + bytes > maxStorageBytes) {
            // Delete the temp upload since we're rejecting it
            try { await deleteAsset(publicId, 'video'); } catch (_) { /* ignore */ }
            return next(new ErrorHandler(403, 'Storage quota exceeded. Delete some videos to free up space.'));
        }

        // Move from temp → permanent folder
        const permanentFolder = `coursify/courses/${courseId}`;
        const moveResult = await moveAsset(publicId, permanentFolder, 'video');

        // Auto-calculate order if not provided
        let videoOrder = order;
        if (videoOrder === undefined) {
            const lastVideo = await CourseVideo.findOne({ sectionId }).sort({ order: -1 });
            videoOrder = lastVideo ? lastVideo.order + 1 : 0;
        }

        // Save video metadata to DB
        const video = await CourseVideo.create({
            sectionId,
            creatorId,
            title,
            description: description || '',
            videoUrl: moveResult.secure_url,
            publicId: moveResult.public_id,
            bytes,
            duration: duration || 0,
            order: videoOrder
        });

        // Update creator's storage usage
        await Admin.findByIdAndUpdate(creatorId, { $inc: { storageUsed: bytes } });

        res.status(201).json({
            message: 'Video saved successfully',
            video
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Updates video metadata (title, description, order).
 * Does NOT re-upload the video file.
 */
const updateVideo = async (req, res, next) => {
    const { courseId, sectionId, videoId } = req.params;
    const creatorId = req.userId;
    const { title, description, order, hidden } = req.body;

    try {
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        const video = await CourseVideo.findOneAndUpdate(
            { _id: videoId, sectionId },
            { $set: { 
                ...(title !== undefined && { title }), 
                ...(description !== undefined && { description }), 
                ...(order !== undefined && { order }),
                ...(hidden !== undefined && { hidden })
            } },
            { new: true, runValidators: true }
        );

        if (!video) {
            return next(new ErrorHandler(404, 'Video not found'));
        }

        res.status(200).json({ message: 'Video updated successfully', video });
    } catch (err) {
        next(err);
    }
};

/**
 * Deletes a video from DB and Cloudinary.
 * Updates the creator's storage usage.
 */
const deleteVideo = async (req, res, next) => {
    const { courseId, sectionId, videoId } = req.params;
    const creatorId = req.userId;

    try {
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        const video = await CourseVideo.findOne({ _id: videoId, sectionId });
        if (!video) {
            return next(new ErrorHandler(404, 'Video not found'));
        }

        // Delete from Cloudinary
        try {
            await deleteAsset(video.publicId, 'video');
        } catch (cloudErr) {
            console.error(`Failed to delete Cloudinary asset ${video.publicId}:`, cloudErr.message);
        }

        // Delete from DB
        await CourseVideo.findByIdAndDelete(videoId);

        // Update creator's storage
        await Admin.findByIdAndUpdate(creatorId, { $inc: { storageUsed: -(video.bytes || 0) } });

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════
// CONTENT RETRIEVAL (ADMIN)
// ═══════════════════════════════════════════════════

const getAdminCourseContent = async (req, res, next) => {
    const { courseId } = req.params;
    const creatorId = req.userId;

    try {
        const course = await Course.findOne({ _id: courseId, creator: creatorId });
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        const sections = await CourseSection.find({ courseId }).sort({ order: 1 }).lean();

        // Populate videos for each section with signed URLs
        for (const section of sections) {
            const videos = await CourseVideo.find({ sectionId: section._id }).sort({ order: 1 }).lean();
            section.videos = videos.map(video => ({
                ...video,
                videoUrl: generateSignedUrl(video.publicId, 'video')
            }));
        }

        res.status(200).json({ course, sections });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════════
// CONTENT RETRIEVAL (USER — ENROLLMENT VERIFIED)
// ═══════════════════════════════════════════════════

/**
 * Gets course content for an enrolled user.
 * Returns time-limited signed Cloudinary URLs.
 * Unenrolled users get 403.
 */
const getUserCourseContent = async (req, res, next) => {
    const userId = req.userId;
    const { courseId } = req.params;

    try {
        // Verify enrollment
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler(404, 'User not found'));
        }

        const isEnrolled = user.enrolledCourses.some(
            (id) => id.toString() === courseId
        );

        if (!isEnrolled) {
            return next(new ErrorHandler(403, 'You must purchase this course to access its content'));
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found'));
        }

        const sections = await CourseSection.find({ courseId }).sort({ order: 1 }).lean();

        // Populate videos with signed URLs
        for (const section of sections) {
            const videos = await CourseVideo.find({ sectionId: section._id, hidden: { $ne: true } }).sort({ order: 1 }).lean();
            section.videos = videos.map((video) => ({
                _id: video._id,
                title: video.title,
                description: video.description,
                duration: video.duration,
                order: video.order,
                // Replace stored URL with a time-limited signed URL
                videoUrl: generateSignedUrl(video.publicId, 'video')
            }));
        }

        res.status(200).json({ course: { title: course.title, description: course.description }, sections });
    } catch (err) {
        next(err);
    }
};

/**
 * Gets all comments for a specific video.
 */
const getVideoComments = async (req, res, next) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Fetch the instructor's very first comment (Admin or SuperAdmin)
        const instructorComment = await Comment.findOne({
            videoId,
            userModel: { $in: ['Admin', 'SuperAdmin'] }
        })
            .populate('userId', 'username email')
            .sort({ createdAt: 1 }) // Earliest comment
            .lean();

        let query = { videoId };
        
        // If an instructor comment exists, exclude it from the normal paginated query
        // so it doesn't appear twice.
        if (instructorComment) {
            query._id = { $ne: instructorComment._id };
        }

        // Fetch the rest of the comments, sorted latest first
        const comments = await Comment.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        let finalComments = comments;

        // Pin the instructor's first comment to the very top ONLY on the first page
        if (instructorComment && pageNum === 1) {
            finalComments = [instructorComment, ...comments];
        }

        res.status(200).json({ success: true, comments: finalComments });
    } catch (err) {
        next(err);
    }
};

/**
 * Adds a new comment to a video.
 */
const addVideoComment = async (req, res, next) => {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
        return next(new ErrorHandler(400, 'Comment text is required'));
    }

    try {
        // Dynamically determine the user model (User, Admin, or SuperAdmin)
        let userModel = 'User';
        let user = await User.findById(userId);
        if (!user) {
            user = await Admin.findById(userId);
            if (user) {
                userModel = 'Admin';
            } else {
                user = await SuperAdmin.findById(userId);
                if (user) {
                    userModel = 'SuperAdmin';
                } else {
                    return next(new ErrorHandler(404, 'User/Author not found'));
                }
            }
        }

        const newComment = await Comment.create({
            videoId,
            userId,
            userModel,
            text
        });

        const populatedComment = await Comment.findById(newComment._id)
            .populate('userId', 'username email')
            .lean();

        res.status(201).json({
            success: true,
            comment: populatedComment
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUploadSignature,
    createSection,
    updateSection,
    deleteSection,
    createVideo,
    updateVideo,
    deleteVideo,
    getAdminCourseContent,
    getUserCourseContent,
    getVideoComments,
    addVideoComment
};
