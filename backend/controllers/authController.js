const User = require('../models/User');
const transporter = require('../config/email');
const crypto = require('crypto');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Register request:', { name, email });

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Set session
    req.session.userId = newUser._id;
    console.log('User registered successfully:', newUser._id);

    res.status(201).json({ 
      message: 'Account created successfully', 
      user: { name, email } 
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user._id;
    console.log('Login successful for user:', user._id);
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      console.log('Session saved successfully');
      res.json({
        message: 'Login successful',
        user: { name: user.name, email: user.email }
      });
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Forgot password request:', { email });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Use environment variable for frontend URL
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';
    const resetLink = `${FRONTEND_URL}/reset-password.html?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Alumifyx Password Reset',
      html: `Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.`
    });

    console.log('Password reset email sent to:', email);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ error: 'Server error while sending reset email' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log('Reset password request:', { token });

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired token:', token);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};

// Logout
const logout = (req, res) => {
  console.log('Logout request for session:', req.session.userId);
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.json({ message: 'Logout successful' });
  });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout
}; 