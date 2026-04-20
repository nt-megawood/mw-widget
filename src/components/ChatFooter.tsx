import React, { useRef, useCallback } from 'react';

interface ChatFooterProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  conversationId?: string | null;
  placeholder?: string;
}

export const ChatFooter: React.FC<ChatFooterProps> = ({
  onSend,
  disabled,
  conversationId,
  placeholder = 'Stelle deine Frage...',
}) => {
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
      <div className="chat-footer-input-row">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          disabled={disabled}
          aria-label="Nachricht eingeben"
        />
        <button className="send-btn" onClick={handleSend} disabled={disabled} aria-label="Senden">
          ➤
        </button>
      </div>
      <div className="footer-tools">
        <span className="branding">KI-Unterstützung kann Fehler machen.</span>
        <span className="conversation-id">
          {conversationId ? `Kontext-ID: ${conversationId}` : 'Kontext-ID: –'}
        </span>
      </div>
    </div>
  );
};
