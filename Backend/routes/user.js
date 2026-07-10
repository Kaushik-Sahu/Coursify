const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

// --- Authentication Routes ---
router.post('/signup', userController.signup);
router.post('/check-username', userController.checkUsername);
router.post('/check-email', userController.checkEmail);
router.post('/verify', userController.verify);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh', userController.refresh);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/me', authMiddleware, userController.getMe);
router.put('/me/preferences', authMiddleware, userController.updatePreferences);

// --- Course Routes ---

// GET all published courses (public but uses optionalAuth to filter creator's own courses)
router.get('/courses', optionalAuth, userController.getCourses);

// POST to purchase a course (protected)
router.post('/courses/:courseId', authMiddleware, userController.purchaseCourse);

// GET all courses purchased by the user (protected)
router.get('/purchasedCourses', authMiddleware, userController.purchasedCourses);

// GET course content — enrollment verified, returns signed URLs (protected)
router.get('/courses/:courseId/content', authMiddleware, contentController.getUserCourseContent);

// POST to submit a report (protected)
router.post('/report', authMiddleware, userController.submitReport);

module.exports = router;