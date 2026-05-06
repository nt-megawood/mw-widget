import React, { useRef, useCallback, useState } from 'react';
import type { WidgetLanguage } from '../config/i18n';
import { UI_COPY } from '../config/i18n';

interface ChatFooterProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showLiveButton?: boolean;
  isLiveMode?: boolean;
  onToggleLiveMode?: () => void;
  isGenerating?: boolean;
  onCancelGeneration?: () => void;
  liveStatusText?: string | null;
  language?: WidgetLanguage;
  prefillInput?: string;
}

const IconSend = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h13" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const IconStop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="24" height="24" rx="3" />
  </svg>
);

export const ChatFooter: React.FC<ChatFooterProps> = ({
  onSend,
  disabled,
  placeholder,
  language = 'de',
  showLiveButton = false,
  isLiveMode = false,
  onToggleLiveMode,
  isGenerating = false,
  onCancelGeneration,
  liveStatusText,
  prefillInput,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const copy = UI_COPY[language];

  React.useEffect(() => {
    if (typeof prefillInput === 'string' && prefillInput.trim().length > 0) {
      setInputValue(prefillInput);
      if (textareaRef.current) {
        textareaRef.current.value = prefillInput;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        textareaRef.current.focus();
      }
    }
  }, [prefillInput]);

  const handleSend = useCallback(() => {
    const text = textareaRef.current?.value.trim();
    if (!text || disabled) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
    setInputValue('');
  }, [onSend, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const hasText = inputValue.trim().length > 0;
  const showSendOrCancelButton = hasText || isGenerating;

  return (
    <div className="chat-footer">
      <div className="chat-footer-input-row">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder ?? copy.inputPlaceholder}
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          value={inputValue}
          disabled={disabled}
          aria-label={copy.inputLabel}
        />
        {showSendOrCancelButton ? (
          <button
            className={`send-btn${isGenerating ? ' cancel-btn' : ''}`}
            type="button"
            onClick={isGenerating ? onCancelGeneration : handleSend}
            disabled={isGenerating ? !onCancelGeneration : disabled}
            aria-label={isGenerating ? 'Antwort abbrechen' : copy.sendLabel}
            title={isGenerating ? 'Antwort abbrechen' : copy.sendLabel}
          >
            {isGenerating ? <IconStop /> : <IconSend />}
          </button>
        ) : showLiveButton && (
          <button
            className={`live-btn live-icon-btn${isLiveMode ? ' active' : ''}`}
            type="button"
            onClick={onToggleLiveMode}
            disabled={disabled && !isLiveMode}
            aria-label={isLiveMode ? 'Live-Chat beenden' : 'Live-Chat starten'}
            title={isLiveMode ? 'Live-Chat beenden' : 'Live-Chat starten'}
          >
            <span className="live-bars" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </span>
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
