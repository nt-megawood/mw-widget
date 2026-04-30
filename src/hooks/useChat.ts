import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  DealerFlowContext,
  EntryContext,
  EntryGoal,
  InputRequest,
  Message,
  PageContext,
  QuickReplyOption,
} from '../types';
import { generateUUID } from '../utils/uuid';
import { sendMessage as apiSendMessage } from '../services/api';
import { dispatchDealerConversionEvent } from '../services/analytics';
import { getAudiencePath, useAuth } from './useAuth';

const EMPTY_ENTRY_CONTEXT: EntryContext = {
  goal: null,
  audiencePath: null,
};

const ENTRY_CONTEXT_STORAGE_KEY_PREFIX = 'mw_entry_context_';

function getEntryContextStorageKey(widgetId: string): string {
  return `${ENTRY_CONTEXT_STORAGE_KEY_PREFIX}${widgetId}`;
}

function readEntryContext(widgetId: string): EntryContext {
  try {
    const raw = sessionStorage.getItem(getEntryContextStorageKey(widgetId));
    if (!raw) return EMPTY_ENTRY_CONTEXT;
    const parsed = JSON.parse(raw) as Partial<EntryContext>;
    const goal = parsed.goal || null;
    const audiencePath = parsed.audiencePath || null;
    if (!goal || !audiencePath) {
      return { goal, audiencePath };
    }
    return { goal, audiencePath };
  } catch {
    return EMPTY_ENTRY_CONTEXT;
  }
}

function saveEntryContext(widgetId: string, entryContext: EntryContext): void {
  try {
    sessionStorage.setItem(getEntryContextStorageKey(widgetId), JSON.stringify(entryContext));
  } catch {
    // Ignore storage failures to keep chat usable.
  }
}

function clearEntryContext(widgetId: string): void {
  try {
    sessionStorage.removeItem(getEntryContextStorageKey(widgetId));
  } catch {
    // Ignore storage failures to keep chat usable.
  }
}

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

  if (lower.includes('muster') || lower.includes('kostenfreies exemplar') || lower.includes('kostenfreies muster')) {
    return [buildMusterBestellenReply()];
  }

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

const PLANNER_CHECKPOINT_EVENT = 'mw:planner-checkpoint';

type PlannerCheckpoint = 'planner_saved' | 'pdf_export_clicked';

interface DealerCtaCheckpointState {
  recommendationReached: boolean;
  plannerSavedReached: boolean;
  pdfExportClickedReached: boolean;
}

const INITIAL_DEALER_CTA_CHECKPOINTS: DealerCtaCheckpointState = {
  recommendationReached: false,
  plannerSavedReached: false,
  pdfExportClickedReached: false,
};

interface PlannerCheckpointEventDetail {
  checkpoint: PlannerCheckpoint;
}

function isPlannerPdfUrl(url?: string): boolean {
  const source = String(url || '').toLowerCase();
  return source.includes('/bauplan/pdf/') || source.includes('/materialliste/pdf/');
}

/**
 * Recommendation checkpoint is derived from structured quick-reply payloads,
 * so CTA insertion is not solely dependent on free-text response matching.
 */
export function isRecommendationCheckpointReached(quickReplies: QuickReplyOption[]): boolean {
  const recommendationReplyCount = quickReplies.filter((item) => {
    if (item.action && item.action !== 'send_message') return false;
    const message = String(item.message || '').trim();
    return message.length > 0;
  }).length;
  return recommendationReplyCount >= 2;
}

function shouldInjectDealerCtaByCheckpoint(state: DealerCtaCheckpointState): boolean {
  return state.recommendationReached || state.plannerSavedReached || state.pdfExportClickedReached;
}

function shouldInjectDealerCta(answer: string, pageContext?: PageContext): boolean {
  const lower = String(answer || '').toLowerCase();
  const recommendationSignals = [
    'ich empfehle',
    'empfehl',
    'passt gut',
    'geeignet',
    'varianten',
    'dielenprodukt',
    'dielenfarbe',
  ];
  const plannerSignals = ['planungscode', 'bauplan', 'materialliste', 'planung wurde erfolgreich'];

  const isRecommendationMoment = recommendationSignals.some((token) => lower.includes(token));
  const isPlannerMoment = plannerSignals.some((token) => lower.includes(token));

  if (pageContext === 'planner') return isRecommendationMoment || isPlannerMoment;
  return isRecommendationMoment;
}

function hasDealerFlowAction(quickReplies: QuickReplyOption[]): boolean {
  return quickReplies.some((item) => {
    const action = item.action;
    return action === 'start_dealer_flow'
      || action === 'request_location_input'
      || action === 'open_dealer_results';
  });
}

function appendUniqueQuickReply(quickReplies: QuickReplyOption[], reply: QuickReplyOption): QuickReplyOption[] {
  const exists = quickReplies.some((item) => {
    const sameAction = item.action === reply.action;
    const sameUrl = (item.url || '') === (reply.url || '');
    const sameLabel = item.label.trim().toLowerCase() === reply.label.trim().toLowerCase();
    return sameAction && (sameUrl || sameLabel);
  });
  if (exists) return quickReplies;
  return [...quickReplies, reply];
}

function buildStartDealerFlowReply(): QuickReplyOption {
  return {
    label: 'Passenden Händler finden',
    message: '',
    action: 'start_dealer_flow',
  };
}

function buildMusterBestellenReply(): QuickReplyOption {
  return {
    label: 'Kostenfreies Muster bestellen',
    message: '',
    action: 'request_muster_bestellen_input',
  };
}

function extractDealerLocationFromMessage(text: string): { city?: string; postalCode?: string } | null {
  const source = String(text || '').trim();
  if (!source) return null;

  const cityMatch = source.match(/stadt\s*:\s*([^,\.\n]+)/i);
  const postalMatch = source.match(/postleitzahl\s*:\s*([^,\.\n]+)/i);
  const fallbackPostalMatch = source.match(/\b(\d{4,5})\b/);

  const city = cityMatch?.[1]?.trim() || undefined;
  const postalCode = postalMatch?.[1]?.trim() || fallbackPostalMatch?.[1] || undefined;
  if (!city && !postalCode) return null;
  return { city, postalCode };
}

function buildDealerResultsUrl(location: { city?: string; postalCode?: string }): string {
  const query = [location.city, location.postalCode].filter(Boolean).join(' ').trim();
  if (!query) return 'https://www.megawood.com/haendlersuche';
  return `https://www.megawood.com/haendlersuche?location=${encodeURIComponent(query)}`;
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
  widgetId: string;
  conversationId: string | null;
  onConversationIdChange: (id: string) => void;
  onPlanningCodeDetected?: (code: string) => void;
  pageContext?: PageContext;
  widgetVariant?: 'classic' | 'landscape';
}

export function useChat({
  widgetId,
  conversationId,
  onConversationIdChange,
  onPlanningCodeDetected,
  pageContext,
  widgetVariant,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeQuickReplies, setActiveQuickReplies] = useState<QuickReplyOption[]>([]);
  const [activeInputRequest, setActiveInputRequest] = useState<InputRequest | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState(THINKING_MESSAGES[0]);
  const [entryContext, setEntryContext] = useState<EntryContext>(() => readEntryContext(widgetId));
  const [dealerFlowContext, setDealerFlowContext] = useState<DealerFlowContext | null>(null);
  const [dealerCtaCheckpoints, setDealerCtaCheckpoints] = useState<DealerCtaCheckpointState>(
    INITIAL_DEALER_CTA_CHECKPOINTS,
  );
  const auth = useAuth();
  const sessionIdRef = useRef(generateUUID());
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emittedDealerEventsRef = useRef<Set<string>>(new Set());

  const isEntryComplete = Boolean(entryContext.goal && entryContext.audiencePath);

  useEffect(() => {
    saveEntryContext(widgetId, entryContext);
  }, [widgetId, entryContext]);

  // Auto-set audience path from auth state: logged in => gewerblich, otherwise privatkunde.
  useEffect(() => {
    const audiencePath = getAudiencePath(auth) ?? 'privatkunde';
    setEntryContext((prev) => {
      if (prev.audiencePath === audiencePath) {
        return prev;
      }
      return {
        ...prev,
        audiencePath,
      };
    });
  }, [auth]);

  useEffect(() => {
    const handlePlannerCheckpoint = (event: Event) => {
      const detail = (event as CustomEvent<PlannerCheckpointEventDetail>).detail;
      if (!detail?.checkpoint) return;
      if (detail.checkpoint === 'planner_saved') {
        setDealerCtaCheckpoints((prev) => ({ ...prev, plannerSavedReached: true }));
        return;
      }
      if (detail.checkpoint === 'pdf_export_clicked') {
        setDealerCtaCheckpoints((prev) => ({ ...prev, pdfExportClickedReached: true }));
      }
    };

    window.addEventListener(PLANNER_CHECKPOINT_EVENT, handlePlannerCheckpoint as EventListener);
    return () => {
      window.removeEventListener(PLANNER_CHECKPOINT_EVENT, handlePlannerCheckpoint as EventListener);
    };
  }, []);

  const setEntryGoal = useCallback((goal: EntryGoal) => {
    setEntryContext((prev) => ({ ...prev, goal }));
  }, []);

  const buildEntryStartMessage = useCallback((): string | null => {
    if (!entryContext.goal || !entryContext.audiencePath) return null;

    const goalMessageMap: Record<EntryGoal, string> = {
      produktberatung: 'Ich möchte eine Produktberatung.',
      terrassenplanung: 'Ich möchte eine Terrassenplanung starten.',
      vorhandene_planung: 'Ich möchte eine vorhandene Planung nutzen.',
      händler_finden: 'Ich möchte einen Händler in meiner Nähe finden.',
    };

    const audienceLabel = entryContext.audiencePath === 'gewerblich' ? 'gewerblich' : 'privat';
    return `${goalMessageMap[entryContext.goal]} Ich frage als ${audienceLabel}er Kunde an.`;
  }, [entryContext]);

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

  const emitDealerEvent = useCallback((
    eventName: 'dealer_flow_started' | 'dealer_location_submitted' | 'dealer_results_shown' | 'dealer_click_completed',
    payload: DealerFlowContext,
  ) => {
    const dedupeKey = `${eventName}:${payload.status}:${payload.city || ''}:${payload.postal_code || ''}:${payload.results_url || ''}`;
    if (emittedDealerEventsRef.current.has(dedupeKey)) {
      return;
    }
    emittedDealerEventsRef.current.add(dedupeKey);

    dispatchDealerConversionEvent(eventName, {
      widget_variant: widgetVariant,
      page_context: pageContext,
      audience_path: entryContext.audiencePath,
      conversation_id: conversationIdRef.current,
      dealer_flow_status: payload.status,
      city: payload.city,
      postal_code: payload.postal_code,
      results_url: payload.results_url,
    });
  }, [entryContext.audiencePath, pageContext, widgetVariant]);

  const sendMessage = useCallback(async (text: string) => {
    const location = extractDealerLocationFromMessage(text);
    let nextDealerFlowContext = dealerFlowContext;
    if (location && (dealerFlowContext?.status === 'location_requested' || dealerFlowContext?.status === 'started')) {
      nextDealerFlowContext = {
        status: 'location_submitted',
        city: location.city,
        postal_code: location.postalCode,
      };
      setDealerFlowContext(nextDealerFlowContext);
      emitDealerEvent('dealer_location_submitted', nextDealerFlowContext);
    }

    addUserMessage(text);
    setActiveQuickReplies([]);
    setActiveInputRequest(null);
    startThinking();
    const currentSessionId = sessionIdRef.current;
    const currentConversationId = conversationIdRef.current;
    try {
      const response = await apiSendMessage(
        text,
        currentConversationId,
        entryContext,
        pageContext,
        nextDealerFlowContext,
      );
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      if (response.conversation_id) {
        onConversationIdChange(response.conversation_id);
      }
      const normalizedInputRequest = normalizeInputRequestFromResponse(
        response.answer,
        response.input_request || null,
      );
      let mergedQuickReplies = buildFallbackQuickReplies(response.answer, response.quick_replies);
      const recommendationCheckpointReached = isRecommendationCheckpointReached(mergedQuickReplies);
      let nextCheckpointState = dealerCtaCheckpoints;
      if (recommendationCheckpointReached && !dealerCtaCheckpoints.recommendationReached) {
        nextCheckpointState = { ...dealerCtaCheckpoints, recommendationReached: true };
        setDealerCtaCheckpoints(nextCheckpointState);
      }
      const shouldInjectFromCheckpoint = shouldInjectDealerCtaByCheckpoint(nextCheckpointState);
      const shouldInjectFromLegacyHeuristic = shouldInjectDealerCta(response.answer, pageContext);
      if ((shouldInjectFromCheckpoint || shouldInjectFromLegacyHeuristic) && !hasDealerFlowAction(mergedQuickReplies)) {
        mergedQuickReplies = appendUniqueQuickReply(mergedQuickReplies, buildStartDealerFlowReply());
      }
      if (nextDealerFlowContext?.status === 'location_submitted') {
        const resultsUrl = buildDealerResultsUrl({
          city: nextDealerFlowContext.city,
          postalCode: nextDealerFlowContext.postal_code,
        });
        mergedQuickReplies = appendUniqueQuickReply(mergedQuickReplies, {
          label: 'Händlerergebnisse öffnen',
          message: '',
          action: 'open_dealer_results',
          url: resultsUrl,
        });
        const resultsContext: DealerFlowContext = {
          ...nextDealerFlowContext,
          status: 'results_shown',
          results_url: resultsUrl,
        };
        setDealerFlowContext(resultsContext);
        emitDealerEvent('dealer_results_shown', resultsContext);
      }
      const visibleSources = shouldHideSources(response.answer) ? undefined : response.sources;
      addBotMessage(response.answer, visibleSources, mergedQuickReplies, normalizedInputRequest);
      setActiveQuickReplies(mergedQuickReplies);
      setActiveInputRequest(normalizedInputRequest);
      const code = extractPlanningCode(response.answer);
      if (code) onPlanningCodeDetectedRef.current?.(code);
    } catch (error) {
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      addBotMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut, oder kontaktiere unseren Support.');
      console.error('Chat error:', error);
    }
  }, [
    dealerFlowContext,
    dealerCtaCheckpoints,
    onConversationIdChange,
    addUserMessage,
    addBotMessage,
    startThinking,
    stopThinking,
    entryContext,
    pageContext,
    emitDealerEvent,
  ]);

  const startEntryFlow = useCallback(() => {
    const startMessage = buildEntryStartMessage();
    if (!startMessage) return;
    sendMessage(startMessage);
  }, [buildEntryStartMessage, sendMessage]);

  const clearMessages = useCallback(() => {
    sessionIdRef.current = generateUUID();
    setMessages([]);
    setActiveQuickReplies([]);
    setActiveInputRequest(null);
    setDealerFlowContext(null);
    setDealerCtaCheckpoints(INITIAL_DEALER_CTA_CHECKPOINTS);
    emittedDealerEventsRef.current.clear();
    setEntryContext(EMPTY_ENTRY_CONTEXT);
    clearEntryContext(widgetId);
  }, [widgetId]);

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

    if (reply.action === 'request_muster_bestellen_input') {
      addBotMessage('Gerne. Ich öffne dir die Musterbestellung. Du kannst mehrere Dielen hinzufügen und die Lieferadresse direkt im Formular angeben.');
      setActiveInputRequest({
        type: 'muster_bestellen_input',
        title: 'Kostenfreies Muster bestellen',
        fields: [],
      });
      setActiveQuickReplies([]);
      return;
    }

    if (reply.action === 'start_dealer_flow' || reply.action === 'request_location_input') {
      const startedContext: DealerFlowContext = {
        status: 'started',
        city: dealerFlowContext?.city,
        postal_code: dealerFlowContext?.postal_code,
      };
      setDealerFlowContext(startedContext);
      emitDealerEvent('dealer_flow_started', startedContext);

      const requestedContext: DealerFlowContext = {
        ...startedContext,
        status: 'location_requested',
      };
      setDealerFlowContext(requestedContext);
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

    if (reply.action === 'open_dealer_results' && reply.url) {
      window.open(reply.url, '_blank', 'noopener,noreferrer');
      const clickContext: DealerFlowContext = {
        status: 'click_completed_intent',
        city: dealerFlowContext?.city,
        postal_code: dealerFlowContext?.postal_code,
        results_url: reply.url,
      };
      setDealerFlowContext(clickContext);
      emitDealerEvent('dealer_click_completed', clickContext);
      return;
    }

    if (reply.action === 'open_url' && reply.url) {
      const url = reply.url;
      if (isPlannerPdfUrl(url)) {
        setDealerCtaCheckpoints((prev) => ({ ...prev, pdfExportClickedReached: true }));
      }
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
  }, [sendMessage, addBotMessage, dealerFlowContext, emitDealerEvent]);

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
    entryContext,
    isEntryComplete,
    isThinking,
    thinkingText,
    setEntryGoal,
    startEntryFlow,
    sendMessage,
    handleQuickReply,
    addBotMessage,
    clearMessages,
    restoreMessages,
  };
}
