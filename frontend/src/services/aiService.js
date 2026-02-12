import api from './api';

const aiService = {
  // Send message to AI
  sendMessage: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },

  // Get chat history
  getChatHistory: async (limit = 50) => {
    const response = await api.get(`/ai/history?limit=${limit}`);
    return response.data;
  },

  // Clear chat history
  clearHistory: async () => {
    const response = await api.delete('/ai/history');
    return response.data;
  },
};

export default aiService;
