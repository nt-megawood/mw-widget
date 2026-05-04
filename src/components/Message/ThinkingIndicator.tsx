import React from 'react';

const BASE_URL = import.meta.env.BASE_URL;

interface ThinkingIndicatorProps {
  text: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ text }) => {
  return (
    <div className="message-wrapper bot thinking-wrapper">
      <div className="bot-icon">
        <img src={`${BASE_URL}woody.png`} alt="Woody" />
      </div>
      <div className="thinking-indicator">
        <span className="thinking-text">{text}</span>
        <span className="thinking-dots">
          <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
        </span>
      </div>
    </div>
  );
};
