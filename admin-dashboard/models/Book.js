const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  category: { type: String, enum: ['study', 'motivational'], required: true },
  cover: String, // image file or url
  contentFile: String, // pdf file path
  contentUrl: String // pdf url
});

module.exports = mongoose.model('Book', bookSchema); 