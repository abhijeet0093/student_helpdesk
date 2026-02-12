const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  clearChatHistory
} = require('../controllers/aiController');
const { authenticate, authorizeStudent } = require('../middleware/authMiddleware');

/**
 * AI ASSISTANT ROUTES
 * All routes require student authentication
 * Only verified students can access AI assistant
 */

// Send message to AI
// POST /api/ai/chat
router.post('/chat', authenticate, authorizeStudent, sendMessage);

// Get chat history
// GET /api/ai/history
router.get('/history', authenticate, authorizeStudent, getChatHistory);

// Clear chat history
// DELETE /api/ai/history
router.delete('/history', authenticate, authorizeStudent, clearChatHistory);

module.exports = router;
