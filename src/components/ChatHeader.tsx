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
          className="header-pill-btn header-auth-btn"
          onClick={handleAuthAction}
          title={isLoggedIn ? copy.logoutAction : copy.loginAction}
          aria-label={isLoggedIn ? copy.logoutAction : copy.loginAction}
          type="button"
        >
          <svg className="auth-pill-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {isLoggedIn ? (
              <>
                <path d="M10 17V19C10 20.1 10.9 21 12 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3H12C10.9 3 10 3.9 10 5V7" />
                <path d="M15 12H3" />
                <path d="M7 8L3 12L7 16" />
              </>
            ) : (
              <>
                <path d="M14 17V19C14 20.1 13.1 21 12 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H12C13.1 3 14 3.9 14 5V7" />
                <path d="M9 12H21" />
                <path d="M17 8L21 12L17 16" />
              </>
            )}
          </svg>
          <span>{isLoggedIn ? copy.logout : copy.login}</span>
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
