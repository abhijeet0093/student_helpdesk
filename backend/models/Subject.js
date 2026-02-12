const mongoose = require('mongoose');

/**
 * Subject Schema
 * Stores subject information for different departments and years
 */
const subjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
subjectSchema.index({ department: 1, year: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
