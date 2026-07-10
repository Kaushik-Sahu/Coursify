/**
 * @fileoverview Controller for user-related actions.
 * Handles user authentication, course discovery, and course purchasing.
 */

const { User, Course, Report, Admin } = require("../database/db");
const { createAuthHandlers } = require('../services/authService');
const ErrorHandler = require("../utils/ErrorHandler");

// Generate the standard authentication handlers (signup, login, etc.) for the User model.
const { signup, verify, login, refresh, logout, forgotPassword, resetPassword, updatePreferences } = createAuthHandlers(User, 'User');


 //Retrieves all published courses for any user to view.

const getCourses = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { published: true };
        
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        if (req.userRole === 'Admin' && req.userId) {
            query.creator = { $ne: req.userId };
        }
        
        const coursesDocs = await Course.find(query).populate('creator', 'username email');
        
        let enrolledCourseIds = [];
        if (req.userId && req.userRole) {
            const Model = req.userRole === 'Admin' ? Admin : User;
            const currentUser = await Model.findById(req.userId).select('enrolledCourses');
            if (currentUser && currentUser.enrolledCourses) {
                enrolledCourseIds = currentUser.enrolledCourses.map(id => id.toString());
            }
        }

        const courses = coursesDocs.map(course => {
            const courseObj = course.toObject();
            courseObj.isPurchased = enrolledCourseIds.includes(course._id.toString());
            return courseObj;
        });

        res.status(200).json({ courses });
    }
    catch (err) {
        next(err);
    }
};

/**
 * Allows a logged-in user to purchase a course.
 * Adds the course's ID to the user's list of enrolled courses.
 */
const purchaseCourse = async (req, res, next) => {
    const userId = req.userId;
    const { courseId } = req.params;
    const env = process.env.APP_ENV || 'testing';

    try {
        // Enforce payment validation when in production mode
        if (env === 'production') {
            const { paymentId } = req.body;
            if (!paymentId) {
                return next(new ErrorHandler(402, "Payment Required: Please provide a valid paymentId for production purchases."));
            }
        }

        // Always fetch and validate the course first
        const course = await Course.findById(courseId);
        
        if (!course) {
            return next(new ErrorHandler(404, "Course not found"));
        }
        
        if (!course.published && req.userRole !== 'SuperAdmin') {
            return next(new ErrorHandler(400, "Cannot purchase an unpublished course"));
        }

        if (req.userRole === 'Admin') {
            if (course.creator.toString() === userId) {
                return next(new ErrorHandler(403, "You cannot purchase your own course"));
            }
            
            const admin = await Admin.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } }, { new: true });
            if (!admin) {
                return next(new ErrorHandler(404, "Creator not found"));
            }
        } else {
            // Use $addToSet to prevent duplicate course entries in the user's enrolledCourses array.
            const user = await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } }, { new: true });
            if (!user) {
                return next(new ErrorHandler(404, "User not found"));
            }
        }

        return res.status(200).json({
            message: "Course purchased successfully"
        });
    }
    catch (err) {
        next(err);
    }
};


// Retrieves the list of courses a logged-in user has purchased.

const purchasedCourses = async (req, res, next) => {
    const userId = req.userId;
    try {
        let Model = User;
        if (req.userRole === 'Admin') {
            Model = Admin;
        } else if (req.userRole === 'SuperAdmin') {
            return res.status(200).json({ purchasedCourses: [] });
        }
        
        const account = await Model.findById(userId).populate('enrolledCourses');
        if (!account) {
            return next(new ErrorHandler(404, "Account not found"));
        }
        return res.status(200).json({
            purchasedCourses: account.enrolledCourses || [] // Ensure an array is always returned.
        });
    }
    catch (err) {
        next(err);
    }
};

const getMe = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler(404, "User not found"));
        }
        return res.status(200).json({
            user: {
                username: user.username,
                email: user.email,
                role: 'User',
                enrolledCourses: user.enrolledCourses || []
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Submits a new report (video or course).
 */
const submitReport = async (req, res, next) => {
    try {
        const { subject, description, videoId, courseId } = req.body;

        if (!subject || !description) {
            return next(new ErrorHandler(400, 'Subject and description are required.'));
        }

        const report = await Report.create({
            reporterId: req.userId,
            reporterModel: req.userRole || 'User', // defaults to User
            subject,
            description,
            videoId,
            courseId,
            status: 'Open'
        });

        res.status(201).json({ message: 'Report submitted successfully.', report });
    } catch (err) {
        next(err);
    }
};

const checkUsername = async (req, res, next) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username is required' });
        
        const userExists = await User.findOne({ username });
        const adminExists = await Admin.findOne({ username });
        
        res.status(200).json({ available: !userExists && !adminExists });
    } catch (err) {
        next(err);
    }
};

const checkEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        
        const userExists = await User.findOne({ email });
        const adminExists = await Admin.findOne({ email });
        
        res.status(200).json({ available: !userExists && !adminExists });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    signup,
    login,
    getCourses,
    purchaseCourse,
    purchasedCourses,
    verify,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    updatePreferences,
    getMe,
    submitReport,
    checkUsername,
    checkEmail
};