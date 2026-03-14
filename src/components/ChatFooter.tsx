import React, { useRef, useCallback } from 'react';

interface ChatFooterProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({ onSend, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <textarea
        ref={textareaRef}
        className="chat-input"
        placeholder="Nachricht eingeben…"
        rows={1}
        onKeyDown={handleKeyDown}
        onChange={handleInput}
        disabled={disabled}
        aria-label="Nachricht eingeben"
      />
      <button className="send-btn" onClick={handleSend} disabled={disabled} aria-label="Senden">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  );
};
