import React from 'react';
import woodyImg from '../../../public/woody.jpg';

interface ThinkingIndicatorProps {
  text: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ text }) => {
  return (
    <div className="message-wrapper bot thinking-wrapper">
      <img src={woodyImg} alt="Woody" className="bot-avatar" />
      <div className="thinking-indicator">
        <span className="thinking-text">{text}</span>
        <span className="thinking-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  );
};
