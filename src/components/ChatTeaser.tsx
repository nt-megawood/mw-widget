import React from 'react';
import type { WidgetLanguage } from '../config/i18n';
import { UI_COPY } from '../config/i18n';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatTeaserProps {
  title: string;
  text: string;
  position: string;
  onClose: () => void;
  onOpen: () => void;
  language: WidgetLanguage;
}

export const ChatTeaser: React.FC<ChatTeaserProps> = ({ title, text, position, onClose, onOpen, language }) => {
  const copy = UI_COPY[language];
  return (
    <div className={`chat-teaser pos-${position}`}>
      <button className="teaser-close" onClick={onClose} aria-label={copy.teaserCloseLabel}>&times;</button>
      <div className="teaser-header">
        <img src={`${BASE_URL}woody.png`} alt="Woody" className="teaser-avatar" onClick={onOpen} style={{ cursor: 'pointer' }} />
        <span className="teaser-title">{title}</span>
      </div>
      <p className="teaser-text">{text}</p>
    </div>
  );
};
