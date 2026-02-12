import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import aiService from '../services/aiService';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import '../styles/AIChat.css';

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
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
    <div className="ai-chat-container">
      {/* Header */}
      <header className="chat-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back
        </button>
        <div className="chat-header-info">
          <h1>AI Study Assistant</h1>
          <p>Ask me anything about your studies</p>
        </div>
        <button onClick={handleClearHistory} className="clear-btn">
          Clear
        </button>
      </header>

      {/* Chat Messages Area */}
      <main className="chat-messages">
        {messages.length === 0 && !isTyping && (
          <div className="chat-welcome">
            <div className="welcome-icon">🤖</div>
            <h2>Hello, {user?.fullName || 'Student'}!</h2>
            <p>I'm your AI study assistant. Ask me anything about:</p>
            <ul>
              <li>Study tips and techniques</li>
              <li>Exam preparation strategies</li>
              <li>Subject explanations</li>
              <li>Time management</li>
              <li>Academic guidance</li>
            </ul>
            <p className="welcome-note">Type your question below to get started!</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            message={msg.text}
            sender={msg.sender}
            timestamp={msg.timestamp}
          />
        ))}

        {isTyping && <TypingIndicator />}
        
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="chat-input-area">
        {error && (
          <div className="chat-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
            disabled={isTyping}
            maxLength={1000}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={isTyping || !inputMessage.trim()}
          >
            {isTyping ? '...' : '➤'}
          </button>
        </form>
        <p className="input-hint">
          Press Enter to send • Shift+Enter for new line
        </p>
      </footer>
    </div>
  );
};

export default AIChat;
