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
import { sendMessageStream } from '../services/api';
import { dispatchDealerConversionEvent } from '../services/analytics';
import { getAudiencePath, useAuth } from './useAuth';
import { UI_COPY, LOCALE_MAP, type WidgetLanguage } from '../config/i18n';

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

function buildThinkingMessages(copy: (typeof UI_COPY)['de']): string[] {
  return [
    copy.thinkingMsg0,
    copy.thinkingMsg1,
    copy.thinkingMsg2,
    copy.thinkingMsg3,
    copy.thinkingMsg4,
    copy.thinkingMsg5,
    copy.thinkingMsg6,
    copy.thinkingMsg7,
    copy.thinkingMsg8,
    copy.thinkingMsg9,
  ];
}

// Field keys and geometric labels (e.g. "Seite A") are intentionally not in i18n —
// only the unit suffix "(m)" is universal, and the side letters are convention-neutral.
// The city/postal labels come from copy. All other "Seite X" labels are geometric,
// not localisable prose, so they stay as-is.
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

function normalizeInputRequestFromResponse(
  answer: string,
  inputRequest: InputRequest | null | undefined,
  dimensionInputRequestTitle: string,
): InputRequest | null {
  if (!inputRequest) return null;
  // Silently ignore muster_bestellen_input — the flow is now handled via external URL.
  // Cast needed because backend may still send this deprecated type.
  if ((inputRequest.type as string) === 'muster_bestellen_input') return null;
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
    title: dimensionInputRequestTitle,
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

function buildProfileQuickReplies(answer: string, copy: (typeof UI_COPY)['de']): QuickReplyOption[] {
  const codeMatch = String(answer || '').match(/\b(mgw[a-z0-9]{4,})\b/i);
  const code = codeMatch?.[1];
  const codePrefix = code ? `bei ${code} ` : '';
  return [
    { label: 'Bronze', message: `Bitte ändere ${codePrefix}die Profilfarbe auf bronze.`, action: 'send_message' },
    { label: copy.profileColorSilver, message: `Bitte ändere ${codePrefix}die Profilfarbe auf silver (Silber).`, action: 'send_message' },
    { label: copy.profileColorAnthracite, message: `Bitte ändere ${codePrefix}die Profilfarbe auf anthracite (Anthrazit).`, action: 'send_message' },
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

function buildFallbackQuickReplies(
  answer: string,
  planningCodeEnterLabel: string,
  copy: (typeof UI_COPY)['de'],
  fromApi?: QuickReplyOption[],
): QuickReplyOption[] {
  const lower = String(answer || '').toLowerCase();
  const existingCode = extractPlanningCode(answer);
  const generatedReplies: QuickReplyOption[] = [];

  if (
    lower.includes('planer.megawood.com')
    || lower.includes('terrassenplaner')
    || (lower.includes('gemeinsam planen') && lower.includes('planer'))
  ) {
    generatedReplies.push(buildPlannerReply());
  }

  if (lower.includes('muster') || lower.includes('kostenfreies exemplar') || lower.includes('kostenfreies muster')) {
    generatedReplies.push(buildMusterBestellenReply(copy));
  }

  if (
    lower.includes('fachhändler')
    || lower.includes('fachhaendler')
    || lower.includes('händlersuche')
    || lower.includes('haendlersuche')
    || lower.includes('händler')
  ) {
    generatedReplies.push(buildDealerFinderReply(copy));
  }

  if (generatedReplies.length > 0) {
    if (fromApi && fromApi.length > 0) {
      return generatedReplies.reduce((merged, reply) => appendUniqueQuickReply(merged, reply), [...fromApi]);
    }
    return generatedReplies;
  }

  const asksForPlanningCode =
    lower.includes('planungscode')
    && (lower.includes('nenne') || lower.includes('gib') || lower.includes('hast') || lower.includes('angeben'));
  if (asksForPlanningCode) {
    return [{ label: planningCodeEnterLabel, message: '', action: 'request_planning_code_input' }];
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
        label: copy.quickReplyChangeDimensions,
        message: `Ich möchte bei ${existingCode} Form/Maße ändern. Bitte zeige mir dafür passende Optionen als Buttons.`,
        action: 'send_message',
      },
      {
        label: copy.quickReplyChangeDiele,
        message: `Ich möchte bei ${existingCode} Diele/Farbe ändern. Bitte zeige mir dafür passende Optionen als Buttons.`,
        action: 'send_message',
      },
      {
        label: copy.quickReplyChangeProfilfarbe,
        message: `Ich möchte bei ${existingCode} die Profilfarbe anpassen. Bitte nenne mir alle verfügbaren Optionen und stelle passende Buttons bereit.`,
        action: 'send_message',
      },
      {
        label: copy.quickReplyChangeUK,
        message: `Ich möchte bei ${existingCode} die Unterkonstruktion ändern. Bitte nenne mir alle verfügbaren Optionen und stelle passende Buttons bereit.`,
        action: 'send_message',
      },
      {
        label: copy.quickReplyBauplanPdf,
        message: '',
        action: 'open_url',
        url: `https://betaplaner.megawood.com/api/bauplan/pdf/${existingCode}`,
      },
      {
        label: copy.quickReplyMateriallistePdf,
        message: '',
        action: 'open_url',
        url: `https://betaplaner.megawood.com/api/materialliste/pdf/${existingCode}`,
      },
      {
        label: copy.quickReplyDealerNearMe,
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
    return buildProfileQuickReplies(answer, copy);
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

function buildStartDealerFlowReply(copy: (typeof UI_COPY)['de']): QuickReplyOption {
  return {
    label: copy.quickReplyFindDealerProximity,
    message: '',
    action: 'start_dealer_flow',
  };
}

function buildMusterBestellenReply(copy: (typeof UI_COPY)['de']): QuickReplyOption {
  return {
    label: copy.quickReplyOrderSample,
    message: '',
    action: 'open_url',
    url: 'https://www.megawood.com/de/service/musteranforderung',
  };
}

function buildPlannerReply(): QuickReplyOption {
  return {
    label: 'megawood® Terrassenplaner',
    message: '',
    action: 'open_url',
    url: 'https://planer.megawood.com',
  };
}

function buildDealerFinderReply(copy: (typeof UI_COPY)['de']): QuickReplyOption {
  return {
    label: copy.quickReplyFindSpecialistDealer,
    message: '',
    action: 'request_location_input',
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
  if (!query) return 'https://www.megawood.com/de/service/haendlersuche';
  return `https://www.megawood.com/de/service/haendlersuche?location=${encodeURIComponent(query)}`;
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
  language?: WidgetLanguage;
}

export function useChat({
  widgetId,
  conversationId,
  onConversationIdChange,
  onPlanningCodeDetected,
  pageContext,
  widgetVariant,
  language,
}: UseChatOptions) {
  const copy = UI_COPY[language ?? 'de'];
  // LOCALE_MAP is consumed by callers that need the BCP-47 locale string (e.g. speech synthesis).
  // Expose it via the hook return so consumers don't need to import i18n directly.
  const locale = LOCALE_MAP[language ?? 'de'];
  const thinkingMessages = buildThinkingMessages(copy);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeQuickReplies, setActiveQuickReplies] = useState<QuickReplyOption[]>([]);
  const [activeInputRequest, setActiveInputRequest] = useState<InputRequest | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingText, setThinkingText] = useState(thinkingMessages[0]);
  const pendingRequestControllerRef = useRef<AbortController | null>(null);
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

    // goalMessageMap values are sent to the backend as prompt text — keep German always.
    const goalMessageMap: Record<EntryGoal, string> = {
      produktberatung: 'Ich möchte eine Produktberatung.',
      terrassenplanung: 'Ich möchte eine Terrassenplanung starten.',
      vorhandene_planung: 'Ich möchte eine vorhandene Planung nutzen.',
      händler_finden: 'Ich möchte einen Händler in meiner Nähe finden.',
    };

    // Audience suffix is also backend-facing — keep German always.
    const audienceLabel = entryContext.audiencePath === 'gewerblich' ? 'gewerblich' : 'privat';
    return `${goalMessageMap[entryContext.goal]} Ich frage als ${audienceLabel}er Kunde an.`;
  }, [entryContext]);

  const startThinking = useCallback(() => {
    setIsThinking(true);
    let index = 0;
    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % thinkingMessages.length;
      setThinkingText(thinkingMessages[index]);
    }, 2000);
  }, [thinkingMessages]);

  const stopThinking = useCallback(() => {
    setIsThinking(false);
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
  }, []);

  const cancelResponseGeneration = useCallback(() => {
    pendingRequestControllerRef.current?.abort();
    pendingRequestControllerRef.current = null;
    stopThinking();
  }, [stopThinking]);

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
    pendingRequestControllerRef.current?.abort();
    const requestController = new AbortController();
    pendingRequestControllerRef.current = requestController;
    const currentSessionId = sessionIdRef.current;
    const currentConversationId = conversationIdRef.current;

    const placeholderId = generateUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: placeholderId,
        role: 'bot',
        text: '',
        timestamp: new Date(),
        sessionId: currentSessionId,
      },
    ]);

    let hasReceivedChunk = false;

    try {
      const response = await sendMessageStream(
        text,
        currentConversationId,
        entryContext,
        pageContext,
        nextDealerFlowContext,
        requestController.signal,
        (fullText) => {
          if (!hasReceivedChunk) {
            hasReceivedChunk = true;
            setIsThinking(false);
            setIsStreaming(true);
          }
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === placeholderId ? { ...msg, text: fullText } : msg,
            ),
          );
        },
      );
      if (pendingRequestControllerRef.current === requestController) {
        pendingRequestControllerRef.current = null;
      }
      if (currentSessionId !== sessionIdRef.current) return;
      setIsStreaming(false);
      setIsThinking(false);
      if (response.conversation_id) {
        onConversationIdChange(response.conversation_id);
      }
      const normalizedInputRequest = normalizeInputRequestFromResponse(
        response.answer,
        response.input_request || null,
        copy.dimensionInputRequestTitle,
      );
      let mergedQuickReplies = buildFallbackQuickReplies(response.answer, copy.planningCodeEnterLabel, copy, response.quick_replies);
      const recommendationCheckpointReached = isRecommendationCheckpointReached(mergedQuickReplies);
      let nextCheckpointState = dealerCtaCheckpoints;
      if (recommendationCheckpointReached && !dealerCtaCheckpoints.recommendationReached) {
        nextCheckpointState = { ...dealerCtaCheckpoints, recommendationReached: true };
        setDealerCtaCheckpoints(nextCheckpointState);
      }
      const shouldInjectFromCheckpoint = shouldInjectDealerCtaByCheckpoint(nextCheckpointState);
      const shouldInjectFromLegacyHeuristic = shouldInjectDealerCta(response.answer, pageContext);
      if ((shouldInjectFromCheckpoint || shouldInjectFromLegacyHeuristic) && !hasDealerFlowAction(mergedQuickReplies)) {
        mergedQuickReplies = appendUniqueQuickReply(mergedQuickReplies, buildStartDealerFlowReply(copy));
      }
      if (nextDealerFlowContext?.status === 'location_submitted') {
        const resultsUrl = buildDealerResultsUrl({
          city: nextDealerFlowContext.city,
          postalCode: nextDealerFlowContext.postal_code,
        });
        mergedQuickReplies = appendUniqueQuickReply(mergedQuickReplies, {
          label: copy.dealerSearchOpenLabel,
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
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId
            ? {
                ...msg,
                text: response.answer,
                sources: visibleSources,
                quickReplies: mergedQuickReplies,
                inputRequest: normalizedInputRequest,
              }
            : msg,
        ),
      );
      setActiveQuickReplies(mergedQuickReplies);
      setActiveInputRequest(normalizedInputRequest);
      const code = extractPlanningCode(response.answer);
      if (code) onPlanningCodeDetectedRef.current?.(code);
    } catch (error) {
      setIsStreaming(false);
      if ((error as DOMException)?.name === 'AbortError') {
        setMessages((prev) => prev.filter((msg) => msg.id !== placeholderId));
        return;
      }
      if (pendingRequestControllerRef.current === requestController) {
        pendingRequestControllerRef.current = null;
      }
      if (currentSessionId !== sessionIdRef.current) return;
      setIsThinking(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === placeholderId
            ? {
                ...msg,
                text: copy.chatErrorMessage,
              }
            : msg,
        ),
      );
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
    copy,
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
      addBotMessage(copy.planningCodeBotPrompt);
      setActiveInputRequest({
        type: 'planning_code_input',
        title: copy.planningCodeRequestTitle,
        fields: [{ key: 'planning_code', label: copy.planningCodeLabel }],
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
        title: copy.dealerLocationRequestTitle,
        fields: [
          { key: 'city', label: copy.dealerCityFieldLabel },
          { key: 'postal_code', label: copy.dealerPostalFieldLabel },
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
      if (url.includes('planer.megawood.com')) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      if (isPlannerPdfUrl(url)) {
        // PDF blob download path (bauplan / materialliste)
        setDealerCtaCheckpoints((prev) => ({ ...prev, pdfExportClickedReached: true }));
        const filenamePrefix = url.includes('/materialliste/') ? 'materialliste' : 'bauplan';
        const filename = `${filenamePrefix}-${Date.now()}.pdf`;
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error('PDF download failed');
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
      // All other URLs (e.g. musteranforderung, haendlersuche, etc.) open in a new tab directly.
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (reply.message && reply.message.trim()) {
      sendMessage(reply.message);
    }
  }, [sendMessage, addBotMessage, dealerFlowContext, emitDealerEvent, copy]);

  const handleDealerLocationSubmit = useCallback((city: string, postalCode: string) => {
    const submittedContext: DealerFlowContext = {
      status: 'location_submitted',
      city,
      postal_code: postalCode,
    };
    setDealerFlowContext(submittedContext);
    emitDealerEvent('dealer_location_submitted', submittedContext);

    const resultsUrl = buildDealerResultsUrl({ city, postalCode });

    const resultsContext: DealerFlowContext = {
      status: 'results_shown',
      city,
      postal_code: postalCode,
      results_url: resultsUrl,
    };
    setDealerFlowContext(resultsContext);
    emitDealerEvent('dealer_results_shown', resultsContext);

    const clickContext: DealerFlowContext = {
      status: 'click_completed_intent',
      city,
      postal_code: postalCode,
      results_url: resultsUrl,
    };
    setDealerFlowContext(clickContext);
    emitDealerEvent('dealer_click_completed', clickContext);

    window.open(resultsUrl, '_blank', 'noopener,noreferrer');
    setActiveInputRequest(null);
  }, [emitDealerEvent]);

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
    isStreaming,
    thinkingText,
    locale,
    setEntryGoal,
    startEntryFlow,
    sendMessage,
    handleQuickReply,
    handleDealerLocationSubmit,
    addUserMessage,
    addBotMessage,
    clearMessages,
    restoreMessages,
    cancelResponseGeneration,
  };
}
