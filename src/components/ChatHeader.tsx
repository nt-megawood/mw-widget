import React from 'react';

interface ChatHeaderProps {
  onRefresh: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onRefresh, onClose }) => {
  return (
    <div className="chat-header">
      <div className="chat-header-logo">
        <span className="chat-header-title">megawood® Assistent</span>
      </div>
      <div className="chat-header-actions">
        <button className="icon-btn refresh-btn" onClick={onRefresh} title="Gespräch neu starten" aria-label="Gespräch neu starten">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <button className="icon-btn close-btn" onClick={onClose} title="Chat schließen" aria-label="Chat schließen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
