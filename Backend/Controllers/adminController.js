/**
 * @fileoverview Controller for admin-related actions.
 * Handles admin authentication and course management (CRUD operations).
 */

const { Admin, Course, CourseSection, CourseVideo } = require("../database/db");
const { deleteAsset, moveAsset, deleteFolder } = require("../utils/cloudinary");
const { createAuthHandlers } = require('../services/authService');
const ErrorHandler = require("../utils/ErrorHandler");

// Generate the standard authentication handlers (signup, login, etc.) for the Admin model.
const { signup, verify, login, refresh, logout, forgotPassword, resetPassword, updatePreferences } = createAuthHandlers(Admin, 'Admin');


const createCourse = async (req, res, next) => {
    const { title, description, price, image, published } = req.body;
    // The admin's ID is attached to the request by the authMiddleware.
    const adminId = req.userId;

    let finalImage = image;

    try {
        if (image && image.includes('coursify/temp/')) {
            const urlParts = image.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const filename = filenameWithExt.split('.')[0];
            const tempPublicId = `coursify/temp/${filename}`;
            
            try {
                const moveResult = await moveAsset(tempPublicId, 'coursify/thumbnails', 'image');
                finalImage = moveResult.secure_url;
            } catch (err) {
                console.error("Failed to move course image:", err);
            }
        }

        const newCourse = await Course.create({
            title,
            description,
            price,
            image: finalImage,
            published,
            creator: adminId
        });

        return res.status(201).json({
            message: "Course created successfully",
            courseId: newCourse._id
        });

    } catch (error) {
        next(new ErrorHandler(500, "Failed to create course"));
    }
};

/**
 * Updates an existing course.
 * The course must exist and be created by the logged-in admin.
 */
const updateCourse = async (req, res, next) => {
    const { title, description, price, image, published } = req.body;
    const { courseId } = req.params;
    const adminId = req.userId;

    try {
        // Fetch existing course to see if we need to clean up old image
        const existingCourse = await Course.findOne({ _id: courseId, creator: adminId });
        if (!existingCourse) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        let finalImage = image;
        if (image && image.includes('coursify/temp/') && image !== existingCourse.image) {
            const urlParts = image.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const filename = filenameWithExt.split('.')[0];
            const tempPublicId = `coursify/temp/${filename}`;
            
            try {
                const moveResult = await moveAsset(tempPublicId, 'coursify/thumbnails', 'image');
                finalImage = moveResult.secure_url;
                
                // If there was an old image on Cloudinary, delete it
                if (existingCourse.image && existingCourse.image.includes('cloudinary.com')) {
                    const oldUrlParts = existingCourse.image.split('/');
                    const oldFilenameWithExt = oldUrlParts[oldUrlParts.length - 1];
                    const oldFilename = oldFilenameWithExt.split('.')[0];
                    const oldFolder = existingCourse.image.includes('coursify/thumbnails') ? 'coursify/thumbnails' : (existingCourse.image.includes('coursify/temp') ? 'coursify/temp' : '');
                    if (oldFolder) {
                        const oldPublicId = `${oldFolder}/${oldFilename}`;
                        await deleteAsset(oldPublicId, 'image').catch(err => console.error("Failed to delete old image:", err));
                    }
                }
            } catch (err) {
                console.error("Failed to move course image:", err);
            }
        }

        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creator: adminId }, 
            { $set: { title, description, price, image: finalImage, published } }, 
            { new: true, runValidators: true } 
        );

        return res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        next(error);
    }
};


 // Retrieves all courses created by the logged-in admin.

const getCourses = async (req, res, next) => {
    const adminId = req.userId;

    try {
        const courses = await Course.find({ creator: adminId });
        return res.status(200).json({ courses });
    } catch (err) {
        next(err);
    }
};

/**
 * Deletes a course.
 * The course must exist and be created by the logged-in admin.
 * Performs a cascading delete: removes sections, videos, and Cloudinary assets.
 */
const deleteCourse = async (req, res, next) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    try {
        const course = await Course.findOne({ _id: courseId, creator: adminId });

        if (!course) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        // Find all sections for this course
        const sections = await CourseSection.find({ courseId: course._id });
        const sectionIds = sections.map(sec => sec._id);

        // Find all videos in these sections
        const videos = await CourseVideo.find({ sectionId: { $in: sectionIds } });
        let totalBytesFreed = 0;

        // Delete all videos from Cloudinary
        for (const video of videos) {
            try {
                await deleteAsset(video.publicId, 'video');
            } catch (cloudErr) {
                console.error(`Failed to delete Cloudinary asset ${video.publicId}:`, cloudErr.message);
            }
            totalBytesFreed += video.bytes || 0;
        }

        // Delete all video and section documents from DB
        await CourseVideo.deleteMany({ sectionId: { $in: sectionIds } });
        await CourseSection.deleteMany({ courseId: course._id });

        // Delete the course's video folder from Cloudinary (must be empty now)
        try {
            await deleteFolder(`coursify/courses/${course._id}`);
        } catch (folderErr) {
            // Folder might not exist or might not be empty if there was a partial failure
            console.error(`Failed to delete Cloudinary folder for course ${course._id}:`, folderErr.message);
        }

        // Update creator's storage usage
        if (totalBytesFreed > 0) {
            await Admin.findByIdAndUpdate(adminId, { $inc: { storageUsed: -totalBytesFreed } });
        }

        // Delete the course image if it's hosted on Cloudinary
        if (course.image && course.image.includes('cloudinary.com')) {
             try {
                 const uploadIndex = course.image.indexOf('/upload/');
                 if (uploadIndex !== -1) {
                     let pathAfterUpload = course.image.substring(uploadIndex + 8);
                     // Remove version (e.g., v1234567890/) if present
                     if (pathAfterUpload.match(/^v\d+\//)) {
                         pathAfterUpload = pathAfterUpload.substring(pathAfterUpload.indexOf('/') + 1);
                     }
                     // Remove extension
                     const publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
                     if (publicId) {
                         await deleteAsset(publicId, 'image');
                     }
                 }
             } catch (imgErr) {
                 console.error("Failed to delete course image from Cloudinary", imgErr);
             }
        }

        // Finally, delete the course document
        await Course.findByIdAndDelete(course._id);

        return res.status(200).json({ message: 'Course and all related content deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getCourseById = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const creatorId = req.userId;
        const course = await Course.findOne({ _id: courseId, creator: creatorId }).lean();
        if (!course) {
            return next(new ErrorHandler(404, 'Course not found'));
        }
        res.status(200).json({ course });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to fetch course details'));
    }
};

const getMe = async (req, res, next) => {
    const adminId = req.userId;
    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return next(new ErrorHandler(404, "Admin not found"));
        }
        return res.status(200).json({
            user: {
                username: admin.username,
                email: admin.email,
                role: 'Creator',
                enrolledCourses: admin.enrolledCourses || []
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    signup,
    login,
    createCourse,
    updateCourse,
    getCourses,
    deleteCourse,
    verify,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    updatePreferences,
    getMe,
    getCourseById
};