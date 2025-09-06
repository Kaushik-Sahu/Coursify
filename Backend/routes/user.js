/**
 * @fileoverview Defines the API routes for user-related actions.
 * Base path: /api/users
 */

const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const authMiddleware = require('../Middlewares/auth');

// --- Authentication Routes ---
router.post('/signup', userController.signup);
router.post('/verify', userController.verify);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh', userController.refresh);

// --- Course Routes ---

// GET all published courses (public)
router.get('/courses', userController.getCourses);

// POST to purchase a course (protected)
router.post('/courses/:courseId', authMiddleware, userController.purchaseCourse);

// GET all courses purchased by the user (protected)
router.get('/purchasedCourses', authMiddleware, userController.purchasedCourses);

module.exports = router;