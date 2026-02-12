const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { generateAIResponse, validateMessage } = require('../services/aiService');

// Rate limiting storage (in-memory - use Redis in production)
const messageRateLimits = new Map();

/**
 * SEND MESSAGE TO AI
 * POST /api/ai/chat
 */
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const studentId = req.userId;

    // Validate message
    const validation = validateMessage(message);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Rate limiting check
    const rateLimitKey = `student_${studentId}`;
    const now = Date.now();
    const oneMinute = 60 * 1000;

    if (!messageRateLimits.has(rateLimitKey)) {
      messageRateLimits.set(rateLimitKey, []);
    }

    const userMessages = messageRateLimits.get(rateLimitKey);
    
    // Remove messages older than 1 minute
    const recentMessages = userMessages.filter(timestamp => now - timestamp < oneMinute);
    
    // Check if exceeded limit (max 10 messages per minute)
    if (recentMessages.length >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Too many messages. Please wait a moment before sending more.'
      });
    }

    // Add current message timestamp
    recentMessages.push(now);
    messageRateLimits.set(rateLimitKey, recentMessages);

    // Find or create chat session
    let session = await ChatSession.findOne({ studentId: studentId })
      .sort({ lastActiveAt: -1 });

    if (!session) {
      session = await ChatSession.create({
        studentId: studentId,
        createdAt: Date.now(),
        lastActiveAt: Date.now()
      });
    } else {
      // Update last active time
      await session.updateActivity();
    }

    // Store student message
    const studentMessage = await ChatMessage.create({
      sessionId: session._id,
      sender: 'student',
      messageText: message,
      createdAt: Date.now()
    });

    // Get recent chat history for context (last 5 messages)
    const recentHistory = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('sender messageText');

    // Generate AI response
    const aiResponseText = await generateAIResponse(message, recentHistory);

    // Store AI response
    const aiMessage = await ChatMessage.create({
      sessionId: session._id,
      sender: 'ai',
      messageText: aiResponseText,
      createdAt: Date.now()
    });

    // Return response
    res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        studentMessage: {
          id: studentMessage._id,
          text: studentMessage.messageText,
          timestamp: studentMessage.createdAt
        },
        aiResponse: {
          id: aiMessage._id,
          text: aiMessage.messageText,
          timestamp: aiMessage.createdAt
        }
      }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your message. Please try again.'
    });
  }
};

/**
 * GET CHAT HISTORY
 * GET /api/ai/history
 */
const getChatHistory = async (req, res) => {
  try {
    const studentId = req.userId;
    const { limit = 50 } = req.query;

    // Find student's session
    const session = await ChatSession.findOne({ studentId: studentId })
      .sort({ lastActiveAt: -1 });

    if (!session) {
      return res.status(200).json({
        success: true,
        data: {
          messages: []
        }
      });
    }

    // Get messages
    const messages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit))
      .select('sender messageText createdAt');

    res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        messages: messages.map(msg => ({
          id: msg._id,
          sender: msg.sender,
          text: msg.messageText,
          timestamp: msg.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

/**
 * CLEAR CHAT HISTORY
 * DELETE /api/ai/history
 */
const clearChatHistory = async (req, res) => {
  try {
    const studentId = req.userId;

    // Find student's session
    const session = await ChatSession.findOne({ studentId: studentId })
      .sort({ lastActiveAt: -1 });

    if (!session) {
      return res.status(200).json({
        success: true,
        message: 'No chat history to clear'
      });
    }

    // Delete all messages in the session
    await ChatMessage.deleteMany({ sessionId: session._id });

    // Delete the session
    await ChatSession.findByIdAndDelete(session._id);

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Clear Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
};
