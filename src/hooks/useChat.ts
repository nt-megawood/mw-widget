import { useState, useCallback, useRef, useEffect } from 'react';
import type { InputRequest, Message, QuickReplyOption } from '../types';
import { generateUUID } from '../utils/uuid';
import { sendMessage as apiSendMessage } from '../services/api';

const THINKING_MESSAGES = [
  'Woody denkt nach',
  'Ich suche die beste Antwort',
  'Moment, ich frage meine Datenbank',
  'Fast fertig',
  'Ich analysiere deine Frage',
];

const INPUT_FIELDS_BY_FORM: Record<string, Array<{ key: string; label: string }>> = {
  rechteck: [
    { key: 'rechteck_mass_1', label: 'Seite A (Breite, m)' },
    { key: 'rechteck_mass_2', label: 'Seite B (Länge, m)' },
  ],
  lform: [
    { key: 'l_width_1', label: 'Seite A (m)' },
    { key: 'l_length_1', label: 'Seite B (m)' },
    { key: 'l_width_2', label: 'Seite C (m)' },
    { key: 'l_length_2', label: 'Seite D (m)' },
  ],
  uform: [
    { key: 'u_width_1', label: 'Seite A (m)' },
    { key: 'u_length_1', label: 'Seite B (m)' },
    { key: 'u_width_2', label: 'Seite C (m)' },
    { key: 'u_length_2', label: 'Seite D (m)' },
    { key: 'u_width_3', label: 'Seite E (m)' },
    { key: 'u_length_3', label: 'Seite F (m)' },
  ],
  oform: [
    { key: 'o_length_1', label: 'Seite A (oben links, m)' },
    { key: 'o_length_2', label: 'Seite B (oben rechts, m)' },
    { key: 'o_length_3', label: 'Seite C (unten links, m)' },
    { key: 'o_length_4', label: 'Seite D (unten rechts, m)' },
    { key: 'o_width_1', label: 'Seite E (links, m)' },
    { key: 'o_width_2', label: 'Seite F (rechts, m)' },
  ],
};

function detectFormFromText(text: string): 'rechteck' | 'lform' | 'uform' | 'oform' | null {
  const source = String(text || '').toLowerCase();
  const matches: Array<{ form: 'rechteck' | 'lform' | 'uform' | 'oform'; idx: number }> = [];
  const patterns: Array<{ form: 'rechteck' | 'lform' | 'uform' | 'oform'; pattern: RegExp }> = [
    { form: 'rechteck', pattern: /\brechteck(?:form)?\b/g },
    { form: 'lform', pattern: /\bl\s*-?\s*form\b|\blform\b/g },
    { form: 'uform', pattern: /\bu\s*-?\s*form\b|\buform\b/g },
    { form: 'oform', pattern: /\bo\s*-?\s*form\b|\boform\b/g },
  ];

  for (const { form, pattern } of patterns) {
    for (const match of source.matchAll(pattern)) {
      const idx = typeof match.index === 'number' ? match.index : -1;
      if (idx >= 0) matches.push({ form, idx });
    }
  }
  if (!matches.length) return null;
  matches.sort((a, b) => b.idx - a.idx);
  return matches[0].form;
}

function normalizeInputRequestFromResponse(answer: string, inputRequest?: InputRequest | null): InputRequest | null {
  if (!inputRequest) return null;
  if (inputRequest.type !== 'dimension_input') return inputRequest;

  const lowerAnswer = String(answer || '').toLowerCase();
  if (/\bmgw[a-z0-9]{4,}\b/.test(lowerAnswer)) {
    return null;
  }
  if (
    lowerAnswer.includes('dielenprodukt')
    || lowerAnswer.includes('welche diele')
    || lowerAnswer.includes('dielenfarbe')
    || lowerAnswer.includes('profilfarbe')
    || lowerAnswer.includes('unterkonstruktion')
  ) {
    return null;
  }

  const detectedForm = detectFormFromText(answer);
  if (!detectedForm) return inputRequest;

  if (inputRequest.form === detectedForm) {
    return inputRequest;
  }

  return {
    ...inputRequest,
    form: detectedForm,
    fields: INPUT_FIELDS_BY_FORM[detectedForm] || inputRequest.fields,
    title: 'Bitte gib die Maße für diese Form an.',
  };
}

function extractVariantChoicesFromAnswer(answer: string): string[] {
  const source = String(answer || '');
  const regex = /\b(PREMIUM(?:\s+PLUS)?|SIGNUM|DYNUM|CLASSIC|DELTA)\s*(21x145|21x242|25x293)\b/gi;
  const seen = new Set<string>();
  const variants: string[] = [];
  for (const match of source.matchAll(regex)) {
    const value = `${String(match[1] || '').toUpperCase()} ${String(match[2] || '').trim()}`.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    variants.push(value);
  }
  return variants;
}

function buildProfileQuickReplies(answer: string): QuickReplyOption[] {
  const codeMatch = String(answer || '').match(/\b(mgw[a-z0-9]{4,})\b/i);
  const code = codeMatch?.[1];
  const codePrefix = code ? `bei ${code} ` : '';
  return [
    { label: 'Bronze', message: `Bitte ändere ${codePrefix}die Profilfarbe auf bronze.`, action: 'send_message' },
    { label: 'Silber', message: `Bitte ändere ${codePrefix}die Profilfarbe auf silver (Silber).`, action: 'send_message' },
    { label: 'Anthrazit', message: `Bitte ändere ${codePrefix}die Profilfarbe auf anthracite (Anthrazit).`, action: 'send_message' },
  ];
}

const KNOWN_COLOR_LABELS = [
  'Naturbraun',
  'Nussbraun',
  'Basaltgrau',
  'Lavabraun',
  'Schiefergrau',
  'Amber Tan',
  'Amber Chocolate',
  'Amber Grey',
  'Muskat',
  'Tonka',
  'Schokoschwarz',
  'Malui grau',
  'Mentha Nigra',
  'Anise',
  'Terra',
  'Graphit',
  'Braun',
  'Grau',
  'Cardamom',
  'Nigella',
  'Sel gris',
  'Ingwer',
  'Lorbeer',
  'Ecru',
  'Jade',
  'Platin',
  'Umbra',
  'Varia Grau',
  'Varia Braun',
  'Fokus gruen',
  'Fokus braun',
  'Fokus grau',
  'Fokus Schokoschwarz',
  'Gruenschwarz',
];

function extractColorChoicesFromAnswer(answer: string): string[] {
  const source = String(answer || '');
  const lower = source.toLowerCase();
  const found: Array<{ label: string; index: number }> = [];

  for (const label of KNOWN_COLOR_LABELS) {
    const idx = lower.indexOf(label.toLowerCase());
    if (idx >= 0) {
      found.push({ label, index: idx });
    }
  }

  found.sort((a, b) => a.index - b.index);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const entry of found) {
    const key = entry.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(entry.label);
  }
  return unique;
}

function buildFallbackQuickReplies(answer: string, fromApi?: QuickReplyOption[]): QuickReplyOption[] {
  const lower = String(answer || '').toLowerCase();
  const existingCode = extractPlanningCode(answer);

  const asksForPlanningCode =
    lower.includes('planungscode')
    && (lower.includes('nenne') || lower.includes('gib') || lower.includes('hast') || lower.includes('angeben'));
  if (asksForPlanningCode) {
    return [{ label: 'Planungscode eingeben', message: '', action: 'request_planning_code_input' }];
  }

  const looksLikeLoadedExistingPlan =
    !!existingCode
    && (lower.includes('wurde erfolgreich geladen')
      || (lower.includes('planung mit dem code') && lower.includes('geladen'))
      || (lower.includes('planung mit dem code') && lower.includes('aufgerufen'))
      || (lower.includes('planungscode') && lower.includes('geladen'))
      || lower.includes('bestehende planung')
      || lower.includes('details zu deiner aktuellen planung')
      || lower.includes('möchtest du an dieser planung etwas ändern')
      || lower.includes('moechtest du an dieser planung etwas aendern'));
  if (looksLikeLoadedExistingPlan && existingCode) {
    return [
      {
        label: 'Form/Maße ändern',
        message: `Ich möchte bei ${existingCode} Form/Maße ändern. Bitte zeige mir dafür passende Optionen als Buttons.`,
        action: 'send_message',
      },
      {
        label: 'Diele/Farbe ändern',
        message: `Ich möchte bei ${existingCode} Diele/Farbe ändern. Bitte zeige mir dafür passende Optionen als Buttons.`,
        action: 'send_message',
      },
      {
        label: 'Profilfarbe anpassen',
        message: `Ich möchte bei ${existingCode} die Profilfarbe anpassen. Bitte nenne mir alle verfügbaren Optionen und stelle passende Buttons bereit.`,
        action: 'send_message',
      },
      {
        label: 'Unterkonstruktion ändern',
        message: `Ich möchte bei ${existingCode} die Unterkonstruktion ändern. Bitte nenne mir alle verfügbaren Optionen und stelle passende Buttons bereit.`,
        action: 'send_message',
      },
      {
        label: 'Bauplan als PDF',
        message: '',
        action: 'open_url',
        url: `https://betaplaner.megawood.com/api/bauplan/pdf/${existingCode}`,
      },
      {
        label: 'Materialliste als PDF',
        message: '',
        action: 'open_url',
        url: `https://betaplaner.megawood.com/api/materialliste/pdf/${existingCode}`,
      },
      {
        label: 'Händler in meiner Nähe finden',
        message: '',
        action: 'request_location_input',
      },
    ];
  }

  const mentionsProfileMenu =
    (lower.includes('profilfarbe anpassen') || lower.includes('profil ändern') || lower.includes('profil aendern'))
    || (
      (lower.includes('gehrungsprofil') || lower.includes('profilfarbe'))
      && (
        lower.includes('welche dieser farben')
        || lower.includes('welche profilfarbe')
        || lower.includes('für welche farbe')
        || lower.includes('fuer welche farbe')
      )
      && (lower.includes('bronze') || lower.includes('silber') || lower.includes('silver') || lower.includes('anthrazit') || lower.includes('anthracite'))
    );

  if (mentionsProfileMenu) {
    const required = ['bronze', 'silber', 'anthrazit'];
    const labels = (fromApi || []).map((item) => String(item.label || '').toLowerCase());
    const hasAll = required.every((token) => labels.some((label) => label.includes(token)));
    if (hasAll) return fromApi || [];
    return buildProfileQuickReplies(answer);
  }

  const variantChoices = extractVariantChoicesFromAnswer(answer);
  const asksVariantChoice =
    variantChoices.length >= 2
    && (
      lower.includes('variante')
      || lower.includes('varianten')
      || lower.includes('welches dielenprodukt')
      || lower.includes('welches produkt')
      || lower.includes('dielenprodukt darf es sein')
      || lower.includes('welches dielenprodukt darf es sein')
      || lower.includes('wähle bitte')
      || lower.includes('waehle bitte')
      || lower.includes('welche kombination')
    );
  if (asksVariantChoice) {
    return variantChoices.map((variant) => ({
      label: variant,
      message: `Ich wähle ${variant}.`,
      action: 'send_message',
    }));
  }

  if (fromApi && fromApi.length > 0) return fromApi;

  if (lower.includes('dielenprodukt') || lower.includes('welches dieser dielenprodukte')) {
    return [
      { label: 'PREMIUM 21x145', message: 'Ich wähle PREMIUM 21x145.', action: 'send_message' },
      { label: 'PREMIUM 21x242', message: 'Ich wähle PREMIUM 21x242.', action: 'send_message' },
      { label: 'PREMIUM PLUS 21x145', message: 'Ich wähle PREMIUM PLUS 21x145.', action: 'send_message' },
      { label: 'PREMIUM PLUS 21x242', message: 'Ich wähle PREMIUM PLUS 21x242.', action: 'send_message' },
      { label: 'CLASSIC 21x145', message: 'Ich wähle CLASSIC 21x145.', action: 'send_message' },
      { label: 'SIGNUM 21x145', message: 'Ich wähle SIGNUM 21x145.', action: 'send_message' },
      { label: 'SIGNUM 21x242', message: 'Ich wähle SIGNUM 21x242.', action: 'send_message' },
      { label: 'DYNUM 21x242', message: 'Ich wähle DYNUM 21x242.', action: 'send_message' },
      { label: 'DYNUM 25x293', message: 'Ich wähle DYNUM 25x293.', action: 'send_message' },
      { label: 'DELTA 21x145', message: 'Ich wähle DELTA 21x145.', action: 'send_message' },
    ];
  }

  if (lower.includes('dielenfarbe') || lower.includes('farbe passt')) {
    const detectedColors = extractColorChoicesFromAnswer(answer);
    if (detectedColors.length > 0) {
      return detectedColors.slice(0, 8).map((color) => ({
        label: color,
        message: `Ich wähle die Dielenfarbe ${color}.`,
        action: 'send_message',
      }));
    }
    return [];
  }

  return [];
}

function shouldHideSources(answer: string): boolean {
  const lower = String(answer || '').toLowerCase();
  if (/\bmgw[a-z0-9]{4,}\b/.test(lower)) return true;
  return (
    lower.includes('planungscode')
    || lower.includes('terrassenplanung')
    || lower.includes('terrasse wurde erfolgreich im megawood planer erstellt')
    || lower.includes('unterkonstruktion')
    || lower.includes('profilfarbe')
    || lower.includes('dielenfarbe')
    || lower.includes('dielenprodukt')
    || lower.includes('deine planung')
  );
}

/** Extract a terrace planning code (e.g. mgw148964) from a bot response. */
export function extractPlanningCode(text: string): string | null {
  const source = String(text || '');
  const labeled = source.match(
    /(?:planungscode|terrassencode|code)\s*(?:ist|:)?\s*[:–-]?\s*([a-z0-9_]{6,})/i
  );
  if (labeled?.[1]) return labeled[1].trim();
  const fallback = source.match(/\b(mgw[a-z0-9]{4,}|_temp[a-z0-9]{4,})\b/i);
  return fallback?.[1] ? fallback[1].trim() : null;
}

interface UseChatOptions {
  conversationId: string | null;
  onConversationIdChange: (id: string) => void;
  onPlanningCodeDetected?: (code: string) => void;
}

export function useChat({
  conversationId,
  onConversationIdChange,
  onPlanningCodeDetected,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeQuickReplies, setActiveQuickReplies] = useState<QuickReplyOption[]>([]);
  const [activeInputRequest, setActiveInputRequest] = useState<InputRequest | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState(THINKING_MESSAGES[0]);
  const sessionIdRef = useRef(generateUUID());
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startThinking = useCallback(() => {
    setIsThinking(true);
    let index = 0;
    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % THINKING_MESSAGES.length;
      setThinkingText(THINKING_MESSAGES[index]);
    }, 2000);
  }, []);

  const stopThinking = useCallback(() => {
    setIsThinking(false);
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
  }, []);

  const addUserMessage = useCallback((text: string) => {
    const message: Message = {
      id: generateUUID(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const addBotMessage = useCallback((
    text: string,
    sources?: string[],
    quickReplies?: QuickReplyOption[],
    inputRequest?: InputRequest | null,
  ) => {
    const message: Message = {
      id: generateUUID(),
      role: 'bot',
      text,
      sources,
      quickReplies,
      inputRequest,
      timestamp: new Date(),
      sessionId: sessionIdRef.current,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const onPlanningCodeDetectedRef = useRef(onPlanningCodeDetected);
  useEffect(() => {
    onPlanningCodeDetectedRef.current = onPlanningCodeDetected;
  }, [onPlanningCodeDetected]);

  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const sendMessage = useCallback(async (text: string) => {
    addUserMessage(text);
    setActiveQuickReplies([]);
    setActiveInputRequest(null);
    startThinking();
    const currentSessionId = sessionIdRef.current;
    const currentConversationId = conversationIdRef.current;
    try {
      const response = await apiSendMessage(text, currentConversationId);
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      if (response.conversation_id) {
        onConversationIdChange(response.conversation_id);
      }
      const normalizedInputRequest = normalizeInputRequestFromResponse(
        response.answer,
        response.input_request || null,
      );
      const mergedQuickReplies = buildFallbackQuickReplies(response.answer, response.quick_replies);
      const visibleSources = shouldHideSources(response.answer) ? undefined : response.sources;
      addBotMessage(response.answer, visibleSources, mergedQuickReplies, normalizedInputRequest);
      setActiveQuickReplies(mergedQuickReplies);
      setActiveInputRequest(normalizedInputRequest);
      const code = extractPlanningCode(response.answer);
      if (code) onPlanningCodeDetectedRef.current?.(code);
    } catch (error) {
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      addBotMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.');
      console.error('Chat error:', error);
    }
  }, [onConversationIdChange, addUserMessage, addBotMessage, startThinking, stopThinking]);

  const clearMessages = useCallback(() => {
    sessionIdRef.current = generateUUID();
    setMessages([]);
    setActiveQuickReplies([]);
    setActiveInputRequest(null);
  }, []);

  const handleQuickReply = useCallback((reply: QuickReplyOption) => {
    if (reply.action === 'request_planning_code_input') {
      addBotMessage('Gerne. Bitte gib deinen Planungscode ein, dann lade ich deine bestehende Planung und biete dir passende Änderungsoptionen an.');
      setActiveInputRequest({
        type: 'planning_code_input',
        title: 'Bitte gib deinen Planungscode ein, damit ich deine bestehende Planung laden kann.',
        fields: [{ key: 'planning_code', label: 'Planungscode' }],
      });
      setActiveQuickReplies([]);
      return;
    }

    if (reply.action === 'request_location_input') {
      setActiveInputRequest({
        type: 'dealer_location_input',
        title: 'Bitte gib Stadt oder Postleitzahl ein, damit ich einen Händler in deiner Nähe finden kann.',
        fields: [
          { key: 'city', label: 'Stadt' },
          { key: 'postal_code', label: 'Postleitzahl' },
        ],
      });
      setActiveQuickReplies([]);
      return;
    }

    if (reply.action === 'open_url' && reply.url) {
      const url = reply.url;
      const filenamePrefix = url.includes('/materialliste/') ? 'materialliste' : 'bauplan';
      const filename = `${filenamePrefix}-${Date.now()}.pdf`;
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Download fehlgeschlagen');
          return res.blob();
        })
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = objectUrl;
          anchor.download = filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(objectUrl);
        })
        .catch(() => {
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      return;
    }
    if (reply.message && reply.message.trim()) {
      sendMessage(reply.message);
    }
  }, [sendMessage, addBotMessage]);

  const restoreMessages = useCallback((historyItems: Array<{ role: string; text: string }>) => {
    const restored: Message[] = historyItems.map((item) => ({
      id: generateUUID(),
      role: item.role === 'user' ? 'user' : 'bot',
      text: item.text,
      timestamp: new Date(),
      sessionId: sessionIdRef.current,
    }));
    setMessages(restored);
  }, []);

  return {
    messages,
    activeQuickReplies,
    activeInputRequest,
    isThinking,
    thinkingText,
    sendMessage,
    handleQuickReply,
    addBotMessage,
    clearMessages,
    restoreMessages,
  };
}
