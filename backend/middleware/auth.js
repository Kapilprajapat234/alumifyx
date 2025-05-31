const User = require('../models/User');

// Authentication middleware
const isAuthenticated = async (req, res, next) => {
  try {
    console.log('Checking authentication...');
    console.log('Session:', req.session);
    console.log('Session ID:', req.sessionID);
    console.log('User ID from session:', req.session.userId);

    if (!req.session || !req.session.userId) {
      console.log('No session or userId found');
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'Unauthorized - Please login' });
      }
      return res.redirect('/login');
    }

    // Verify user still exists in database
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log('User not found in database');
      req.session.destroy();
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ message: 'User not found - Please login again' });
      }
      return res.redirect('/login');
    }

    // Add user to request object
    req.user = user;
    console.log('User authenticated successfully');
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (req.originalUrl.startsWith('/api')) {
      return res.status(500).json({ message: 'Server error during authentication' });
    }
    return res.redirect('/login');
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