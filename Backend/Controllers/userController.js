/**
 * @fileoverview Controller for user-related actions.
 * Handles user authentication, course discovery, and course purchasing.
 */

const { User, Course, Report } = require("../database/db");
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
        
        const courses = await Course.find(query);
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

        // Use $addToSet to prevent duplicate course entries in the user's enrolledCourses array.
        const user = await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } }, { new: true });
        if (!user) {
            return next(new ErrorHandler(404, "User not found"));
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
        const user = await User.findById(userId).populate('enrolledCourses');
        if (!user) {
            return next(new ErrorHandler(404, "User not found"));
        }
        return res.status(200).json({
            purchasedCourses: user.enrolledCourses || [] // Ensure an array is always returned.
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
    submitReport
};