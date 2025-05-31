const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware (JWT only)
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    if (!adminEmails.length) {
      console.error('ADMIN_EMAILS not set in .env');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!adminEmails.includes(user.email)) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    next();
  } catch (err) {
    console.error('Admin check error:', err.message);
    res.status(500).json({ error: 'Server error during admin check' });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin
}; 