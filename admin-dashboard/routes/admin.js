const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, adminAuth } = require('../middleware/auth');
const Course = require('../models/Course');
const Class = require('../models/Growth');
const Book = require('../models/Library');
const Job = require('../models/Job');
const Mentor = require('../models/Mentor');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// --- Courses ---
router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/courses', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/courses/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/courses/:id', adminAuth, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Classes ---
router.post('/classes', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const classData = new Class({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image
    });
    await classData.save();
    res.status(201).json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/classes', auth, async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/classes/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    const classData = await Class.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/classes/:id', adminAuth, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Books ---
router.get('/books', auth, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/books', adminAuth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'content', maxCount: 1 }
]), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      coverImage: req.files.coverImage ? `/uploads/${req.files.coverImage[0].filename}` : req.body.coverImage,
      contentUrl: req.files.content ? `/uploads/${req.files.content[0].filename}` : req.body.contentUrl
    };
    const book = new Book(bookData);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/books/:id', adminAuth, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'content', maxCount: 1 }
]), async (req, res) => {
  try {
    const updates = req.body;
    if (req.files.coverImage) {
      updates.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }
    if (req.files.content) {
      updates.contentUrl = `/uploads/${req.files.content[0].filename}`;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Jobs ---
router.get('/jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/jobs', adminAuth, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/jobs/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/jobs/:id', adminAuth, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Mentors ---
router.get('/mentors', auth, async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/mentors', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const mentor = new Mentor({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image
    });
    await mentor.save();
    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/mentors/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/mentors/:id', adminAuth, async (req, res) => {
  try {
    await Mentor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mentor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 