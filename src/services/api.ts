// API service for communicating with the megawood chatbot backend

import type {
  ApiResponse,
  PresenceResponse,
  ConversationResponse,
  TerracePlanData,
  EntryContext,
  PageContext,
  DealerFlowContext,
} from '../types';

const DEFAULT_API_URL = 'https://mw-chatbot-backend.vercel.app/chat';
// The token is embedded as a fallback so the widget works without a .env file.
// Override by setting VITE_AUTH_TOKEN in your environment.
const AUTH_TOKEN =
  import.meta.env.VITE_AUTH_TOKEN ||
  '42vombj8mp9an8jv5evp3vfup8izma7oh9yxma4tp9b6anemudxb2ei3bw2koiqyx7umnp55w3rodpp79k6izp27wchm2u2vjvviwwvqxqgb2j859c4dk2g4s6k7wpct';
const TERRACE_LOAD_URL = 'https://betaplaner.megawood.com/api/terrassedaten/ladeDaten';
const TERRACE_SAVE_URL = 'https://betaplaner.megawood.com/api/terrassedaten/speichereDaten';
const TERRACE_BAUPLAN_PDF_URL_BASE = 'https://betaplaner.megawood.com/api/bauplan/pdf';
const TERRACE_MATERIALLISTE_PDF_URL_BASE = 'https://betaplaner.megawood.com/api/materialliste/pdf';

function getApiUrl(): string {
  return (window as unknown as Record<string, string>).CHATBOT_API_URL || DEFAULT_API_URL;
}

function getConversationUrl(): string {
  return getApiUrl()
    .replace(/\/terrassenplaner\/chat$/, '/conversation')
    .replace(/\/chat$/, '/conversation');
}

function buildAuthHeaders(includeJsonContentType = false): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    formData.append(key, String(value));
    return;
  }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    formData.append(key, JSON.stringify(value));
    return;
  }
  formData.append(key, String(value));
}

function toApiEntryContext(entryContext: EntryContext | null | undefined): Record<string, string> | undefined {
  if (!entryContext || !entryContext.goal || !entryContext.audiencePath) {
    return undefined;
  }
  return {
    goal: entryContext.goal,
    audience_path: entryContext.audiencePath,
  };
}

export async function sendMessage(
  message: string,
  conversationId: string | null,
  entryContext?: EntryContext | null,
  pageContext?: PageContext,
  dealerFlowContext?: DealerFlowContext | null,
): Promise<ApiResponse> {
  const body: Record<string, unknown> = { message };
  if (conversationId) body.conversation_id = conversationId;
  const apiEntryContext = toApiEntryContext(entryContext);
  if (apiEntryContext) body.entry_context = apiEntryContext;
  if (pageContext) body.page_context = pageContext;
  if (dealerFlowContext) {
    body.dealer_flow_context = dealerFlowContext;
    body.context = {
      dealer_flow: dealerFlowContext,
      page_context: pageContext,
    };
  }
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: buildAuthHeaders(true),
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  return response.json();
}

export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  if (!conversationId) throw new Error('Konversations-ID fehlt');
  const response = await fetch(`${getConversationUrl()}/${encodeURIComponent(conversationId)}`, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Kontext konnte nicht geladen werden: ${response.status}`);
  return response.json();
}

export async function deleteConversation(conversationId: string): Promise<void> {
  if (!conversationId) return;
  await fetch(`${getConversationUrl()}/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  }).catch(() => {});
}

export async function sendPresenceStatus(
  conversationId: string,
  knownHistoryCount: number
): Promise<PresenceResponse> {
  if (!conversationId) throw new Error('Konversations-ID fehlt');
  const response = await fetch(
    `${getConversationUrl()}/${encodeURIComponent(conversationId)}/presence`,
    {
      method: 'POST',
      headers: buildAuthHeaders(true),
      body: JSON.stringify({ known_history_count: Math.max(0, Number(knownHistoryCount) || 0) }),
    }
  );
  if (!response.ok) throw new Error(`Presence-Status konnte nicht gesendet werden: ${response.status}`);
  return response.json();
}

export async function loadTerracePlanData(terraceCode: string): Promise<TerracePlanData> {
  const cleanedCode = String(terraceCode || '').trim();
  if (!cleanedCode) throw new Error('Bitte einen gültigen Planungscode angeben.');
  const formData = new FormData();
  appendFormValue(formData, 'terrassencode', cleanedCode);
  const response = await fetch(TERRACE_LOAD_URL, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Planungsdaten konnten nicht geladen werden (${response.status}).`);
  const result = await response.json() as TerracePlanData;
  if (!result || !result.terrassencode) {
    throw new Error('Die Planer-API hat keine gültigen Daten zurückgegeben.');
  }
  return result;
}

export async function saveTerracePlanData(payload: TerracePlanData): Promise<{ terrassencode: string }> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Ungültige Planungsdaten zum Speichern.');
  }
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });
  const response = await fetch(TERRACE_SAVE_URL, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Planung konnte nicht gespeichert werden (${response.status}).`);
  const result = await response.json() as { terrassencode: string };
  if (!result || !result.terrassencode) {
    throw new Error('Die Planer-API hat keinen Planungscode zurückgegeben.');
  }
  return result;
}

export function buildBauplanPdfUrl(planningCode: string): string {
  const cleanedCode = String(planningCode || '').trim();
  if (!cleanedCode) {
    throw new Error('Bitte einen gültigen Planungscode angeben.');
  }
  return `${TERRACE_BAUPLAN_PDF_URL_BASE}/${encodeURIComponent(cleanedCode)}`;
}

export function buildMateriallistePdfUrl(planningCode: string): string {
  const cleanedCode = String(planningCode || '').trim();
  if (!cleanedCode) {
    throw new Error('Bitte einen gültigen Planungscode angeben.');
  }
  return `${TERRACE_MATERIALLISTE_PDF_URL_BASE}/${encodeURIComponent(cleanedCode)}`;
}
