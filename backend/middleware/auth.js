const User = require('../models/User');

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log('Checking authentication...');
  console.log('Session:', req.session);
  console.log('Session ID:', req.sessionID);
  console.log('User ID from session:', req.session.userId);
  console.log('NODE_ENV:', process.env.NODE_ENV);

  // **Temporary Development Bypass:**
  // In non-production environments, bypass the authentication check
  if (process.env.NODE_ENV !== 'production') {
    console.log('Authentication bypassed for development environment.');
    // Explicitly call next() to proceed to the next middleware/route handler
    return next();
  }

  // Original authentication logic (only active in production)
  if (req.session && req.session.userId) {
    console.log('User is authenticated.');
    return next();
  } else {
    console.log('User not authenticated. Redirecting to login.');
    // Check if the request is for an API endpoint
    if (req.originalUrl.startsWith('/api')) {
      // If it's an API request, send a 401 Unauthorized response
      return res.status(401).json({ message: 'Unauthorized' });
    } else {
      // If it's a page request, redirect to the login page
      return res.redirect('/login'); // Assuming your login page route is /login
    }
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