/**
 * AI Service — Gemini 2.5 Flash via REST API
 */

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Generate AI response using Gemini API
 * @param {string} studentMessage
 * @param {Array} chatHistory - previous ChatMessage documents for context
 * @returns {string} AI response text
 */
const generateAIResponse = async (studentMessage, chatHistory = []) => {
  if (!studentMessage || studentMessage.trim() === '') {
    return 'Please enter a question.';
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured.');
  }

  console.log('AI Input:', studentMessage);

  // Build conversation history for context
  const history = chatHistory
    .slice(-10)
    .map(msg => ({
      role: msg.sender === 'student' ? 'user' : 'model',
      parts: [{ text: msg.messageText || msg.text || '' }],
    }))
    .filter(msg => msg.parts[0].text.trim() !== '');

  const body = {
    system_instruction: {
      parts: [{
        text: 'You are a helpful academic assistant for college students. Answer any academic or educational question clearly and concisely — including programming, science, math, history, and general knowledge. Keep your answers within 200–300 words unless the topic genuinely requires more detail.'
      }]
    },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: studentMessage }] }
    ],
    generationConfig: { maxOutputTokens: 1024 }
  };

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Gemini API Error:', JSON.stringify(data.error));
    const status = data.error?.status;
    if (status === 'RESOURCE_EXHAUSTED') {
      throw new Error('AI quota exceeded. Please try again later.');
    }
    throw new Error(data.error?.message || 'Gemini API request failed.');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log('AI Response:', text?.substring(0, 100));

  if (!text || text.trim() === '') {
    return "Sorry, I couldn't generate a response. Please try again.";
  }

  return text;
};

/**
 * Validate message content
 */
const validateMessage = (message) => {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (message.length > 1000) {
    return { valid: false, error: 'Message is too long. Please keep it under 1000 characters.' };
  }
  if (message.trim().length < 3) {
    return { valid: false, error: 'Message is too short. Please provide more details.' };
  }
  return { valid: true };
};

module.exports = { generateAIResponse, validateMessage };
