/**
 * AI Service
 * Handles AI response generation for student queries
 * This is an abstracted service - can be replaced with actual AI API
 */

/**
 * Generate AI response for student query
 * @param {String} studentMessage - Student's question
 * @param {Array} chatHistory - Previous messages for context (optional)
 * @returns {String} AI response
 */
const generateAIResponse = async (studentMessage, chatHistory = []) => {
  try {
    // Basic input validation
    if (!studentMessage || studentMessage.trim().length === 0) {
      throw new Error('Empty message');
    }

    // Check if message is academic-related (basic keyword check)
    const academicKeywords = [
      'study', 'exam', 'test', 'subject', 'topic', 'learn', 'understand',
      'explain', 'concept', 'question', 'doubt', 'help', 'prepare',
      'chapter', 'lesson', 'assignment', 'homework', 'practice', 'revision',
      'math', 'science', 'physics', 'chemistry', 'biology', 'computer',
      'programming', 'algorithm', 'formula', 'theory', 'definition'
    ];

    const messageWords = studentMessage.toLowerCase().split(' ');
    const isAcademic = academicKeywords.some(keyword => 
      messageWords.some(word => word.includes(keyword))
    );

    if (!isAcademic && studentMessage.length < 50) {
      return "I'm here to help with your studies! Please ask me academic questions related to your subjects, exam preparation, or concepts you'd like to understand better.";
    }

    // TODO: Replace this with actual AI API call
    // Example: OpenAI, Google Gemini, or custom AI model
    // const response = await callAIAPI(studentMessage, chatHistory);

    // Mock AI response for now
    const mockResponse = generateMockResponse(studentMessage);

    return mockResponse;

  } catch (error) {
    console.error('AI Service Error:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Generate mock AI response
 * This simulates AI behavior - replace with actual AI integration
 * @param {String} message - Student message
 * @returns {String} Mock response
 */
const generateMockResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  // Pattern-based responses for common queries
  if (lowerMessage.includes('exam') || lowerMessage.includes('prepare')) {
    return "To prepare effectively for exams:\n\n1. Create a study schedule\n2. Review your notes regularly\n3. Practice previous year questions\n4. Focus on understanding concepts, not just memorizing\n5. Take short breaks during study sessions\n6. Get enough sleep before the exam\n\nWhich subject are you preparing for? I can give you more specific tips!";
  }

  if (lowerMessage.includes('explain') || lowerMessage.includes('understand')) {
    return "I'd be happy to explain! To help you better, could you please specify:\n\n1. Which subject or topic?\n2. What specific concept you're struggling with?\n3. What you already know about it?\n\nThis will help me give you a clear, step-by-step explanation.";
  }

  if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
    return "Here are some effective study techniques:\n\n1. **Active Recall**: Test yourself instead of just reading\n2. **Spaced Repetition**: Review material at increasing intervals\n3. **Pomodoro Technique**: Study for 25 minutes, break for 5\n4. **Teach Others**: Explaining concepts helps you understand better\n5. **Make Notes**: Write summaries in your own words\n\nWhat subject would you like to focus on?";
  }

  if (lowerMessage.includes('doubt') || lowerMessage.includes('question')) {
    return "I'm here to help clear your doubts! Please share:\n\n1. The subject and topic\n2. Your specific question\n3. What part is confusing you\n\nDon't hesitate to ask - there are no silly questions in learning!";
  }

  // Default academic response
  return "I'm your academic assistant! I can help you with:\n\n✓ Understanding difficult concepts\n✓ Exam preparation strategies\n✓ Study tips and techniques\n✓ Subject-specific guidance\n✓ Clarifying doubts\n\nPlease ask me any academic question, and I'll do my best to help you!";
};

/**
 * Validate message content
 * @param {String} message - Message to validate
 * @returns {Object} Validation result
 */
const validateMessage = (message) => {
  // Check if empty
  if (!message || message.trim().length === 0) {
    return {
      valid: false,
      error: 'Message cannot be empty'
    };
  }

  // Check length
  if (message.length > 1000) {
    return {
      valid: false,
      error: 'Message is too long. Please keep it under 1000 characters.'
    };
  }

  // Check minimum length
  if (message.trim().length < 3) {
    return {
      valid: false,
      error: 'Message is too short. Please provide more details.'
    };
  }

  return {
    valid: true
  };
};

module.exports = {
  generateAIResponse,
  validateMessage
};
