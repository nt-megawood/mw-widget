import React from 'react';
import type { WidgetLanguage } from '../config/i18n';
import { UI_COPY } from '../config/i18n';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatToggleProps {
  onClick: () => void;
  position?: string;
  language?: WidgetLanguage;
}

export const ChatToggle: React.FC<ChatToggleProps> = ({ onClick, position = 'bottom-right', language = 'de' }) => {
  const copy = UI_COPY[language];
  return (
    <div
      className={`chat-toggle pos-${position}`}
      onClick={onClick}
      role="button"
      aria-label={copy.openChatLabel}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <img src={`${BASE_URL}woody.jpg`} alt="Woody" className="toggle-img" />
    </div>
  );
};
