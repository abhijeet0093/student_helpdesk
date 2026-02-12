import React from 'react';
import '../styles/AIChat.css';

const TypingIndicator = () => {
  return (
    <div className="chat-bubble-container ai">
      <div className="chat-bubble ai-bubble typing-indicator">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
