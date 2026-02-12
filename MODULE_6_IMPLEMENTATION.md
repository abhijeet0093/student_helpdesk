# Module 6: AI Student Assistant - Implementation Guide

## Overview

This module provides an AI-based academic assistant for students to ask study-related questions, get concept explanations, and receive exam preparation guidance.

---

## 🎯 Implemented Features

### 1. **Chat System**
- Send messages to AI assistant
- Receive AI-generated responses
- Store chat history per student
- Session-based conversation tracking

### 2. **Rate Limiting**
- Maximum 10 messages per minute per student
- Prevents spam and abuse
- In-memory rate limiting (can be upgraded to Redis)

### 3. **Message Validation**
- Minimum length: 3 characters
- Maximum length: 1000 characters
- Empty message rejection
- Basic academic content check

### 4. **Chat History**
- View previous conversations
- Retrieve last 50 messages (configurable)
- Clear chat history option
- Automatic session management

### 5. **Security**
- Only authenticated students can access
- Students can only view their own chat history
- JWT token required for all endpoints

---

## 📁 Files Created

### Models
- `backend/models/ChatSession.js` - Chat session schema
- `backend/models/ChatMessage.js` - Individual message schema

### Services
- `backend/services/aiService.js` - AI response generation logic

### Controllers
- `backend/controllers/aiController.js` - Chat operations

### Routes
- `backend/routes/aiRoutes.js` - AI endpoints

### Updates
- `backend/server.js` - Added AI routes
- `backend/test-api.http` - Added AI endpoint tests

---

## 🗄️ Database Schema

### ChatSession Model
```javascript
{
  studentId: ObjectId,        // Reference to Student
  createdAt: Date,           // Session creation time
  lastActiveAt: Date         // Last message time
}
```

**Purpose:** Tracks chat sessions for each student. One student can have multiple sessions over time.

### ChatMessage Model
```javascript
{
  sessionId: ObjectId,       // Reference to ChatSession
  sender: String,            // "student" or "ai"
  messageText: String,       // Message content (max 1000 chars)
  createdAt: Date           // Message timestamp
}
```

**Purpose:** Stores individual messages in a conversation.

---

## 🔌 API Endpoints

### Send Message to AI
```
POST /api/ai/chat
Headers: Authorization: Bearer <student_token>

Body:
{
  "message": "How can I prepare for my upcoming exams?"
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "65a1b2c3d4e5f6789abcdef0",
    "studentMessage": {
      "id": "...",
      "text": "How can I prepare for my upcoming exams?",
      "timestamp": "2024-02-08T12:00:00Z"
    },
    "aiResponse": {
      "id": "...",
      "text": "To prepare effectively for exams:\n\n1. Create a study schedule...",
      "timestamp": "2024-02-08T12:00:01Z"
    }
  }
}
```

### Get Chat History
```
GET /api/ai/history
Headers: Authorization: Bearer <student_token>

Query Parameters (optional):
- limit: Number of messages to retrieve (default: 50)

Response:
{
  "success": true,
  "data": {
    "sessionId": "65a1b2c3d4e5f6789abcdef0",
    "messages": [
      {
        "id": "...",
        "sender": "student",
        "text": "How can I prepare for exams?",
        "timestamp": "2024-02-08T12:00:00Z"
      },
      {
        "id": "...",
        "sender": "ai",
        "text": "To prepare effectively...",
        "timestamp": "2024-02-08T12:00:01Z"
      }
    ]
  }
}
```

### Clear Chat History
```
DELETE /api/ai/history
Headers: Authorization: Bearer <student_token>

Response:
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

---

## 🤖 AI Service Logic

### Current Implementation
The AI service is **abstracted and mocked** for easy integration with any AI provider.

**File:** `backend/services/aiService.js`

**Functions:**
1. `generateAIResponse(message, chatHistory)` - Generates AI response
2. `validateMessage(message)` - Validates message content

### Mock Response Logic
Currently uses pattern-based responses:
- Exam preparation queries → Study tips
- Explanation requests → Clarification prompts
- Study technique queries → Learning strategies
- General doubts → Supportive guidance

### Integration with Real AI

To integrate with actual AI (OpenAI, Google Gemini, etc.):

```javascript
// In aiService.js, replace generateMockResponse with:

const generateAIResponse = async (studentMessage, chatHistory) => {
  try {
    // Example: OpenAI Integration
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an academic assistant for college students. Provide helpful, clear explanations for study-related questions."
        },
        ...chatHistory.map(msg => ({
          role: msg.sender === 'student' ? 'user' : 'assistant',
          content: msg.messageText
        })),
        {
          role: "user",
          content: studentMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};
```

---

## 🔒 Security Features

### 1. **Authentication Required**
- All endpoints require JWT token
- Only students can access (not admin/staff)
- Token verified by `authenticate` middleware

### 2. **Authorization**
- Students can only access their own chat history
- Session filtering by studentId
- No cross-student data access

### 3. **Rate Limiting**
- Maximum 10 messages per minute
- Prevents spam and abuse
- Per-student tracking

### 4. **Input Validation**
- Message length limits (3-1000 characters)
- Empty message rejection
- Basic content validation

### 5. **Data Privacy**
- Each student has isolated chat sessions
- No shared chat history
- Secure message storage

---

## 🔄 Data Flow

### Workflow: Student Sends Message

```
1. Student sends message
   → POST /api/ai/chat
   → Headers: JWT token

2. Middleware validates token
   → authenticate() extracts studentId
   → authorizeStudent() checks role

3. Controller validates message
   → Check length (3-1000 chars)
   → Check rate limit (10/min)
   → Reject if invalid

4. Find or create session
   → Query: ChatSession.findOne({ studentId })
   → If not found, create new session
   → Update lastActiveAt

5. Store student message
   → Create ChatMessage document
   → sender: "student"
   → Link to session

6. Get chat context
   → Fetch last 5 messages
   → Pass to AI service

7. Generate AI response
   → Call aiService.generateAIResponse()
   → Pattern-based or API call
   → Return response text

8. Store AI response
   → Create ChatMessage document
   → sender: "ai"
   → Link to session

9. Return to client
   → Both messages with timestamps
   → Session ID for reference
```

### Workflow: Get Chat History

```
1. Student requests history
   → GET /api/ai/history
   → Headers: JWT token

2. Middleware validates
   → Extract studentId from token

3. Find student's session
   → Query: ChatSession.findOne({ studentId })
   → Sort by lastActiveAt (most recent)

4. Fetch messages
   → Query: ChatMessage.find({ sessionId })
   → Sort by createdAt (chronological)
   → Limit to 50 messages

5. Return formatted data
   → Array of messages
   → Each with sender, text, timestamp
```

---

## 🧪 Testing

### Test Message Sending

```bash
# 1. Login as student
POST http://localhost:3001/api/auth/student/login
Body: {
  "rollNumber": "CS2024001",
  "password": "Test@123"
}

# Save the token

# 2. Send message to AI
POST http://localhost:3001/api/ai/chat
Headers: Authorization: Bearer <student_token>
Body: {
  "message": "How can I prepare for exams?"
}

# 3. View response
# AI will return study tips and guidance
```

### Test Chat History

```bash
# Get chat history
GET http://localhost:3001/api/ai/history
Headers: Authorization: Bearer <student_token>

# Should return all previous messages
```

### Test Rate Limiting

```bash
# Send 11 messages quickly
# 11th message should be rejected with:
# "Too many messages. Please wait a moment."
```

### Test Validation

```bash
# Empty message
POST http://localhost:3001/api/ai/chat
Body: { "message": "" }
# Response: "Message cannot be empty"

# Too long message (>1000 chars)
POST http://localhost:3001/api/ai/chat
Body: { "message": "very long text..." }
# Response: "Message is too long"
```

---

## 📊 Rate Limiting Details

### Current Implementation
- **Storage:** In-memory Map
- **Limit:** 10 messages per minute per student
- **Window:** Rolling 60-second window
- **Cleanup:** Automatic removal of old timestamps

### Production Upgrade
For production, use Redis:

```javascript
// Example with Redis
const redis = require('redis');
const client = redis.createClient();

const checkRateLimit = async (studentId) => {
  const key = `ratelimit:${studentId}`;
  const count = await client.incr(key);
  
  if (count === 1) {
    await client.expire(key, 60); // 60 seconds
  }
  
  return count <= 10;
};
```

---

## 🎯 Key Features

✅ Chat-based AI assistant
✅ Academic-focused responses
✅ Message validation
✅ Rate limiting (10/min)
✅ Chat history storage
✅ Session management
✅ Student-only access
✅ Mock AI responses (ready for real AI)
✅ Clear history option

---

## 🔧 Configuration

### Message Limits
```javascript
// In aiService.js
const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 3;

// In aiController.js
const MAX_MESSAGES_PER_MINUTE = 10;
```

### Chat History Limit
```javascript
// In aiController.js
const DEFAULT_HISTORY_LIMIT = 50;
```

---

## 🚀 Future Enhancements

### Potential Improvements (Not Implemented)
- Real AI API integration (OpenAI, Gemini)
- Redis-based rate limiting
- Message search functionality
- Export chat history
- Subject-specific AI models
- Voice input support
- Image-based questions

---

## 📝 Sample Interactions

### Example 1: Exam Preparation
```
Student: "How can I prepare for my upcoming exams?"

AI: "To prepare effectively for exams:

1. Create a study schedule
2. Review your notes regularly
3. Practice previous year questions
4. Focus on understanding concepts
5. Take short breaks during study
6. Get enough sleep before exam

Which subject are you preparing for?"
```

### Example 2: Concept Explanation
```
Student: "Can you explain algorithms?"

AI: "I'd be happy to explain! To help you better:

1. Which subject or topic?
2. What specific concept?
3. What you already know?

This will help me give you a clear explanation."
```

### Example 3: Study Tips
```
Student: "What are good study techniques?"

AI: "Here are effective study techniques:

1. Active Recall: Test yourself
2. Spaced Repetition: Review at intervals
3. Pomodoro Technique: 25 min study, 5 min break
4. Teach Others: Explain concepts
5. Make Notes: Write summaries

What subject would you like to focus on?"
```

---

## ✨ Summary

Module 6 is complete with:
- ✅ Chat session management
- ✅ Message storage and retrieval
- ✅ AI response generation (mocked)
- ✅ Rate limiting
- ✅ Input validation
- ✅ Student-only access
- ✅ Chat history management

**Status:** Fully functional backend ready for:
1. Frontend chat interface integration
2. Real AI API integration (OpenAI, Gemini, etc.)
3. Production deployment

**Next Step:** Integrate with actual AI API or develop frontend chat UI! 🎉
