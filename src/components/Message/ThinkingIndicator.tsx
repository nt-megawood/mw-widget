import React from 'react';

interface ThinkingIndicatorProps {
  text: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ text }) => {
  return (
    <div className="message-wrapper bot thinking-wrapper">
      <img src="/woody.jpg" alt="Woody" className="bot-avatar" />
      <div className="thinking-indicator">
        <span className="thinking-text">{text}</span>
        <span className="thinking-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  );
};
