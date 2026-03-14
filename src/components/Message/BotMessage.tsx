import React, { useState } from 'react';
import type { Message } from '../../types';
import { renderMarkdown } from '../../utils/markdown';
import { speakText } from '../../utils/speech';
import { BrandPopup } from '../BrandPopup';

interface BotMessageProps {
  message: Message;
}

export const BotMessage: React.FC<BotMessageProps> = ({ message }) => {
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBrandPopup, setShowBrandPopup] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Copy failed');
    }
  };

  const handleSpeak = () => speakText(message.text);

  const handleThumb = (direction: 'up' | 'down') => {
    setThumbState((prev) => (prev === direction ? null : direction));
  };

  const formattedTime = message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="message-wrapper bot">
      <img src="/woody.jpg" alt="Woody" className="bot-avatar" />
      <div className="message-content">
        <div className="bubble bot-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
        {message.sources && message.sources.length > 0 && (
          <div className="bot-sources">
            <span className="sources-label">Quellen:</span>
            {message.sources.map((source, i) => (
              <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                {source.title}
              </a>
            ))}
          </div>
        )}
        <div className="bot-meta">
          <button
            className={`meta-btn thumb-btn ${thumbState === 'up' ? 'active' : ''}`}
            onClick={() => handleThumb('up')}
            title="Hilfreich"
            aria-label="Hilfreich"
          >👍</button>
          <button
            className={`meta-btn thumb-btn ${thumbState === 'down' ? 'active' : ''}`}
            onClick={() => handleThumb('down')}
            title="Nicht hilfreich"
            aria-label="Nicht hilfreich"
          >👎</button>
          <button className="meta-btn copy-btn" onClick={handleCopy} title="Kopieren" aria-label="Kopieren">
            {copied ? '✓' : '📋'}
          </button>
          <button className="meta-btn speak-btn" onClick={handleSpeak} title="Vorlesen" aria-label="Vorlesen">🔊</button>
          <button
            className="meta-btn meta-brand"
            onClick={() => setShowBrandPopup(true)}
            title="Über diesen Assistenten"
            aria-label="Über diesen Assistenten"
          >NT</button>
          <span className="meta-time">{formattedTime}</span>
        </div>
      </div>
      {showBrandPopup && <BrandPopup onClose={() => setShowBrandPopup(false)} />}
    </div>
  );
};
