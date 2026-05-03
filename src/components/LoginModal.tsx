import React, { useEffect, useState } from 'react';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
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
        aria-label="Einloggen"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="login-modal-close" type="button" onClick={onClose} aria-label="Schließen" title="Schließen">
          &times;
        </button>
        <div className="login-modal-header">
          <h3>Einloggen</h3>
          <p>Bitte melde dich mit deinem Benutzernamen und Passwort an.</p>
        </div>
        <form className="login-modal-form" onSubmit={handleSubmit}>
          <label className="login-modal-field">
            <span>Benutzername</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Benutzername"
              autoComplete="username"
            />
          </label>
          <label className="login-modal-field">
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Passwort"
              autoComplete="current-password"
            />
          </label>
          <div className="login-modal-actions">
            <button className="chat-btn login-modal-secondary" type="button" onClick={onClose}>
              Abbrechen
            </button>
            <button className="chat-btn login-modal-primary" type="submit">
              Anmelden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};