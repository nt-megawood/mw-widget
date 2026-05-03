import React from 'react';

interface ChatHeaderProps {
  onRefresh: () => void;
  onClose: () => void;
  onLoginClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onRefresh, onClose, onLoginClick }) => {
  return (
    <div className="chat-header">
      <img
        src="https://assets.planungswelten.de/wp-content/uploads/2022/03/08172642/megawood_logo.png"
        alt="megawood"
        className="logo-img"
      />
      <div className="header-actions">
        <button
          className="header-login-btn"
          onClick={onLoginClick}
          title="Einloggen"
          aria-label="Einloggen"
          type="button"
        >
          Login
        </button>
        <div className="header-icons">
          <button
            onClick={onRefresh}
            title="Gespräch neu starten"
            aria-label="Gespräch neu starten"
            type="button"
          >
            &#8634;
          </button>
          <button
            onClick={onClose}
            title="Chat schließen"
            aria-label="Chat schließen"
            type="button"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};
