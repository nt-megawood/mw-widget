import React, { useEffect, useRef } from 'react';
import { useMemo, useState } from 'react';
import type { InputRequest, Message, QuickReplyAction, QuickReplyOption } from '../types';
import { BotMessage } from './Message/BotMessage';
import { UserMessage } from './Message/UserMessage';
import { ThinkingIndicator } from './Message/ThinkingIndicator';
import { useAuth } from '../hooks/useAuth';

export interface QuickReply {
  label: string;
  message: string;
  action?: QuickReplyAction;
}

interface ChatBodyProps {
  messages: Message[];
  isThinking: boolean;
  thinkingText: string;
  initialGreeting: React.ReactNode;
  quickReplies: QuickReply[];
  contextualQuickReplies?: QuickReplyOption[];
  inputRequest?: InputRequest | null;
  onQuickReply: (reply: QuickReplyOption) => void;
  onSubmitInputRequest: (payloadText: string) => void;
  conversationId?: string | null;
}

function FormSketch({ form }: { form?: InputRequest['form'] }) {
  const content = useMemo(() => {
    if (!form) {
      return null;
    }
    if (form === 'rechteck') {
      return (
        <svg viewBox="0 0 180 120" className="dimension-sketch-svg" aria-label="Rechteck mit Seitenmarkierung">
          <rect x="25" y="20" width="130" height="80" fill="#fff" stroke="#b4032f" strokeWidth="2" />
          <text x="90" y="14" textAnchor="middle">Seite A</text>
          <text x="12" y="64" textAnchor="middle" transform="rotate(-90 12 64)">Seite B</text>
        </svg>
      );
    }
    if (form === 'lform') {
      return (
        <svg viewBox="0 0 180 130" className="dimension-sketch-svg" aria-label="L-Form mit Seitenmarkierungen">
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
        <svg viewBox="0 0 190 130" className="dimension-sketch-svg" aria-label="U-Form mit Seitenmarkierungen">
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
      <svg viewBox="0 0 190 130" className="dimension-sketch-svg" aria-label="O-Form mit Seitenmarkierungen">
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
  }, [form]);

  return <div className="dimension-sketch">{content}</div>;
}

function DimensionInputCard({ request, onSubmit }: { request: InputRequest; onSubmit: (payloadText: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = () => {
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
    <div className="dimension-input-card" aria-label="Maßeingabe">
      <strong>{request.title || 'Bitte gib die Maße ein.'}</strong>
      <FormSketch form={request.form} />
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
              placeholder="z.B. 4.2"
            />
          </label>
        ))}
      </div>
      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>Maße übernehmen</button>
    </div>
  );
}

function DealerLocationInputCard({ request, onSubmit }: { request: InputRequest; onSubmit: (payloadText: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});

  const city = (values.city || '').trim();
  const postalCode = (values.postal_code || '').trim();

  const handleSubmit = () => {
    if (!city && !postalCode) {
      return;
    }
    onSubmit(
      `Ich möchte einen Händler in meiner Nähe finden. Stadt: ${city || '-'}, Postleitzahl: ${postalCode || '-'}.`
    );
    setValues({});
  };

  return (
    <div className="dimension-input-card" aria-label="Standort-Eingabe für Händlersuche">
      <strong>{request.title || 'Bitte gib Stadt oder Postleitzahl ein.'}</strong>
      <div className="dimension-input-grid dealer-input-grid">
        {request.fields.map((field) => (
          <label key={field.key} className="dimension-input-field">
            <span>{field.label}</span>
            <input
              type="text"
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.key === 'postal_code' ? 'z. B. 33442' : 'z. B. Rheda-Wiedenbrück'}
            />
          </label>
        ))}
      </div>
      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>Händler suchen</button>
    </div>
  );
}

function PlanningCodeInputCard({ request, onSubmit }: { request: InputRequest; onSubmit: (payloadText: string) => void }) {
  const [planningCode, setPlanningCode] = useState('');

  const handleSubmit = () => {
    const code = planningCode.trim();
    if (!/^mgw[a-z0-9]{4,}$/i.test(code)) {
      return;
    }
    onSubmit(`Bitte lade meine bestehende Planung mit dem Planungscode ${code} und zeige mir danach passende Änderungsoptionen.`);
    setPlanningCode('');
  };

  return (
    <div className="dimension-input-card" aria-label="Planungscode-Eingabe">
      <strong>{request.title || 'Bitte gib deinen Planungscode ein.'}</strong>
      <div className="dimension-input-grid dealer-input-grid">
        <label className="dimension-input-field">
          <span>Planungscode</span>
          <input
            type="text"
            value={planningCode}
            onChange={(e) => setPlanningCode(e.target.value)}
            placeholder="z. B. mgw150823"
          />
        </label>
      </div>
      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>Planung laden</button>
    </div>
  );
}

function splitName(fullName: string): { vorname: string; nachname: string } {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { vorname: parts[0] || '', nachname: '' };
  }
  return { vorname: parts[0], nachname: parts.slice(1).join(' ') };
}

interface MusterBestellungPosition {
  diele: string;
  farbe: string;
  menge: string;
}

interface MusterBestellungState {
  anrede: string;
  vorname: string;
  nachname: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  stadt: string;
  land: string;
  positionen: MusterBestellungPosition[];
}

const DEFAULT_MUSTER_POSITION: MusterBestellungPosition = {
  diele: '',
  farbe: '',
  menge: '1',
};

function MusterBestellungInputCard({ request, onSubmit }: { request: InputRequest; onSubmit: (payloadText: string) => void }) {
  const auth = useAuth();
  const authName = splitName(auth?.user?.name || '');
  const [state, setState] = useState<MusterBestellungState>(() => ({
    anrede: '',
    vorname: authName.vorname,
    nachname: authName.nachname,
    strasse: auth?.user?.profile?.address1 || '',
    hausnummer: auth?.user?.profile?.address2 || '',
    plz: auth?.user?.profile?.postal_code || '',
    stadt: auth?.user?.profile?.city || '',
    land: auth?.user?.profile?.country || 'DE',
    positionen: [{ ...DEFAULT_MUSTER_POSITION }],
  }));

  useEffect(() => {
    if (!auth?.user) return;
    const nextName = splitName(auth.user.name || '');
    setState((prev) => ({
      ...prev,
      vorname: prev.vorname || nextName.vorname,
      nachname: prev.nachname || nextName.nachname,
      strasse: prev.strasse || auth.user.profile?.address1 || '',
      hausnummer: prev.hausnummer || auth.user.profile?.address2 || '',
      plz: prev.plz || auth.user.profile?.postal_code || '',
      stadt: prev.stadt || auth.user.profile?.city || '',
      land: prev.land || auth.user.profile?.country || 'DE',
    }));
  }, [auth]);

  const updateField = (key: keyof Omit<MusterBestellungState, 'positionen'>, value: string) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const updatePosition = (index: number, key: keyof MusterBestellungPosition, value: string) => {
    setState((prev) => ({
      ...prev,
      positionen: prev.positionen.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const addPosition = () => {
    setState((prev) => ({
      ...prev,
      positionen: [...prev.positionen, { ...DEFAULT_MUSTER_POSITION }],
    }));
  };

  const removePosition = (index: number) => {
    setState((prev) => ({
      ...prev,
      positionen: prev.positionen.length > 1 ? prev.positionen.filter((_, itemIndex) => itemIndex !== index) : prev.positionen,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      anrede: state.anrede.trim(),
      vorname: state.vorname.trim(),
      nachname: state.nachname.trim(),
      strasse: state.strasse.trim(),
      hausnummer: state.hausnummer.trim(),
      plz: state.plz.trim(),
      stadt: state.stadt.trim(),
      land: state.land.trim() || 'DE',
      positionen: state.positionen
        .map((item) => ({
          diele: item.diele.trim(),
          farbe: item.farbe.trim(),
          menge: Number(item.menge || '1') || 1,
        }))
        .filter((item) => item.diele || item.farbe),
    };

    if (!payload.vorname || !payload.nachname || !payload.strasse || !payload.hausnummer || !payload.plz || !payload.stadt) {
      return;
    }

    if (payload.positionen.length === 0) {
      return;
    }

    onSubmit(`MUSTER_BESTELLUNG_JSON: ${JSON.stringify(payload)}`);
    setState((prev) => ({
      ...prev,
      positionen: [{ ...DEFAULT_MUSTER_POSITION }],
    }));
  };

  return (
    <div className="dimension-input-card muster-order-card" aria-label="Musterbestellung">
      <strong>{request.title || 'Kostenfreies Muster bestellen'}</strong>
      <div className="muster-order-address-grid">
        <label className="dimension-input-field">
          <span>Anrede</span>
          <input value={state.anrede} onChange={(e) => updateField('anrede', e.target.value)} placeholder="Herr/Frau" />
        </label>
        <label className="dimension-input-field">
          <span>Vorname</span>
          <input value={state.vorname} onChange={(e) => updateField('vorname', e.target.value)} placeholder="Max" />
        </label>
        <label className="dimension-input-field">
          <span>Nachname</span>
          <input value={state.nachname} onChange={(e) => updateField('nachname', e.target.value)} placeholder="Mustermann" />
        </label>
        <label className="dimension-input-field">
          <span>Straße</span>
          <input value={state.strasse} onChange={(e) => updateField('strasse', e.target.value)} placeholder="Musterstraße" />
        </label>
        <label className="dimension-input-field">
          <span>Hausnummer</span>
          <input value={state.hausnummer} onChange={(e) => updateField('hausnummer', e.target.value)} placeholder="12a" />
        </label>
        <label className="dimension-input-field">
          <span>PLZ</span>
          <input value={state.plz} onChange={(e) => updateField('plz', e.target.value)} placeholder="33442" />
        </label>
        <label className="dimension-input-field">
          <span>Stadt</span>
          <input value={state.stadt} onChange={(e) => updateField('stadt', e.target.value)} placeholder="Herzebrock-Clarholz" />
        </label>
        <label className="dimension-input-field">
          <span>Land</span>
          <input value={state.land} onChange={(e) => updateField('land', e.target.value)} placeholder="DE" />
        </label>
      </div>

      <div className="muster-order-position-list">
        {state.positionen.map((position, index) => (
          <div key={`position-${index}`} className="muster-order-position-row">
            <label className="dimension-input-field">
              <span>Diele</span>
              <input value={position.diele} onChange={(e) => updatePosition(index, 'diele', e.target.value)} placeholder="z. B. PREMIUM 21x145" />
            </label>
            <label className="dimension-input-field">
              <span>Farbe</span>
              <input value={position.farbe} onChange={(e) => updatePosition(index, 'farbe', e.target.value)} placeholder="z. B. Naturbraun" />
            </label>
            <label className="dimension-input-field">
              <span>Menge</span>
              <input type="number" min="1" value={position.menge} onChange={(e) => updatePosition(index, 'menge', e.target.value)} />
            </label>
            <button className="chat-btn muster-position-remove-btn" type="button" onClick={() => removePosition(index)} disabled={state.positionen.length === 1}>
              Entfernen
            </button>
          </div>
        ))}
        <button className="chat-btn muster-position-add-btn" type="button" onClick={addPosition}>Weitere Diele hinzufügen</button>
      </div>

      <button className="chat-btn dimension-submit-btn" onClick={handleSubmit}>Muster bestellen</button>
    </div>
  );
}

export const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  isThinking,
  thinkingText,
  initialGreeting,
  quickReplies,
  contextualQuickReplies = [],
  inputRequest,
  onQuickReply,
  onSubmitInputRequest,
  conversationId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="chat-body">
      {initialGreeting}
      {messages.length === 0 && quickReplies.length > 0 && (
        <div className="button-group">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              className="chat-btn"
              onClick={() => onQuickReply({
                label: reply.label,
                message: reply.message,
                action: reply.action || 'send_message',
              })}
            >
              {reply.label}
            </button>
          ))}
        </div>
      )}
      {messages.map((message) =>
        message.role === 'bot' ? (
          <BotMessage key={message.id} message={message} conversationId={conversationId} />
        ) : (
          <UserMessage key={message.id} message={message} />
        )
      )}
      {messages.length > 0 && contextualQuickReplies.length > 0 && (
        <div className="button-group contextual-button-group" aria-label="Antwortmöglichkeiten">
          {contextualQuickReplies.map((reply, i) => (
            <button key={`${reply.label}-${i}`} className="chat-btn" onClick={() => onQuickReply(reply)}>
              {reply.label}
            </button>
          ))}
        </div>
      )}
      {messages.length > 0 && inputRequest?.type === 'dimension_input' && (
        <DimensionInputCard request={inputRequest} onSubmit={onSubmitInputRequest} />
      )}
      {messages.length > 0 && inputRequest?.type === 'dealer_location_input' && (
        <DealerLocationInputCard request={inputRequest} onSubmit={onSubmitInputRequest} />
      )}
      {inputRequest?.type === 'planning_code_input' && (
        <PlanningCodeInputCard request={inputRequest} onSubmit={onSubmitInputRequest} />
      )}
      {messages.length > 0 && inputRequest?.type === 'muster_bestellen_input' && (
        <MusterBestellungInputCard request={inputRequest} onSubmit={onSubmitInputRequest} />
      )}
      {isThinking && <ThinkingIndicator text={thinkingText} />}
      <div ref={bottomRef} />
    </div>
  );
};
