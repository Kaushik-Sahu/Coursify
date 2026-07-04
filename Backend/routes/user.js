const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const contentController = require('../Controllers/contentController');
const authMiddleware = require('../Middlewares/auth');

// --- Authentication Routes ---
router.post('/signup', userController.signup);
router.post('/verify', userController.verify);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh', userController.refresh);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/me', authMiddleware, userController.getMe);
router.put('/me/preferences', authMiddleware, userController.updatePreferences);

// --- Course Routes ---

// GET all published courses (public)
router.get('/courses', userController.getCourses);

// POST to purchase a course (protected)
router.post('/courses/:courseId', authMiddleware, userController.purchaseCourse);

// GET all courses purchased by the user (protected)
router.get('/purchasedCourses', authMiddleware, userController.purchasedCourses);

// GET course content — enrollment verified, returns signed URLs (protected)
router.get('/courses/:courseId/content', authMiddleware, contentController.getUserCourseContent);

// POST to submit a report (protected)
router.post('/report', authMiddleware, userController.submitReport);

module.exports = router;