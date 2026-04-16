const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const { generateAIResponse, validateMessage } = require('../services/aiService');

const AI_RATE_LIMIT = 10;       // max messages per window
const RATE_WINDOW_MS = 60_000;  // 1 minute

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

    // Persistent rate limiting — count student messages in the last minute via MongoDB
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS);
    const recentCount = await ChatMessage.countDocuments({
      sender: 'student',
      createdAt: { $gte: windowStart },
      // join via session to scope to this student
      sessionId: {
        $in: await ChatSession.distinct('_id', { studentId })
      }
    });

    if (recentCount >= AI_RATE_LIMIT) {
      return res.status(429).json({
        success: false,
        message: 'Too many messages. Please wait a moment before sending more.'
      });
    }

    // Find or create chat session
    let session = await ChatSession.findOne({ studentId: studentId })
      .sort({ lastActiveAt: -1 });

    if (!session) {
      session = await ChatSession.create({ studentId: studentId });
    } else {
      // Update last active time
      await session.updateActivity();
    }

    // Store student message — let Mongoose set createdAt via default
    const studentMessage = await ChatMessage.create({
      sessionId: session._id,
      sender: 'student',
      messageText: message
    });

    // Get recent chat history for context (last 5 messages)
    const recentHistory = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('sender messageText');

    // Generate AI response
    const aiResponseText = await generateAIResponse(message, recentHistory);

    // Safety trim: ensure AI response doesn't exceed DB limit (5000 chars)
    const safeAiText = aiResponseText.length > 5000
      ? aiResponseText.substring(0, 5000)
      : aiResponseText;

    if (aiResponseText.length > 5000) {
      console.warn(`AI response trimmed from ${aiResponseText.length} to 5000 chars for session ${session._id}`);
    }

    // Store AI response — use a timestamp guaranteed to be after the student message
    let aiMessage = null;
    try {
      aiMessage = await ChatMessage.create({
        sessionId: session._id,
        sender: 'ai',
        messageText: safeAiText
        // createdAt intentionally omitted — Mongoose default ensures it's after studentMessage
      });
      console.log(`AI message saved successfully (${safeAiText.length} chars)`);
    } catch (dbError) {
      console.error('Failed to save AI message to DB:', dbError.message);
      // Continue — still return AI response to frontend
    }

    // Return response — use safeAiText so UI and DB are always in sync
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
          id: aiMessage?._id || null,
          text: safeAiText,
          timestamp: aiMessage?.createdAt || new Date()
        }
      }
    });

  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process your message. Please try again.'
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
