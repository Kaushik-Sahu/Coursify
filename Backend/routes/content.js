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
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

// ═══════════════════════════════════════════════════
// ADMIN ROUTES — Content Management
// ═══════════════════════════════════════════════════

// Generate signed Cloudinary upload params
router.post('/upload-signature', authMiddleware, requireRole(['Admin']), contentController.getUploadSignature);

// Section CRUD
router.post('/courses/:courseId/sections', authMiddleware, requireRole(['Admin']), contentController.createSection);
router.put('/courses/:courseId/sections/:sectionId', authMiddleware, requireRole(['Admin']), contentController.updateSection);
router.delete('/courses/:courseId/sections/:sectionId', authMiddleware, requireRole(['Admin']), contentController.deleteSection);

// Video CRUD
router.post('/courses/:courseId/sections/:sectionId/videos', authMiddleware, requireRole(['Admin']), contentController.createVideo);
router.put('/courses/:courseId/sections/:sectionId/videos/:videoId', authMiddleware, requireRole(['Admin']), contentController.updateVideo);
router.delete('/courses/:courseId/sections/:sectionId/videos/:videoId', authMiddleware, requireRole(['Admin']), contentController.deleteVideo);

// Get full course content (creator view)
router.get('/courses/:courseId/content', authMiddleware, requireRole(['Admin']), contentController.getAdminCourseContent);

// Video Comments
router.get('/courses/:courseId/sections/:sectionId/videos/:videoId/comments', authMiddleware, contentController.getVideoComments);
router.post('/courses/:courseId/sections/:sectionId/videos/:videoId/comments', authMiddleware, contentController.addVideoComment);

module.exports = router;
