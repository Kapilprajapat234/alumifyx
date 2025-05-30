const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// Get all courses
router.get('/courses', academicController.getCourses);

// Get subjects by course
router.get('/subjects/:course', academicController.getSubjectsByCourse);

// Get chapters by subject
router.get('/chapters/:subject', academicController.getChaptersBySubject);

// Get resources by subject and chapter
router.get('/resources/:subject/:chapter', academicController.getResourcesByChapter);

module.exports = router; 