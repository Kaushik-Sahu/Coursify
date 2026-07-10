/**
 * @fileoverview Defines the API routes for admin-related actions.
 * Base path: /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

// --- Authentication Routes ---
router.post('/signup', adminController.signup);
router.post('/verify', adminController.verify);
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.post('/refresh', adminController.refresh);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);
router.put('/me/preferences', authMiddleware, adminController.updatePreferences);
router.get('/me', authMiddleware, adminController.getMe);

// --- Course Management Routes (Protected) ---

// GET all courses created by the admin
router.get('/courses', authMiddleware, requireRole(['Admin']), adminController.getCourses);

// GET a specific course created by the admin
router.get('/courses/:courseId', authMiddleware, requireRole(['Admin']), adminController.getCourseById);

// POST a new course
router.post('/courses', authMiddleware, requireRole(['Admin']), adminController.createCourse);

// PUT (update) a specific course by ID
router.put('/courses/:courseId', authMiddleware, requireRole(['Admin']), adminController.updateCourse);

// DELETE a specific course by ID
router.delete('/courses/:courseId', authMiddleware, requireRole(['Admin']), adminController.deleteCourse);

module.exports = router;