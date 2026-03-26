const mongoose = require('mongoose');

/**
 * UTResult Schema
 * Stores UT-1 and UT-2 test results for students
 */
const utResultSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  rollNo: {
    type: String,
    required: true,
    uppercase: true,
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
    max: 3
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  utType: {
    type: String,
    enum: ['UT1', 'UT2'],
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'enteredByModel'
  },
  enteredByModel: {
    type: String,
    enum: ['Admin', 'Staff']
  },
  isReleased: {
    type: Boolean,
    default: false,
    index: true
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  releasedAt: {
    type: Date,
    default: null
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    index: true
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

// Compound index to prevent duplicate entries
utResultSchema.index({ studentId: 1, subjectId: 1, utType: 1 }, { unique: true });

// Calculate percentage before saving
utResultSchema.pre('save', function(next) {
  this.percentage = (this.marksObtained / this.maxMarks) * 100;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UTResult', utResultSchema);
