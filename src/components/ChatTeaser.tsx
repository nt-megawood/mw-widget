import React from 'react';

interface ChatTeaserProps {
  title: string;
  text: string;
  onClose: () => void;
  onOpen: () => void;
}

export const ChatTeaser: React.FC<ChatTeaserProps> = ({ title, text, onClose, onOpen }) => {
  return (
    <div className="chat-teaser">
      <button className="teaser-close" onClick={onClose} aria-label="Schließen">&times;</button>
      <img src="/woody.jpg" alt="Woody" className="teaser-avatar" onClick={onOpen} style={{ cursor: 'pointer' }} />
      <span className="teaser-title">{title}</span>
      <p className="teaser-text">{text}</p>
    </div>
  );
};
