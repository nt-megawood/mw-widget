import React, { useRef, useCallback } from 'react';
import type { WidgetLanguage } from '../config/i18n';
import { UI_COPY } from '../config/i18n';

interface ChatFooterProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showLiveButton?: boolean;
  isLiveMode?: boolean;
  onToggleLiveMode?: () => void;
  liveStatusText?: string | null;
  language?: WidgetLanguage;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({
  onSend,
  disabled,
  placeholder,
  language = 'de',
  showLiveButton = false,
  isLiveMode = false,
  onToggleLiveMode,
  liveStatusText,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copy = UI_COPY[language];

  const handleSend = useCallback(() => {
    const text = textareaRef.current?.value.trim();
    if (!text || disabled) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  }, [onSend, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="chat-footer">
      <div className="chat-footer-input-row">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder ?? copy.inputPlaceholder}
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          disabled={disabled}
          aria-label={copy.inputLabel}
        />
        <button className="send-btn" onClick={handleSend} disabled={disabled} aria-label={copy.sendLabel}>
          ➤
        </button>
        {showLiveButton && (
          <button
            className={`live-btn${isLiveMode ? ' active' : ''}`}
            type="button"
            onClick={onToggleLiveMode}
            disabled={disabled && !isLiveMode}
            aria-label={isLiveMode ? 'Live-Chat beenden' : 'Live-Chat starten'}
            title={isLiveMode ? 'Live-Chat beenden' : 'Live-Chat starten'}
          >
            {isLiveMode ? 'Live an' : 'Live'}
          </button>
        )}
      </div>
      <div className="footer-tools">
        <span className="branding">{copy.aiDisclaimer}</span>
        {showLiveButton && liveStatusText && (
          <span className="live-status" role="status" aria-live="polite">{liveStatusText}</span>
        )}
      </div>
    </div>
  );
};
