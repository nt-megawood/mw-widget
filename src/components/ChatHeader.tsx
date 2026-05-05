import React from 'react';
import { clearAuthData, useAuth } from '../hooks/useAuth';
import type { WidgetLanguage } from '../config/i18n';
import { UI_COPY } from '../config/i18n';

interface ChatHeaderProps {
  onRefresh: () => void;
  onClose: () => void;
  onLoginClick: () => void;
  language: WidgetLanguage;
  onLanguageChange: (language: WidgetLanguage) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onRefresh, onClose, onLoginClick, language, onLanguageChange }) => {
  const copy = UI_COPY[language];
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
        <select
          className="header-language-select"
          value={language}
          onChange={(event) => onLanguageChange(event.target.value as WidgetLanguage)}
          aria-label="Language"
        >
          <option value="de">Deutsch</option>
          <option value="en">English</option>
        </select>
        <button
          className="header-login-btn"
          onClick={handleAuthAction}
          title={isLoggedIn ? copy.logoutAction : copy.loginAction}
          aria-label={isLoggedIn ? copy.logoutAction : copy.loginAction}
          type="button"
        >
          {isLoggedIn ? copy.logout : copy.login}
        </button>
        <div className="header-icons">
          <button
            onClick={onRefresh}
            title={copy.restartConversation}
            aria-label={copy.restartConversation}
            type="button"
          >
            &#8634;
          </button>
          <button
            onClick={onClose}
            title={copy.closeChat}
            aria-label={copy.closeChat}
            type="button"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  );
};
