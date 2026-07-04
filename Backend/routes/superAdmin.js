/**
 * @fileoverview Defines the API routes for superadmin-related actions.
 * Base path: /superadmin
 * 
 * SECURITY: There is NO signup or verify endpoint.
 * Superadmins are created ONLY via:
 *   1. The database seed script (root superadmin on startup).
 *   2. The POST /elevate endpoint (by an existing superadmin).
 */

const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const superAdminAuth = require('../Middlewares/superAdminAuth');

// --- Authentication Routes (Public — no auth needed to login) ---
router.post('/login', superAdminController.login);
router.post('/logout', superAdminController.logout);
router.post('/refresh', superAdminController.refresh);
router.post('/forgot-password', superAdminController.forgotPassword);
router.post('/reset-password', superAdminController.resetPassword);
router.put('/me/preferences', superAdminAuth, superAdminController.updatePreferences);

// --- Protected Routes (SuperAdmin only) ---
router.get('/me', superAdminAuth, superAdminController.getMe);
router.get('/stats', superAdminAuth, superAdminController.getStats);
router.get('/users', superAdminAuth, superAdminController.getUsers);
router.get('/creators', superAdminAuth, superAdminController.getCreators);
router.delete('/user/:id', superAdminAuth, superAdminController.deleteUser);
router.delete('/creator/:id', superAdminAuth, superAdminController.deleteCreator);

// --- Elevation Route (SuperAdmin only) ---
router.post('/elevate', superAdminAuth, superAdminController.elevateToSuperAdmin);

// --- Report Management Routes (SuperAdmin only) ---
router.get('/reports', superAdminAuth, superAdminController.getReports);
router.put('/reports/:id/status', superAdminAuth, superAdminController.updateReportStatus);

// --- Deep User Management ---
router.get('/users/:userId', superAdminAuth, superAdminController.getUserDetail);
router.put('/users/:userId/block', superAdminAuth, superAdminController.toggleBlockUser);
router.post('/users/:userId/grant-course', superAdminAuth, superAdminController.grantCourseAccess);
router.delete('/users/:userId/revoke-course/:courseId', superAdminAuth, superAdminController.revokeCourseAccess);

// --- Deep Creator Management ---
router.get('/creators/:creatorId', superAdminAuth, superAdminController.getCreatorDetail);
router.put('/creators/:creatorId/block', superAdminAuth, superAdminController.toggleBlockCreator);

// --- Global Course Management ---
router.get('/courses/all', superAdminAuth, superAdminController.getAllCoursesForGrant);

module.exports = router;
