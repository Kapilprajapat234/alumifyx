const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const academicRoutes = require('./routes/academic');
const growthRoutes = require('./routes/growth');

// Import middleware
const { handleMulterError } = require('./middleware/upload');

// Import database connection
const connectDB = require('./config/database');

const app = express();
const port = process.env.NODE_ENV === 'production' ? process.env.PORT : 3001; // Use port 3001 in development, process.env.PORT in production

console.log(`Attempting to start server on port: ${port}`);
console.log(`process.env.PORT is: ${process.env.PORT}`);
console.log(`Resolved port is: ${port}`);
console.log(`process.env.NODE_ENV is: ${process.env.NODE_ENV}`);

// Validate critical environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} must be set in .env file`);
    process.exit(1);
  }
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Log All Incoming Requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from origin: ${req.headers.origin}`);
  console.log('Request headers:', req.headers);
  console.log('Session ID from cookie:', req.cookies ? req.cookies['connect.sid'] : 'No session cookie sent'); // Assuming 'connect.sid' is your session cookie name
  next();
});

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  unset: 'destroy',
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/alumifyxDB',
    touchAfter: 24 * 3600,
    ttl: 24 * 60 * 60,
    autoRemove: 'native',
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: 'lax',
    path: '/'
  }
}));

// Add session debugging middleware
app.use((req, res, next) => {
  console.log('Session before request:', req.session);
  console.log('Session ID after middleware:', req.sessionID);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/growth', growthRoutes);

// Error Handling Middleware
app.use(handleMulterError);
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start Server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Server started at:', new Date().toISOString());
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
      process.exit(1);
    }
  });
});

// Error Handling
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err.message);
  server.close(async () => {
    console.log('HTTP server closed due to uncaught exception.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(1);
    } catch (mongoErr) {
      console.error('Error closing MongoDB connection after uncaught exception:', mongoErr);
      process.exit(1);
    }
  });
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(async () => {
    console.log('HTTP server closed due to unhandled rejection.');
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(1);
    } catch (mongoErr) {
      console.error('Error closing MongoDB connection after unhandled rejection:', mongoErr);
      process.exit(1);
    }
  });
}); 