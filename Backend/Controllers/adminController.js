/**
 * @fileoverview Controller for admin-related actions.
 * Handles admin authentication and course management (CRUD operations).
 */

const { Admin, Course } = require("../database/db");
const { createAuthHandlers } = require('../services/authService');
const ErrorHandler = require("../utils/ErrorHandler");

// Generate the standard authentication handlers (signup, login, etc.) for the Admin model.
const { signup, verify, login, refresh, logout } = createAuthHandlers(Admin, 'Admin');


const createCourse = async (req, res, next) => {
    const { title, description, price, image, published } = req.body;
    // The admin's ID is attached to the request by the authMiddleware.
    const adminId = req.userId;

    try {
        const newCourse = await Course.create({
            title,
            description,
            price,
            image,
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
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId, creator: adminId }, // Condition: Match course ID and creator ID
            { $set: { title, description, price, image, published } }, // The update payload
            { new: true, runValidators: true } // Options: Return the updated document and run schema validators
        );

        if (!updatedCourse) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

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
 */
const deleteCourse = async (req, res, next) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    try {
        const deletedCourse = await Course.findOneAndDelete({ _id: courseId, creator: adminId });

        if (!deletedCourse) {
            return next(new ErrorHandler(404, 'Course not found or you are not the creator'));
        }

        return res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        next(error);
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
    logout
};