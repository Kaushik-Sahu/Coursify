const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');

// In a real app, you should add a superAdminAuth middleware here.

router.get('/users', superAdminController.getUsers);
router.get('/creators', superAdminController.getCreators);
router.delete('/user/:id', superAdminController.deleteUser);
router.delete('/creator/:id', superAdminController.deleteCreator);

module.exports = router;
