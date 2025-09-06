/**
 * @fileoverview Defines the API routes for admin-related actions.
 * Base path: /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const authMiddleware = require('../Middlewares/auth');

// --- Authentication Routes ---
router.post('/signup', adminController.signup);
router.post('/verify', adminController.verify);
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.post('/refresh', adminController.refresh);

// --- Course Management Routes (Protected) ---

// GET all courses created by the admin
router.get('/courses', authMiddleware, adminController.getCourses);

// POST a new course
router.post('/courses', authMiddleware, adminController.createCourse);

// PUT (update) a specific course by ID
router.put('/courses/:courseId', authMiddleware, adminController.updateCourse);

// DELETE a specific course by ID
router.delete('/courses/:courseId', authMiddleware, adminController.deleteCourse);

module.exports = router;