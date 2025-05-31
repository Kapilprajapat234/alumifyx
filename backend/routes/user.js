const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/', isAuthenticated, getProfile);

// Update user profile
router.put('/', isAuthenticated, upload.single('profilePic'), userController.updateProfile);

// Delete user account
router.delete('/', isAuthenticated, userController.deleteAccount);

// Get user profile (JWT protected)
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

module.exports = router; 