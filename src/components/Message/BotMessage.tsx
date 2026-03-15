import React, { useState } from 'react';
import type { Message } from '../../types';
import { renderMarkdown } from '../../utils/markdown';
import { speakText, stopSpeaking } from '../../utils/speech';
import { BrandPopup } from '../BrandPopup';

const BASE_URL = import.meta.env.BASE_URL;

interface BotMessageProps {
  message: Message;
}

const IconThumbUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

const IconThumbDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
);

const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const IconCopied = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconSpeak = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

export const BotMessage: React.FC<BotMessageProps> = ({ message }) => {
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBrandPopup, setShowBrandPopup] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleSpeak = () => {
    setIsSpeaking((prev) => {
      const next = !prev;
      if (next) {
        speakText(message.text);
      } else {
        stopSpeaking();
      }
      return next;
    });
  };

  const handleThumb = (direction: 'up' | 'down') => {
    setThumbState((prev) => (prev === direction ? null : direction));
  };

  const formattedTime = message.timestamp.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="message-wrapper bot">
      <div className="bot-icon">
        <img src={`${BASE_URL}woody.jpg`} alt="Woody" />
      </div>
      <div className="bot-bubble-col">
        <div className="bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
        {message.sources && message.sources.length > 0 && (
          <div className="bot-sources">
            <span className="sources-label">Quellen</span>
            {message.sources.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            ))}
          </div>
        )}
        <div className="bot-meta">
          <button
            className={`thumb-btn thumb-up${thumbState === 'up' ? ' active' : ''}`}
            onClick={() => handleThumb('up')}
            title="Hilfreich"
            aria-label="Hilfreich"
          >
            <IconThumbUp />
          </button>
          <button
            className={`thumb-btn thumb-down${thumbState === 'down' ? ' active' : ''}`}
            onClick={() => handleThumb('down')}
            title="Nicht hilfreich"
            aria-label="Nicht hilfreich"
          >
            <IconThumbDown />
          </button>
          <button
            className="copy-btn"
            onClick={handleCopy}
            title="Kopieren"
            aria-label="Kopieren"
          >
            {copied ? <IconCopied /> : <IconCopy />}
          </button>
          <button
            className={`speak-btn${isSpeaking ? ' active' : ''}`}
            onClick={handleSpeak}
            title="Vorlesen"
            aria-label="Vorlesen"
          >
            <IconSpeak />
          </button>
          <span
            className="meta-brand"
            onClick={() => setShowBrandPopup(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowBrandPopup(true)}
          >
            Erstellt von megawood KI
          </span>
          <span className="meta-time">{formattedTime}</span>
        </div>
      </div>
      {showBrandPopup && <BrandPopup onClose={() => setShowBrandPopup(false)} />}
    </div>
  );
};
