const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middlewares/auth');
const notificationController = require('../Controllers/notificationController');

router.get('/', authMiddleware, notificationController.getNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
