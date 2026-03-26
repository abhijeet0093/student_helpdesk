const mongoose = require('mongoose');

/**
 * ChatMessage Schema
 * Stores individual messages in a chat session
 * Sender can be "student" or "ai"
 * TTL: Messages auto-deleted after 30 days via MongoDB TTL index
 */
const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['student', 'ai'],
    required: true
  },
  messageText: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// TTL index: auto-delete messages after 30 days (2592000 seconds)
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
