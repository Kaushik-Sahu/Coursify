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

        const { accessToken, refreshToken } = generateTokens(superAdmin);
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

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(superAdmin);
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
 * Retrieves all users.
 */
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({});
        res.status(200).json({ users });
    } catch (err) {
        next(new ErrorHandler(500, 'Failed to retrieve users'));
    }
};

/**
 * Retrieves all creators (admins).
 */
const getCreators = async (req, res, next) => {
    try {
        const creators = await Admin.find({});
        res.status(200).json({ creators });
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

module.exports = {
    login,
    refresh,
    logout,
    getMe,
    getStats,
    getUsers,
    getCreators,
    deleteUser,
    deleteCreator,
    elevateToSuperAdmin
};
