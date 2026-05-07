// API service for communicating with the megawood chatbot backend

import type {
  ApiResponse,
  PresenceResponse,
  ConversationResponse,
  TerraceHistoryItem,
  TerracePlanData,
  EntryContext,
  PageContext,
  DealerFlowContext,
} from '../types';
import { getAuthData } from '../hooks/useAuth';
import { isB2BUser } from '../hooks/useAuth';
import { getWidgetToken } from '../hooks/useWidgetToken';
import {
  getApiUrl as getConfigApiUrl,
  TERRACE_LOAD_URL,
  TERRACE_SAVE_URL,
  TERRACE_BAUPLAN_PDF_URL_BASE,
  TERRACE_MATERIALLISTE_PDF_URL_BASE,
  TERRACE_HISTORY_URL_BASE,
} from '../config/api';

const RECENT_TERRACE_CODES_STORAGE_KEY = 'recentTerrassencodes';

export async function getAuthToken(): Promise<string> {
  return getWidgetToken();
}

/**
 * Get the chat API URL
 * Configured centrally in src/config/api.ts
 */
function getApiUrl(): string {
  return (window as unknown as Record<string, string>).CHATBOT_API_URL || getConfigApiUrl();
}

/**
 * Get the conversation API URL
 * Configured centrally in src/config/api.ts
 */
function getConversationUrl(): string {
  return getApiUrl()
    .replace(/\/terrassenplaner\/chat$/, '/conversation')
    .replace(/\/chat$/, '/conversation');
}

async function buildAuthHeaders(includeJsonContentType = false): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
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

function normalizeTerraceHistoryItem(item: unknown): TerraceHistoryItem | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  const terrassencode = String(record.terrassencode || '').trim();
  if (!terrassencode) return null;
  return {
    terrassencode,
    zuletztaktualisiert: record.zuletztaktualisiert ? String(record.zuletztaktualisiert) : undefined,
    form: record.form ? String(record.form) : undefined,
    koordinaten: record.koordinaten ? String(record.koordinaten) : undefined,
    diele: record.diele ? String(record.diele) : undefined,
    farbe: record.farbe ? String(record.farbe) : undefined,
  };
}

function readRecentTerraceCodes(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_TERRACE_CODES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((code) => String(code || '').trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function writeRecentTerraceCodes(codes: string[]): void {
  try {
    const unique = Array.from(new Set(codes.map((code) => String(code || '').trim()).filter(Boolean))).slice(0, 10);
    window.localStorage.setItem(RECENT_TERRACE_CODES_STORAGE_KEY, JSON.stringify(unique));
  } catch {
    // Ignore storage failures; recent history is a convenience feature only.
  }
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
  signal?: AbortSignal,
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

  // Include user context from localStorage if available
  const auth = getAuthData();
  if (auth?.user) {
    body.user_context = {
      user_id: auth.user.id,
      user_name: auth.user.name,
      email: auth.user.email,
      first_name: auth.user.name?.split(' ')[0] || null,
      last_name: auth.user.name?.split(' ').slice(1).join(' ') || null,
      street: auth.user.profile?.address1 || null,
      house_number: auth.user.profile?.address2 || null,
      city: auth.user.profile?.city || null,
      country: auth.user.profile?.country || null,
      company: auth.user.profile?.company || null,
      postal_code: auth.user.profile?.postal_code || null,
      is_b2b: isB2BUser(auth) || false,
    };
  }

  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: await buildAuthHeaders(true),
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  return response.json();
}

export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  if (!conversationId) throw new Error('Konversations-ID fehlt');
  const response = await fetch(`${getConversationUrl()}/${encodeURIComponent(conversationId)}`, {
    headers: await buildAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Kontext konnte nicht geladen werden: ${response.status}`);
  return response.json();
}

export async function deleteConversation(conversationId: string): Promise<void> {
  if (!conversationId) return;
  await fetch(`${getConversationUrl()}/${encodeURIComponent(conversationId)}`, {
    method: 'DELETE',
    headers: await buildAuthHeaders(),
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
      headers: await buildAuthHeaders(true),
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

export function getRecentTerraceCodes(): string[] {
  return readRecentTerraceCodes();
}

export function saveRecentTerraceCode(code: string): void {
  const cleaned = String(code || '').trim();
  if (!cleaned) return;
  const next = [cleaned, ...readRecentTerraceCodes().filter((item) => item !== cleaned)];
  writeRecentTerraceCodes(next);
}

export async function getCustomerTerraceHistory(userId: number | string): Promise<TerraceHistoryItem[]> {
  const cleanedUserId = String(userId || '').trim();
  if (!cleanedUserId) return [];
  const response = await fetch(`${TERRACE_HISTORY_URL_BASE}/historie/${encodeURIComponent(cleanedUserId)}/megawood`, {
    headers: await buildAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Historie konnte nicht geladen werden (${response.status}).`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalizeTerraceHistoryItem).filter((item): item is TerraceHistoryItem => Boolean(item));
}

export async function getRecentTerraceHistoryFromStorage(): Promise<TerraceHistoryItem[]> {
  const codes = getRecentTerraceCodes();
  if (codes.length === 0) return [];
  const formData = new FormData();
  codes.forEach((code) => {
    formData.append('terrassenids[]', code);
  });
  const response = await fetch(`${TERRACE_HISTORY_URL_BASE}/datenkurzform`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Kürzhistorie konnte nicht geladen werden (${response.status}).`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalizeTerraceHistoryItem).filter((item): item is TerraceHistoryItem => Boolean(item));
}

  //is_b2b: isB2BUser(auth) || false
