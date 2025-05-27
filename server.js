const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Validate critical environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} must be set in .env file`);
    process.exit(1);
  }
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err.message);
    process.exit(1);
  }
})();

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (JPEG, PNG, GIF) are allowed'));
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files statically

// CORS Configuration
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/alumifyxDB';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s
    maxPoolSize: 10, // Maintain up to 10 socket connections
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'alumifyx-secret-2025',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // false in development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// Nodemailer Setup
// Note: Gmail requires an App Password (not regular password) since May 2022.
// Generate an App Password in your Google Account settings and use it for EMAIL_PASS.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error.message);
    process.exit(1);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, match: [/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits'] },
  education: String,
  skills: { type: String, trim: true },
  certifications: String,
  address: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
  dob: String,
  bio: String,
  profilePic: String,
  mentorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentorship' }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});
const User = mongoose.model('User', userSchema);

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  skills: [{ type: String, trim: true }],
  location: String,
  salary: String,
  link: { type: String, trim: true },
});
const Job = mongoose.model('Job', jobSchema);

const mentorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  skill: { type: String, required: true, trim: true },
  photo: String,
  bio: String,
  experience: String,
  price: String,
});
const Mentor = mongoose.model('Mentor', mentorSchema);

const mentorshipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  purchaseDate: { type: Date, default: Date.now },
  status: { type: String, default: 'active', enum: ['active', 'cancelled'] },
});
const Mentorship = mongoose.model('Mentorship', mentorshipSchema);

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
});
const Subject = mongoose.model('Subject', subjectSchema);

const chapterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
});
const Chapter = mongoose.model('Chapter', chapterSchema);

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['PDF', 'Video', 'Article', 'Other'] },
  url: { type: String, required: true, trim: true },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
});
const Resource = mongoose.model('Resource', resourceSchema);

const libraryResourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['Book', 'Article', 'Video', 'Other'] },
  url: { type: String, required: true, trim: true },
  description: String,
});
const LibraryResource = mongoose.model('LibraryResource', libraryResourceSchema);

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
});
const Skill = mongoose.model('Skill', skillSchema);

const recordedClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  url: { type: String, required: true, trim: true },
  duration: String,
});
const RecordedClass = mongoose.model('RecordedClass', recordedClassSchema);

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  date: { type: Date, required: true },
  url: { type: String, required: true, trim: true },
  instructor: String,
});
const LiveClass = mongoose.model('LiveClass', liveClassSchema);

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
};

// Admin Middleware
const isAdmin = (req, res, next) => {
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  if (!adminEmails.length) {
    console.error('ADMIN_EMAILS not set in .env');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  User.findById(req.session.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (!adminEmails.includes(user.email)) {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
      }
      next();
    })
    .catch((err) => {
      console.error('Admin check error:', err.message);
      res.status(500).json({ error: 'Server error during admin check' });
    });
};

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
    if (isNaN(saltRounds) || saltRounds < 10) {
      throw new Error('Invalid BCRYPT_SALT_ROUNDS in .env');
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    req.session.userId = newUser._id;
    res.status(201).json({ message: 'Account created successfully', user: { name, email } });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    req.session.userId = user._id;
    res.json({ message: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetLink = `http://localhost:3002/reset-password.html?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Alumifyx Password Reset',
      html: `Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.`,
    });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ error: 'Server error while sending reset email' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10);
    user.password = await bcrypt.hash(password, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get User Profile
app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
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
});

// Update User Profile (with File Upload)
app.put('/api/user', isAuthenticated, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, phone, education, skills, certifications, address, gender, dob, bio } = req.body;

    // Validate email if updated
    if (email && email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Validate phone if provided
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

    // Handle profile picture
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePic) {
        try {
          const oldPicPath = path.join(__dirname, user.profilePic);
          await fs.unlink(oldPicPath);
        } catch (err) {
          console.error('Error deleting old profile picture:', err.message);
        }
      }
      user.profilePic = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Delete User Account
app.delete('/api/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete profile picture if exists
    if (user.profilePic) {
      try {
        const picPath = path.join(__dirname, user.profilePic);
        await fs.unlink(picPath);
      } catch (err) {
        console.error('Error deleting profile picture:', err.message);
      }
    }

    await User.findByIdAndDelete(req.session.userId);
    await Mentorship.deleteMany({ userId: req.session.userId });
    req.session.destroy();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Server error while deleting account' });
  }
});

// Get Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { skills } = req.query;
    let query = {};
    if (skills) {
      const skillArray = skills.split(',').map((s) => s.trim());
      query.skills = { $all: skillArray };
    }
    const jobs = await Job.find(query);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ error: 'Server error while fetching jobs' });
  }
});

// Get Mentors
app.get('/api/mentors', async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error.message);
    res.status(500).json({ error: 'Server error while fetching mentors' });
  }
});

// Purchase Mentorship
app.post('/api/mentorship', isAuthenticated, async (req, res) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    const existingMentorship = await Mentorship.findOne({
      userId: req.session.userId,
      mentorId,
      status: 'active',
    });
    if (existingMentorship) {
      return res.status(400).json({ error: 'You have already purchased this mentorship' });
    }
    const mentorship = new Mentorship({
      userId: req.session.userId,
      mentorId,
    });
    await mentorship.save();
    await User.findByIdAndUpdate(req.session.userId, {
      $push: { mentorships: mentorship._id },
    });
    res.json({ message: 'Mentorship purchased successfully' });
  } catch (error) {
    console.error('Error purchasing mentorship:', error.message);
    res.status(500).json({ error: 'Server error while purchasing mentorship' });
  }
});

// Get User Mentorships
app.get('/api/mentorships', isAuthenticated, async (req, res) => {
  try {
    const mentorships = await Mentorship.find({ userId: req.session.userId }).populate(
      'mentorId',
      'name skill photo bio experience price'
    );
    res.json(mentorships);
  } catch (error) {
    console.error('Error fetching mentorships:', error.message);
    res.status(500).json({ error: 'Server error while fetching mentorships' });
  }
});

// Get Subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().populate({
      path: 'chapters',
      select: 'name subjectId',
      populate: { path: 'resources', select: 'title type url' },
    });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error.message);
    res.status(500).json({ error: 'Server error while fetching subjects' });
  }
});

// Get Chapters for a Subject
app.get('/api/subjects/:subjectId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find({ subjectId: req.params.subjectId }).populate(
      'resources',
      'title type url'
    );
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error.message);
    res.status(500).json({ error: 'Server error while fetching chapters' });
  }
});

// Get Resources for a Chapter
app.get('/api/chapters/:chapterId/resources', async (req, res) => {
  try {
    const resources = await Resource.find({ chapterId: req.params.chapterId });
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error.message);
    res.status(500).json({ error: 'Server error while fetching resources' });
  }
});

// Get Library Resources
app.get('/api/library', async (req, res) => {
  try {
    const resources = await LibraryResource.find();
    res.json(resources);
  } catch (error) {
    console.error('Error fetching library resources:', error.message);
    res.status(500).json({ error: 'Server error while fetching library resources' });
  }
});

// Get Skills
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error.message);
    res.status(500).json({ error: 'Server error while fetching skills' });
  }
});

// Get Recorded Classes
app.get('/api/recorded-classes', async (req, res) => {
  try {
    const classes = await RecordedClass.find().populate('skillId', 'name description');
    res.json(classes);
  } catch (error) {
    console.error('Error fetching recorded classes:', error.message);
    res.status(500).json({ error: 'Server error while fetching recorded classes' });
  }
});

// Get Live Classes
app.get('/api/live-classes', async (req, res) => {
  try {
    const classes = await LiveClass.find().populate('skillId', 'name description');
    res.json(classes);
  } catch (error) {
    console.error('Error fetching live classes:', error.message);
    res.status(500).json({ error: 'Server error while fetching live classes' });
  }
});

// Initialize Data (Protected Route)
app.post('/api/init-data', isAdmin, async (req, res) => {
  try {
    // Clear existing data
    await Promise.all([
      Job.deleteMany({}),
      Mentor.deleteMany({}),
      Subject.deleteMany({}),
      Chapter.deleteMany({}),
      Resource.deleteMany({}),
      LibraryResource.deleteMany({}),
      Skill.deleteMany({}),
      RecordedClass.deleteMany({}),
      LiveClass.deleteMany({}),
    ]);

    // Sample data
    const jobs = [
      {
        title: 'Python Developer',
        company: 'TechCorp',
        description: 'Develop backend systems using Python and Django.',
        skills: ['Python', 'Web Development', 'Back-End Development'],
        location: 'Bengaluru, India',
        salary: '₹10-15 LPA',
        link: 'https://www.linkedin.com/jobs/view/python-developer-at-techcorp-1234567890',
      },
      {
        title: 'Data Scientist',
        company: 'DataWorks',
        description: 'Analyze large datasets to drive business decisions.',
        skills: ['Python', 'Machine Learning', 'Data Analysis'],
        location: 'Mumbai, India',
        salary: '₹12-18 LPA',
        link: 'https://www.linkedin.com/jobs/view/data-scientist-at-dataworks-1234567891',
      },
    ];

    const mentors = [
      {
        name: 'Amit Sharma',
        skill: 'Personal Finance',
        photo: 'https://via.placeholder.com/100?text=Amit',
        bio: 'Amit is a certified financial planner with over 10 years of experience.',
        experience: '10+ years in financial planning, CFP certified.',
        price: '₹5000/month',
      },
      {
        name: 'Priya Singh',
        skill: 'Stock Market',
        photo: 'https://via.placeholder.com/100?text=Priya',
        bio: 'Priya is a stock market expert with a track record of successful trading.',
        experience: '8 years in stock trading, NSE certified.',
        price: '₹6000/month',
      },
    ];

    const subjects = [
      { name: 'Mathematics', chapters: [] },
      { name: 'Computer Science', chapters: [] },
    ];

    const chapters = [
      { name: 'Algebra', subjectId: null, resources: [] },
      { name: 'Data Structures', subjectId: null, resources: [] },
    ];

    const resources = [
      { title: 'Algebra Basics', type: 'PDF', url: 'https://example.com/algebra.pdf', chapterId: null },
      { title: 'Binary Trees', type: 'Video', url: 'https://example.com/binary-trees.mp4', chapterId: null },
    ];

    const libraryResources = [
      { title: 'Python Programming', type: 'Book', url: 'https://example.com/python-book.pdf', description: 'Comprehensive guide to Python.' },
      { title: 'Machine Learning Intro', type: 'Article', url: 'https://example.com/ml-article', description: 'Introduction to ML concepts.' },
    ];

    const skills = [
      { name: 'Python', description: 'Programming language for various applications.' },
      { name: 'Web Development', description: 'Building websites and web apps.' },
    ];

    const recordedClasses = [
      { title: 'Python Basics', skillId: null, url: 'https://example.com/python-basics.mp4', duration: '2 hours' },
      { title: 'HTML & CSS', skillId: null, url: 'https://example.com/html-css.mp4', duration: '1.5 hours' },
    ];

    const liveClasses = [
      {
        title: 'Advanced Python',
        skillId: null,
        date: new Date('2025-06-01T10:00:00Z'),
        url: 'https://zoom.us/j/123456789',
        instructor: 'John Doe',
      },
    ];

    // Insert data in parallel
    const [savedSubjects, savedSkills] = await Promise.all([
      Subject.insertMany(subjects),
      Skill.insertMany(skills),
    ]);

    // Update chapters with subject IDs
    chapters[0].subjectId = savedSubjects[0]._id;
    chapters[1].subjectId = savedSubjects[1]._id;
    const savedChapters = await Chapter.insertMany(chapters);

    // Update resources with chapter IDs
    resources[0].chapterId = savedChapters[0]._id;
    resources[1].chapterId = savedChapters[1]._id;
    await Resource.insertMany(resources);

    // Update subject documents with chapter IDs
    savedSubjects[0].chapters = [savedChapters[0]._id];
    savedSubjects[1].chapters = [savedChapters[1]._id];
    await Promise.all(savedSubjects.map((subject) => subject.save()));

    // Update recorded and live classes with skill IDs
    recordedClasses[0].skillId = savedSkills[0]._id;
    recordedClasses[1].skillId = savedSkills[1]._id;
    liveClasses[0].skillId = savedSkills[0]._id;

    // Insert remaining data in parallel
    await Promise.all([
      Job.insertMany(jobs),
      Mentor.insertMany(mentors),
      LibraryResource.insertMany(libraryResources),
      RecordedClass.insertMany(recordedClasses),
      LiveClass.insertMany(liveClasses),
    ]);

    res.json({ message: 'Data initialized successfully' });
  } catch (error) {
    console.error('Error initializing data:', error.message);
    res.status(500).json({ error: 'Server error while initializing data' });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 2MB limit' });
    }
    return res.status(400).json({ error: err.message });
  }
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong' });
});

// Graceful Shutdown and Error Handling
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  server.close(() => {
    mongoose.connection.close(() => {
      process.exit(1);
    });
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    mongoose.connection.close(() => {
      process.exit(1);
    });
  });
});