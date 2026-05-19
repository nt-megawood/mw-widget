import React, { useState } from 'react';
import type { Message } from '../../types';
import { renderMarkdown } from '../../utils/markdown';
import { speakText, stopSpeaking } from '../../utils/speech';
import type { WidgetLanguage } from '../../config/i18n';
import { UI_COPY, LOCALE_MAP } from '../../config/i18n';

const BASE_URL = import.meta.env.BASE_URL;

interface BotMessageProps {
  message: Message;
  conversationId?: string | null;
  onRespin?: () => void;
  disableRespin?: boolean;
  onShowInfoView?: () => void;
  language: WidgetLanguage;
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


const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"/>
    <path d="M3 22v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L21 8"/>
    <path d="M20.49 15a9 9 0 0 1-14.13 3.36L3 16"/>
  </svg>
);

const IconInfo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const IconChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconSpeak = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

export const BotMessage: React.FC<BotMessageProps> = ({
  message,
  conversationId,
  onRespin,
  disableRespin = false,
  onShowInfoView,
  language,
}) => {
  const copy = UI_COPY[language];
  const [thumbState, setThumbState] = useState<'up' | 'down' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSources, setShowSources] = useState(false);

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
        speakText(message.text, LOCALE_MAP[language]);
      } else {
        stopSpeaking();
      }
      return next;
    });
  };

  const handleThumb = (direction: 'up' | 'down') => {
    setThumbState((prev) => (prev === direction ? null : direction));
  };

  const formattedTime = message.timestamp.toLocaleTimeString(LOCALE_MAP[language], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="message-wrapper bot">
      <div className="bot-icon">
        <img src={`${BASE_URL}woody.png`} alt="Woody" />
      </div>
      <div className="bot-bubble-col">
        {message.sources && message.sources.length > 0 && (
          <details className="bot-sources" open={showSources}>
            <summary
              className="sources-summary"
              onClick={(event) => {
                event.preventDefault();
                setShowSources((prev) => !prev);
              }}
            >
              {/*<span className="sources-summary-icon" aria-hidden="true">
                <IconSearch />
              </span>*/}
              <span className="sources-summary-title">{copy.sourcesTitle}</span>
              <span className="sources-summary-chevron" aria-hidden="true">
                <IconChevronDown />
              </span>
            </summary>
            <div className="sources-content">
              {message.sources.map((url, i) => (
                <a key={i} className="source-item" href={url} target="_blank" rel="noopener noreferrer">
                  <span className="source-item-icon" aria-hidden="true">
                    <IconSearch />
                  </span>
                  <span className="source-item-url">{url}</span>
                </a>
              ))}
            </div>
          </details>
        )}
        <div className="bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
        <div className="bot-meta">
          <button
            className={`thumb-btn thumb-up${thumbState === 'up' ? ' active' : ''}`}
            onClick={() => handleThumb('up')}
            title={copy.thumbUpLabel}
            aria-label={copy.thumbUpLabel}
          >
            <IconThumbUp />
          </button>
          <button
            className={`thumb-btn thumb-down${thumbState === 'down' ? ' active' : ''}`}
            onClick={() => handleThumb('down')}
            title={copy.thumbDownLabel}
            aria-label={copy.thumbDownLabel}
          >
            <IconThumbDown />
          </button>
          <button
            className="copy-btn"
            onClick={handleCopy}
            title={copy.copyLabel}
            aria-label={copy.copyLabel}
          >
            {copied ? <IconCopied /> : <IconCopy />}
          </button>
          <button
            className={`speak-btn${isSpeaking ? ' active' : ''}`}
            onClick={handleSpeak}
            title={copy.speakLabel}
            aria-label={copy.speakLabel}
          >
            <IconSpeak />
          </button>
          <button
            className="respin-btn"
            onClick={onRespin}
            title={copy.respinLabel}
            aria-label={copy.respinLabel}
            type="button"
            disabled={disableRespin || !onRespin}
          >
            <IconRefresh />
          </button>
          <button
            className="info-btn"
            title={conversationId ? `${copy.contextIdLabel} ${conversationId}` : copy.noContextId}
            aria-label={conversationId ? `${copy.contextIdLabel} ${conversationId}` : copy.noContextId}
            type="button"
            onClick={onShowInfoView}
          >
            <IconInfo />
          </button>
          <span className="meta-brand">
            {copy.createdBy}
          </span>
          <span className="meta-time">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};
