import React, { useEffect, useState } from 'react';
import type { WidgetLanguage } from '../config/i18n';
import { UI_COPY } from '../config/i18n';

interface LoginModalProps {
  onClose: () => void;
  language: WidgetLanguage;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, language }) => {
  const copy = UI_COPY[language];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void username;
    void password;
    onClose();
  };

  return (
    <div className="login-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-label={copy.loginModalAriaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="login-modal-close" type="button" onClick={onClose} aria-label={copy.loginModalCloseLabel} title={copy.loginModalCloseLabel}>
          &times;
        </button>
        <div className="login-modal-header">
          <h3>{copy.loginModalHeading}</h3>
          <p>{copy.loginModalSubtitle}</p>
        </div>
        <form className="login-modal-form" onSubmit={handleSubmit}>
          <label className="login-modal-field">
            <span>{copy.loginModalUsernameLabel}</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={copy.loginModalUsernamePlaceholder}
              autoComplete="username"
            />
          </label>
          <label className="login-modal-field">
            <span>{copy.loginModalPasswordLabel}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={copy.loginModalPasswordPlaceholder}
              autoComplete="current-password"
            />
          </label>
          <div className="login-modal-actions">
            <button className="chat-btn login-modal-secondary" type="button" onClick={onClose}>
              {copy.loginModalCancelButton}
            </button>
            <button className="chat-btn login-modal-primary" type="submit">
              {copy.loginModalSubmitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};