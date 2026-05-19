import React, { useEffect, useRef } from 'react';
import { useMemo, useState } from 'react';
import type { InputRequest, Message } from '../types';
import { BotMessage } from './Message/BotMessage';
import { UserMessage } from './Message/UserMessage';
import { ThinkingIndicator } from './Message/ThinkingIndicator';
import { UI_COPY, type UiCopy, type WidgetLanguage } from '../config/i18n';

interface ChatBodyProps {
  messages: Message[];
  isThinking: boolean;
  thinkingText: string;
  initialGreeting: React.ReactNode;
  inputRequest?: InputRequest | null;
  onSubmitInputRequest: (payloadText: string) => void;
  onDealerLocationSubmit: (city: string, postalCode: string) => void;
  conversationId?: string | null;
  onRespinLastAnswer?: () => void;
  disableRespin?: boolean;
  language: WidgetLanguage;
}

function FormSketch({ form, copy }: { form?: InputRequest['form']; copy: UiCopy }): React.ReactElement | null {
  const content = useMemo(() => {
    if (!form) {
      return null;
    }
    if (form === 'rechteck') {
      return (
        <svg viewBox="0 0 180 120" className="dimension-sketch-svg" aria-label={copy.shapeRectangleAriaLabel}>
          <rect x="25" y="20" width="130" height="80" fill="#fff" stroke="#b4032f" strokeWidth="2" />
          <text x="90" y="14" textAnchor="middle">Seite A</text>
          <text x="12" y="64" textAnchor="middle" transform="rotate(-90 12 64)">Seite B</text>
        </svg>
      );
    }
    if (form === 'lform') {
      return (
        <svg viewBox="0 0 180 130" className="dimension-sketch-svg" aria-label={copy.shapeLAriaLabel}>
          <path d="M20 20 H120 V60 H80 V110 H20 Z" fill="#fff" stroke="#b4032f" strokeWidth="2" />
          <text x="70" y="14" textAnchor="middle">Seite A</text>
          <text x="10" y="64" textAnchor="middle" transform="rotate(-90 10 64)">Seite B</text>
          <text x="104" y="74" textAnchor="middle">Seite C</text>
          <text x="86" y="120" textAnchor="middle">Seite D</text>
        </svg>
      );
    }
    if (form === 'uform') {
      return (
        <svg viewBox="0 0 190 130" className="dimension-sketch-svg" aria-label={copy.shapeUAriaLabel}>
          <path d="M20 20 H170 V110 H130 V60 H60 V110 H20 Z" fill="#fff" stroke="#b4032f" strokeWidth="2" />
          <text x="44" y="14" textAnchor="middle">Seite A</text>
          <text x="10" y="64" textAnchor="middle" transform="rotate(-90 10 64)">Seite B</text>
          <text x="96" y="54" textAnchor="middle">Seite C</text>
          <text x="180" y="64" textAnchor="middle" transform="rotate(-90 180 64)">Seite D</text>
          <text x="146" y="14" textAnchor="middle">Seite E</text>
          <text x="96" y="120" textAnchor="middle">Seite F</text>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 190 130" className="dimension-sketch-svg" aria-label={copy.shapeOAriaLabel}>
        <rect x="20" y="20" width="150" height="90" fill="#fff" stroke="#b4032f" strokeWidth="2" />
        <rect x="65" y="45" width="60" height="40" fill="#fafafa" stroke="#b4032f" strokeWidth="1.5" />
        <text x="43" y="14" textAnchor="middle">Seite A</text>
        <text x="147" y="14" textAnchor="middle">Seite B</text>
        <text x="43" y="124" textAnchor="middle">Seite C</text>
        <text x="147" y="124" textAnchor="middle">Seite D</text>
        <text x="10" y="66" textAnchor="middle" transform="rotate(-90 10 66)">Seite E</text>
        <text x="180" y="66" textAnchor="middle" transform="rotate(-90 180 66)">Seite F</text>
      </svg>
    );
  }, [form, copy]);

  return <div className="dimension-sketch">{content}</div>;
}

function DimensionInputCard({
  request,
  onSubmit,
  copy,
}: {
  request: InputRequest;
  onSubmit: (payloadText: string) => void;
  copy: UiCopy;
}): React.ReactElement {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = (): void => {
    const pairs: string[] = [];
    const readablePairs: string[] = [];
    for (const field of request.fields) {
      const raw = (values[field.key] || '').trim().replace(',', '.');
      const num = Number(raw);
      if (!Number.isFinite(num) || num <= 0) {
        return;
      }
      pairs.push(`${field.key}=${num}`);
      readablePairs.push(`${field.label}: ${num} m`);
    }
    if (pairs.length !== request.fields.length) {
      return;
    }
    onSubmit(`Für ${request.form} gelten folgende Maße: ${readablePairs.join(', ')}.`);
    setValues({});
  };

  return (
    <div className="dimension-input-card" aria-label={copy.dimensionCardAriaLabel}>
      <strong>{request.title || copy.dimensionInputFallbackTitle}</strong>
      <FormSketch form={request.form} copy={copy} />
      <div className="dimension-input-grid">
        {request.fields.map((field) => (
          <label key={field.key} className="dimension-input-field">
            <span>{field.label}</span>
            <input
              type="number"
              min="0.1"
              step="0.01"
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={copy.dimensionPlaceholder}
            />
          </label>
        ))}
      </div>
      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>{copy.dimensionSubmitButton}</button>
    </div>
  );
}

function DealerLocationInputCard({
  request,
  onResolve,
  copy,
}: {
  request: InputRequest;
  onResolve: (city: string, postalCode: string) => void;
  copy: UiCopy;
}): React.ReactElement {
  const [values, setValues] = useState<Record<string, string>>({});

  const city = (values.city || '').trim();
  const postalCode = (values.postal_code || '').trim();

  const handleSubmit = (): void => {
    if (!city && !postalCode) {
      return;
    }
    onResolve(city, postalCode);
    setValues({});
  };

  return (
    <div className="dimension-input-card" aria-label={copy.dealerCardAriaLabel}>
      <strong>{request.title || copy.dealerInputFallbackTitle}</strong>
      <div className="dimension-input-grid dealer-input-grid">
        {request.fields.map((field) => (
          <label key={field.key} className="dimension-input-field">
            <span>{field.label}</span>
            <input
              type="text"
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.key === 'postal_code' ? copy.dealerPostalPlaceholder : copy.dealerCityPlaceholder}
            />
          </label>
        ))}
      </div>
      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>{copy.dealerSubmitButton}</button>
    </div>
  );
}

function PlanningCodeInputCard({
  request,
  onSubmit,
  copy,
}: {
  request: InputRequest;
  onSubmit: (payloadText: string) => void;
  copy: UiCopy;
}): React.ReactElement {
  const [planningCode, setPlanningCode] = useState('');

  const handleSubmit = (): void => {
    const code = planningCode.trim();
    if (!/^mgw[a-z0-9]{4,}$/i.test(code)) {
      return;
    }
    onSubmit(`Bitte lade meine bestehende Planung mit dem Planungscode ${code} und zeige mir danach passende Änderungsoptionen.`);
    setPlanningCode('');
  };

  return (
    <div className="dimension-input-card" aria-label={copy.planningCodeCardAriaLabel}>
      <strong>{request.title || copy.planningCodeInputFallbackTitle}</strong>
      <div className="dimension-input-grid dealer-input-grid">
        <label className="dimension-input-field">
          <span>{copy.planningCodeLabel}</span>
          <input
            type="text"
            value={planningCode}
            onChange={(e) => setPlanningCode(e.target.value)}
            placeholder={copy.planningCodePlaceholder}
          />
        </label>
      </div>
      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>{copy.planningCodeLoadButton}</button>
    </div>
  );
}

export const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  isThinking,
  thinkingText,
  initialGreeting,
  inputRequest,
  onSubmitInputRequest,
  onDealerLocationSubmit,
  conversationId,
  onRespinLastAnswer,
  disableRespin = false,
  language,
}) => {
  const copy = UI_COPY[language];
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isInfoViewOpen, setIsInfoViewOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isInfoViewOpen]);

  if (isInfoViewOpen) {
    return (
      <div className="chat-body">
        <div style={{placeContent: "center", display: "flex"}}>
          <img width={"50px"} src='woody.png' alt="Woody" />
        </div>
        <div className="brand-info-view" role="region" aria-label={copy.infoViewAriaLabel}>
          <button
            className="brand-info-view-close"
            onClick={() => setIsInfoViewOpen(false)}
            aria-label={copy.infoViewBackLabel}
            title={copy.infoViewBackLabel}
            type="button"
          >
            &times;
          </button>
          <p>{copy.infoViewDescription}</p>
          <div className="brand-info-view-context">
            <strong>{copy.infoViewContextIdLabel}</strong> {conversationId || copy.infoViewNoContextId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-body">
      {initialGreeting}
      {messages.map((message) =>
        message.role === 'bot' ? (
          message.text === '' ? null : (
          <BotMessage
            key={message.id}
            message={message}
            conversationId={conversationId}
            onRespin={onRespinLastAnswer}
            disableRespin={disableRespin}
            onShowInfoView={() => setIsInfoViewOpen(true)}
            language={language}
          />
          )
        ) : (
          <UserMessage key={message.id} message={message} />
        )
      )}
      {messages.length > 0 && inputRequest?.type === 'dimension_input' && (
        <DimensionInputCard request={inputRequest} onSubmit={onSubmitInputRequest} copy={copy} />
      )}
      {messages.length > 0 && inputRequest?.type === 'dealer_location_input' && (
        <DealerLocationInputCard request={inputRequest} onResolve={onDealerLocationSubmit} copy={copy} />
      )}
      {inputRequest?.type === 'planning_code_input' && (
        <PlanningCodeInputCard request={inputRequest} onSubmit={onSubmitInputRequest} copy={copy} />
      )}
      {isThinking && <ThinkingIndicator text={thinkingText} />}
      <div ref={bottomRef} />
    </div>
  );
};
