import React from 'react';
import { clearAuthData, useAuth } from '../hooks/useAuth';

interface ChatHeaderProps {
  onRefresh: () => void;
  onClose: () => void;
  onLoginClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onRefresh, onClose, onLoginClick }) => {
  const authData = useAuth();
  const isLoggedIn = Boolean(authData);

  const handleAuthAction = () => {
    if (isLoggedIn) {
      clearAuthData();
      return;
    }

    onLoginClick();
  };

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
          onClick={handleAuthAction}
          title={isLoggedIn ? 'Ausloggen' : 'Einloggen'}
          aria-label={isLoggedIn ? 'Ausloggen' : 'Einloggen'}
          type="button"
        >
          {isLoggedIn ? 'Logout' : 'Login'}
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
