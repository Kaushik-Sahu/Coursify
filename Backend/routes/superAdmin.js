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

// --- Protected Routes (SuperAdmin only) ---
router.get('/me', superAdminAuth, superAdminController.getMe);
router.get('/stats', superAdminAuth, superAdminController.getStats);
router.get('/users', superAdminAuth, superAdminController.getUsers);
router.get('/creators', superAdminAuth, superAdminController.getCreators);
router.delete('/user/:id', superAdminAuth, superAdminController.deleteUser);
router.delete('/creator/:id', superAdminAuth, superAdminController.deleteCreator);

// --- Elevation Route (SuperAdmin only) ---
router.post('/elevate', superAdminAuth, superAdminController.elevateToSuperAdmin);

module.exports = router;
