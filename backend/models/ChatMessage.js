const mongoose = require('mongoose');

/**
 * ChatMessage Schema
 * Stores individual messages in a chat session
 * Sender can be "student" or "ai"
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
    default: Date.now
  }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
