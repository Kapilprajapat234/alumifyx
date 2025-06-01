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

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['live', 'recorded'],
    required: true
  },
  image: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: function() {
      return this.type === 'live';
    }
  },
  duration: String,
  instructor: {
    type: String,
    required: true
  },
  resources: [resourceSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Class', classSchema); 