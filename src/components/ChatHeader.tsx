import React from 'react';

interface ChatHeaderProps {
  onRefresh: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onRefresh, onClose }) => {
  return (
    <div className="chat-header">
      <img
        src="https://assets.planungswelten.de/wp-content/uploads/2022/03/08172642/megawood_logo.png"
        alt="megawood"
        className="logo-img"
      />
      <div className="header-icons">
        <span
          onClick={onRefresh}
          title="Gespräch neu starten"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onRefresh()}
        >
          &#8634;
        </span>
        <span
          onClick={onClose}
          title="Chat schließen"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
        >
          &times;
        </span>
      </div>
    </div>
  );
};
