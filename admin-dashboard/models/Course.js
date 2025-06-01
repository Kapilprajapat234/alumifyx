const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  description: String
});

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  resources: [resourceSchema]
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  subjects: [subjectSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  chapters: [chapterSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema); 