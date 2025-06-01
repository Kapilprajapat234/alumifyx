const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  expertise: [{
    type: String,
    required: true
  }],
  experience: {
    type: String,
    required: true
  },
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  contact: {
    email: String,
    linkedin: String,
    website: String
  },
  availability: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mentor', mentorSchema); 