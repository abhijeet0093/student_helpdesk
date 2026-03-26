const mongoose = require('mongoose');

/**
 * ChatSession Schema
 * Stores chat sessions for each student
 * TTL: Sessions auto-deleted after 30 days of inactivity
 */
const chatSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// TTL index: auto-delete sessions after 30 days of inactivity (2592000 seconds)
chatSessionSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 2592000 });

// Update lastActiveAt on any activity
chatSessionSchema.methods.updateActivity = function() {
  this.lastActiveAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
