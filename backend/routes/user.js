const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Get user profile
router.get('/', isAuthenticated, userController.getProfile);

// Update user profile
router.put('/', isAuthenticated, upload.single('profilePic'), userController.updateProfile);

// Delete user account
router.delete('/', isAuthenticated, userController.deleteAccount);

module.exports = router; 