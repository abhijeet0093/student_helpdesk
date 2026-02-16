import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await aiService.getChatHistory(50);
      if (response.success && response.data.messages) {
        // Convert backend messages to frontend format
        const formattedMessages = response.data.messages.map(msg => ({
          sender: msg.sender,
          text: msg.message,
          timestamp: msg.timestamp
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      // Don't show error for history load failure - just start fresh
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!inputMessage.trim()) {
      return;
    }

    if (inputMessage.trim().length < 3) {
      setError('Message must be at least 3 characters');
      return;
    }

    if (inputMessage.trim().length > 1000) {
      setError('Message is too long (max 1000 characters)');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');

    // Add student message immediately
    const studentMsg = {
      sender: 'student',
      text: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, studentMsg]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send message to backend
      const response = await aiService.sendMessage(userMessage);

      // Add AI response
      if (response.success && response.data.aiResponse) {
        const aiMsg = {
          sender: 'ai',
          text: response.data.aiResponse,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      // Handle error
      const errorMsg = err.response?.data?.message || 'Failed to get response. Please try again.';
      setError(errorMsg);
      
      // Add error message as AI response
      const errorAiMsg = {
        sender: 'ai',
        text: `Sorry, I encountered an error: ${errorMsg}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) {
      return;
    }

    try {
      await aiService.clearHistory();
      setMessages([]);
      setError('');
    } catch (err) {
      setError('Failed to clear history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-6 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto h-[85vh] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden flex-1">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🤖</div>
              <div>
                <h1 className="font-semibold text-lg">AI Study Assistant</h1>
                <p className="text-sm text-indigo-100">Always here to help</p>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !isTyping && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🤖</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Hello, {user?.fullName || 'Student'}!</h2>
                  <p className="text-gray-600 mb-4">I'm your AI study assistant. Ask me anything about:</p>
                  <div className="bg-white rounded-xl p-4 shadow-md text-left space-y-2">
                    <div className="flex items-center text-gray-700">
                      <span className="text-indigo-500 mr-2">•</span>
                      Study tips and techniques
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-indigo-500 mr-2">•</span>
                      Exam preparation strategies
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-indigo-500 mr-2">•</span>
                      Subject explanations
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-indigo-500 mr-2">•</span>
                      Time management
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="text-indigo-500 mr-2">•</span>
                      Academic guidance
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Type your question below to get started!</p>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md transition-all duration-300 ${
                    msg.sender === 'student'
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'student' ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg mb-3 animate-slide-up">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent px-4 py-3 transition-all duration-200"
                disabled={isTyping}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-indigo-600 text-white p-3 rounded-full hover:scale-110 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
