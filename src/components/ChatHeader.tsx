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
  const nextLanguage: WidgetLanguage = language === 'de' ? 'en' : 'de';

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
          className="header-pill-btn"
          onClick={() => onLanguageChange(nextLanguage)}
          title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
          aria-label={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
          type="button"
        >
          {language.toUpperCase()}
        </button>
        <button
          className="header-pill-btn"
          onClick={handleAuthAction}
          title={isLoggedIn ? copy.logoutAction : copy.loginAction}
          aria-label={isLoggedIn ? copy.logoutAction : copy.loginAction}
          type="button"
        >
          {isLoggedIn ? '↪' : '↩'}
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
