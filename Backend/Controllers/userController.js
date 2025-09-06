/**
 * @fileoverview Controller for user-related actions.
 * Handles user authentication, course discovery, and course purchasing.
 */

const { User, Course } = require("../database/db");
const { createAuthHandlers } = require('../services/authService');
const ErrorHandler = require("../utils/ErrorHandler");

// Generate the standard authentication handlers (signup, login, etc.) for the User model.
const { signup, verify, login, refresh, logout } = createAuthHandlers(User, 'User');


 //Retrieves all published courses for any user to view.

const getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ published: true });
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
    try {
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

module.exports = {
    signup,
    login,
    getCourses,
    purchaseCourse,
    purchasedCourses,
    verify,
    refresh,
    logout
};