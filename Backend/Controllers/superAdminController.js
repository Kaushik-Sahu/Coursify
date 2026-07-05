/**
 * @fileoverview Controller for superadmin-related actions.
 * Handles superadmin authentication (login, logout, refresh),
 * user/creator management, and user elevation to superadmin.
 * 
 * NOTE: There is NO signup endpoint — superadmins are created only via
 * the database seed script or the elevate endpoint.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SuperAdmin, User, Admin, Course, Report } = require('../database/db');
const { generateTokens } = require('../utils/token');
const ErrorHandler = require('../utils/ErrorHandler');
const { createAuthHandlers } = require('../services/authService');

const { forgotPassword, resetPassword, updatePreferences } = createAuthHandlers(SuperAdmin, 'SuperAdmin');

// --- In-Memory Cache for Stats ---
let statsCache = {
    data: null,
    timestamp: 0
};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// --- Authentication Handlers ---

/**
 * Handles superadmin login.
 * Validates credentials and issues JWT access + refresh tokens.
 */
const login = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const superAdmin = await SuperAdmin.findOne({
            $or: [{ username }, { email: username }]
        }).select('+password +refreshToken');

        if (!superAdmin) {
            return next(new ErrorHandler(401, 'Invalid credentials'));
        }

        const isMatch = await bcrypt.compare(password, superAdmin.password);
        if (!isMatch) {
            return next(new ErrorHandler(401, 'Invalid credentials'));
        }

        const { accessToken, refreshToken } = generateTokens(superAdmin, 'SuperAdmin');
        superAdmin.refreshToken = refreshToken;
        await superAdmin.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(200).json({
            message: 'Logged in successfully',
            accessToken
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Refreshes the superadmin's access token using a valid refresh token from cookies.
 */
const refresh = async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return next(new ErrorHandler(401, 'Authentication error: No refresh token provided'));
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const superAdmin = await SuperAdmin.findById(decoded.id).select('+refreshToken');
        if (!superAdmin || superAdmin.refreshToken !== refreshToken) {
            return next(new ErrorHandler(403, 'Forbidden: Invalid or expired refresh token'));
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(superAdmin, 'SuperAdmin');
        superAdmin.refreshToken = newRefreshToken;
        await superAdmin.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });
    } catch (err) {
        next(new ErrorHandler(403, 'Forbidden: Invalid refresh token'));
    }
};

/**
 * Handles superadmin logout.
 * Clears the refresh token from the database and the client-side cookie.
 */
const logout = async (req, res, next) => {
    const { refreshToken } = req.cookies;

    try {
        if (refreshToken) {
            await SuperAdmin.updateOne({ refreshToken }, { $set: { refreshToken: null } });
        }
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
        res.status(200).json({ message: 'SuperAdmin logged out successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * Returns the authenticated superadmin's profile info.
 */
const getMe = async (req, res, next) => {
    try {
        const superAdmin = await SuperAdmin.findById(req.userId);
        if (!superAdmin) {
            return next(new ErrorHandler(404, 'SuperAdmin not found'));
        }

        res.status(200).json({
            user: {
                username: superAdmin.username,
                email: superAdmin.email,
                role: 'SuperAdmin'
            }
        });
    } catch (err) {
        next(err);
    }
};

// --- Statistics Handler (Protected by superAdminAuth) ---

/**
 * Retrieves dashboard statistics with caching.
 */
const getStats = async (req, res, next) => {
    const forceRefresh = req.query.refresh === 'true';

    try {
        const now = Date.now();
        if (!forceRefresh && statsCache.data && (now - statsCache.timestamp < CACHE_TTL_MS)) {
            return res.status(200).json({
                success: true,
                cached: true,
                stats: statsCache.data
            });
        }

        // Fetch counts from all relevant collections concurrently
        const [usersCount, creatorsCount, coursesCount, reportsCount] = await Promise.all([
            User.countDocuments(),
            Admin.countDocuments(),
            Course.countDocuments(),
            Report.countDocuments({ status: 'Open' }) // Count new/open reports
        ]);

        const stats = {
            users: usersCount,
            creators: creatorsCount,
            courses: coursesCount,
            newReports: reportsCount
        };

        // Update cache
        statsCache = {
            data: stats,
            timestamp: now
        };

        res.status(200).json({
            success: true,
            cached: false,
            stats
        });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to fetch statistics'));
    }
};

// --- User Management Handlers (Protected by superAdminAuth) ---

/**
 * Retrieves users with pagination and optional search.
 * Query params: ?page=1&limit=15&search=term
 */
const getUsers = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
        const search = req.query.search?.trim();

        let filter = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            filter = { $or: [{ username: regex }, { email: regex }] };
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to retrieve users'));
    }
};

/**
 * Retrieves creators (admins) with pagination and optional search.
 * Query params: ?page=1&limit=15&search=term
 */
const getCreators = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
        const search = req.query.search?.trim();

        let filter = {};
        if (search) {
            const regex = new RegExp(search, 'i');
            filter = { $or: [{ username: regex }, { email: regex }] };
        }

        const [creatorsRaw, total] = await Promise.all([
            Admin.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Admin.countDocuments(filter)
        ]);

        const creators = await Promise.all(creatorsRaw.map(async (creator) => {
            const coursesCount = await Course.countDocuments({ creator: creator._id });
            return { ...creator, coursesCount };
        }));

        res.status(200).json({
            creators,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to retrieve creators'));
    }
};

/**
 * Deletes a user by ID.
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new ErrorHandler(404, 'User not found'));
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};

/**
 * Deletes a creator (admin) by ID.
 */
const deleteCreator = async (req, res, next) => {
    try {
        const creator = await Admin.findByIdAndDelete(req.params.id);
        if (!creator) {
            return next(new ErrorHandler(404, 'Creator not found'));
        }
        res.status(200).json({ message: 'Creator deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// --- Elevation Handler (Protected by superAdminAuth) ---

/**
 * Elevates a standard user to a superadmin.
 * Creates a new SuperAdmin document using the user's existing credentials.
 * The original user account remains untouched.
 * 
 * @body {string} userId - The ID of the user to elevate.
 */
const elevateToSuperAdmin = async (req, res, next) => {
    const { userId } = req.body;

    if (!userId) {
        return next(new ErrorHandler(400, 'userId is required'));
    }

    try {
        // Look up the user to elevate — include password hash so we can copy it.
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return next(new ErrorHandler(404, 'User not found'));
        }

        // Check if a SuperAdmin with this email already exists.
        const existingSuperAdmin = await SuperAdmin.findOne({ email: user.email });
        if (existingSuperAdmin) {
            return next(new ErrorHandler(409, 'A superadmin with this email already exists'));
        }

        // The user must have a password set (not a Google-only account).
        if (!user.password) {
            return next(new ErrorHandler(400, 'Cannot elevate a Google-only account without a password'));
        }

        await SuperAdmin.create({
            username: user.username,
            email: user.email,
            password: user.password // Already hashed from the User record.
        });

        res.status(201).json({
            message: `User "${user.username}" has been elevated to SuperAdmin`
        });
    } catch (err) {
        next(err);
    }
};

// --- Report Management Handlers (Protected by superAdminAuth) ---

/**
 * Retrieves reports with pagination and optional filtering by status.
 * Query params: ?page=1&limit=15&status=Open
 */
const getReports = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 15));
        const status = req.query.status;

        let filter = {};
        if (status) {
            filter.status = status;
        }

        const [reports, total] = await Promise.all([
            Report.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('reporterId', 'username email')
                .populate('videoId', 'title')
                .populate('courseId', 'title')
                .lean(),
            Report.countDocuments(filter)
        ]);

        res.status(200).json({
            reports,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to retrieve reports'));
    }
};

/**
 * Updates the status of a report.
 */
const updateReportStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
            return next(new ErrorHandler(400, 'Invalid status value'));
        }

        const report = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!report) {
            return next(new ErrorHandler(404, 'Report not found'));
        }

        res.status(200).json({ message: 'Report status updated successfully', report });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to update report status'));
    }
};

// --- User/Creator Deep Management Handlers ---

const getUserDetail = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('enrolledCourses', 'title image price published');
        if (!user) return next(new ErrorHandler(404, 'User not found'));

        const reports = await Report.find({ reporterId: userId, reporterModel: 'User' })
            .populate('videoId', 'title')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ user, reports });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to retrieve user details'));
    }
};

const getCreatorDetail = async (req, res, next) => {
    try {
        const { creatorId } = req.params;
        const creator = await Admin.findById(creatorId);
        if (!creator) return next(new ErrorHandler(404, 'Creator not found'));

        // Find courses created by this admin
        const courses = await Course.find({ creator: creatorId });
        
        // Count enrollments per course (very rudimentary: find Users with course in enrolledCourses)
        const coursesWithStats = await Promise.all(courses.map(async (c) => {
            const enrollments = await User.countDocuments({ enrolledCourses: c._id });
            return { ...c.toObject(), enrollments };
        }));

        const reports = await Report.find({ reporterId: creatorId, reporterModel: 'Admin' })
            .populate('videoId', 'title')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({ creator, courses: coursesWithStats, reports });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to retrieve creator details'));
    }
};

const getCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const search = req.query.search || '';

        let filter = {};
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const [courses, total] = await Promise.all([
            Course.find(filter)
                .populate('creator', 'username email')
                .sort({ _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Course.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            courses,
            total,
            page,
            totalPages
        });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to fetch courses'));
    }
};

const toggleBlockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return next(new ErrorHandler(404, 'User not found'));

        user.blocked = !user.blocked;
        if (user.blocked) {
            user.refreshToken = null; // Clear refresh token if blocked
        }
        await user.save();

        res.status(200).json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`, blocked: user.blocked });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to toggle block status'));
    }
};

const toggleBlockCreator = async (req, res, next) => {
    try {
        const { creatorId } = req.params;
        const creator = await Admin.findById(creatorId);
        if (!creator) return next(new ErrorHandler(404, 'Creator not found'));

        creator.blocked = !creator.blocked;
        if (creator.blocked) {
            creator.refreshToken = null;
        }
        await creator.save();

        res.status(200).json({ message: `Creator ${creator.blocked ? 'blocked' : 'unblocked'} successfully`, blocked: creator.blocked });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to toggle block status'));
    }
};

const grantCourseAccess = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { courseId } = req.body;
        
        if (!courseId) return next(new ErrorHandler(400, 'Course ID is required'));

        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorHandler(404, 'Course not found'));

        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { enrolledCourses: courseId } },
            { new: true }
        );

        if (!user) return next(new ErrorHandler(404, 'User not found'));
        res.status(200).json({ message: 'Course access granted successfully' });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to grant course access'));
    }
};

const revokeCourseAccess = async (req, res, next) => {
    try {
        const { userId, courseId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { enrolledCourses: courseId } },
            { new: true }
        );

        if (!user) return next(new ErrorHandler(404, 'User not found'));
        res.status(200).json({ message: 'Course access revoked successfully' });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to revoke course access'));
    }
};

const getAllCoursesForGrant = async (req, res, next) => {
    try {
        // Fetch all courses (published or unpublished) so superadmin can grant them
        const courses = await Course.find({}).select('title image price published');
        res.status(200).json({ courses });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to fetch courses'));
    }
};

module.exports = {
    login,
    refresh,
    logout,
    getMe,
    getStats,
    getUsers,
    getCreators,
    getCourses,
    deleteUser,
    deleteCreator,
    elevateToSuperAdmin,
    getReports,
    updateReportStatus,
    forgotPassword,
    resetPassword,
    updatePreferences,
    getUserDetail,
    getCreatorDetail,
    toggleBlockUser,
    toggleBlockCreator,
    grantCourseAccess,
    revokeCourseAccess,
    getAllCoursesForGrant
};
