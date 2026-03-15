import React from 'react';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatToggleProps {
  onClick: () => void;
  position?: string;
}

export const ChatToggle: React.FC<ChatToggleProps> = ({ onClick, position = 'bottom-right' }) => {
  return (
    <div
      className={`chat-toggle pos-${position}`}
      onClick={onClick}
      role="button"
      aria-label="Chat öffnen"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <img src={`${BASE_URL}woody.jpg`} alt="Woody" className="toggle-img" />
    </div>
  );
};
