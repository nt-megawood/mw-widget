import React from 'react';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatTeaserProps {
  title: string;
  text: string;
  position: string;
  onClose: () => void;
  onOpen: () => void;
}

export const ChatTeaser: React.FC<ChatTeaserProps> = ({ title, text, position, onClose, onOpen }) => {
  return (
    <div className={`chat-teaser pos-${position}`}>
      <button className="teaser-close" onClick={onClose} aria-label="Schließen">&times;</button>
      <div className="teaser-header">
        <img src={`${BASE_URL}woody.png`} alt="Woody" className="teaser-avatar" onClick={onOpen} style={{ cursor: 'pointer' }} />
        <span className="teaser-title">{title}</span>
      </div>
      <p className="teaser-text">{text}</p>
    </div>
  );
};
