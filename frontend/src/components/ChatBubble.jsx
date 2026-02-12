import React from 'react';
import '../styles/AIChat.css';

const ChatBubble = ({ message, sender, timestamp }) => {
  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-bubble-container ${sender === 'student' ? 'student' : 'ai'}`}>
      <div className={`chat-bubble ${sender === 'student' ? 'student-bubble' : 'ai-bubble'}`}>
        <p className="chat-message">{message}</p>
        <span className="chat-time">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
