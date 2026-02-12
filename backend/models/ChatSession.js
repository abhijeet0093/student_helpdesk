const mongoose = require('mongoose');

/**
 * ChatSession Schema
 * Stores chat sessions for each student
 * One student can have multiple sessions
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
    default: Date.now
  }
});

// Update lastActiveAt on any activity
chatSessionSchema.methods.updateActivity = function() {
  this.lastActiveAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
