const mongoose = require('mongoose');

/**
 * Post Schema
 * Student Corner - Academic content sharing
 */
const postSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentRollNumber: {
    type: String,
    required: true
  },
  contentText: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000
  },
  attachmentPath: {
    type: String,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  comments: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
postSchema.index({ createdAt: -1 });
postSchema.index({ isReported: 1 });
// TTL: auto-delete posts older than 1 year (365 days = 31536000 seconds)
// The cron cleanup service also handles this with file deletion first.
// This TTL is a safety net for DB-only cleanup if the cron misses a run.
postSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('Post', postSchema);
