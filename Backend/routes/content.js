/**
 * @fileoverview Routes for course content management (sections, videos, uploads).
 * These routes are mounted under /admin and /users in server.js via their respective routers.
 * This file is imported and used by both admin.js and user.js route files.
 *
 * Admin routes (content management): protected by authMiddleware
 * User routes (content access): protected by authMiddleware + enrollment check in controller
 */

const express = require('express');
const router = express.Router();
const contentController = require('../Controllers/contentController');
const authMiddleware = require('../Middlewares/auth');

// ═══════════════════════════════════════════════════
// ADMIN ROUTES — Content Management
// ═══════════════════════════════════════════════════

// Generate signed Cloudinary upload params
router.post('/upload-signature', authMiddleware, contentController.getUploadSignature);

// Section CRUD
router.post('/courses/:courseId/sections', authMiddleware, contentController.createSection);
router.put('/courses/:courseId/sections/:sectionId', authMiddleware, contentController.updateSection);
router.delete('/courses/:courseId/sections/:sectionId', authMiddleware, contentController.deleteSection);

// Video CRUD
router.post('/courses/:courseId/sections/:sectionId/videos', authMiddleware, contentController.createVideo);
router.put('/courses/:courseId/sections/:sectionId/videos/:videoId', authMiddleware, contentController.updateVideo);
router.delete('/courses/:courseId/sections/:sectionId/videos/:videoId', authMiddleware, contentController.deleteVideo);

// Get full course content (creator view)
router.get('/courses/:courseId/content', authMiddleware, contentController.getAdminCourseContent);

// Video Comments
router.get('/courses/:courseId/sections/:sectionId/videos/:videoId/comments', authMiddleware, contentController.getVideoComments);
router.post('/courses/:courseId/sections/:sectionId/videos/:videoId/comments', authMiddleware, contentController.addVideoComment);

module.exports = router;
