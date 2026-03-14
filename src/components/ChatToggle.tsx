import React from 'react';
import woodyImg from '../../public/woody.jpg';

interface ChatToggleProps {
  onClick: () => void;
}

export const ChatToggle: React.FC<ChatToggleProps> = ({ onClick }) => {
  return (
    <div className="chat-toggle" onClick={onClick} role="button" aria-label="Chat öffnen" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <img src={woodyImg} alt="Woody" className="toggle-img" />
    </div>
  );
};
