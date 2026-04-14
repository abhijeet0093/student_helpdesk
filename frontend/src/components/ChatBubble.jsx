import React from 'react';
import '../styles/AIChat.css';

const ChatBubble = ({ message }) => {
  // Support both object shape { text, sender, timestamp } and flat props
  const text = message?.text;
  const sender = message?.sender;
  const timestamp = message?.timestamp;

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('ChatBubble message:', message);

  return (
    <div className={`chat-bubble-container ${sender === 'student' ? 'student' : 'ai'}`}>
      <div className={`chat-bubble ${sender === 'student' ? 'student-bubble' : 'ai-bubble'}`}>
        <p className="chat-message">{text ?? ''}</p>
        <span className="chat-time">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
