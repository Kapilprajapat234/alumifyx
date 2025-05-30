const express = require('express');
const router = express.Router();
const growthController = require('../controllers/growthController');

// Get skill by ID
router.get('/skills/:id', growthController.getSkillById);

// Get all recorded classes
router.get('/recorded-classes', growthController.getRecordedClasses);

// Get all live classes
router.get('/live-classes', growthController.getLiveClasses);

module.exports = router; 