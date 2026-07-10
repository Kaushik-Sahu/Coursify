const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', authMiddleware, notificationController.getNotifications);
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;
