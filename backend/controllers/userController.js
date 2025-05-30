const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Get user profile
const getProfile = async (req, res) => {
  try {
    // Temporarily bypass user fetch in development environment
    if (process.env.NODE_ENV !== 'production') {
      console.log('Returning dummy user in development environment.');
      return res.json({
        _id: 'dummyUserId123',
        name: 'Development User',
        email: 'devuser@example.com',
        // Add other necessary dummy fields here
        mentorships: [], // Assuming mentorships is an array
        // ... add other fields expected by the frontend
      });
    }

    console.log('Fetching user profile for:', req.session.userId);
    const user = await User.findById(req.session.userId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .populate('mentorships');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request for:', req.session.userId);
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      name,
      email,
      phone,
      education,
      skills,
      certifications,
      address,
      gender,
      dob,
      bio
    } = req.body;

    // Email validation if changed
    if (email && email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Phone validation if provided
    if (phone && !/^\+?\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number (10-15 digits)' });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.education = education || user.education;
    user.skills = skills || user.skills;
    user.certifications = certifications || user.certifications;
    user.address = address || user.address;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    user.bio = bio || user.bio;

    // Handle profile picture upload
    if (req.file) {
      if (user.profilePic) {
        try {
          const oldPicPath = path.join(__dirname, '../uploads', user.profilePic);
          await fs.unlink(oldPicPath);
          console.log('Old profile picture deleted:', oldPicPath);
        } catch (err) {
          console.error('Error deleting old profile picture:', err.message);
        }
      }
      user.profilePic = req.file.filename;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    console.log('Delete user request for:', req.session.userId);
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete profile picture if exists
    if (user.profilePic) {
      try {
        const picPath = path.join(__dirname, '../uploads', user.profilePic);
        await fs.unlink(picPath);
        console.log('Profile picture deleted:', picPath);
      } catch (err) {
        console.error('Error deleting profile picture:', err.message);
      }
    }

    // Delete user and related data
    await User.findByIdAndDelete(req.session.userId);
    await Mentorship.deleteMany({ userId: req.session.userId });

    // Destroy session
    req.session.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Server error while deleting account' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
}; 