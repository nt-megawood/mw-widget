// API service for communicating with the megawood chatbot backend

const DEFAULT_API_URL = 'https://mw-chatbot-backend.vercel.app/chat';
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN as string;
const TERRACE_LOAD_URL = 'https://betaplaner.megawood.com/api/terrassedaten/ladeDaten';
const TERRACE_SAVE_URL = 'https://betaplaner.megawood.com/api/terrassedaten/speichereDaten';

import type { ApiResponse, PresenceResponse, ConversationResponse, TerracePlanData } from '../types';

function getApiUrl(): string {
  return (window as unknown as Record<string, string>).CHATBOT_API_URL || DEFAULT_API_URL;
}

function getConversationUrl(): string {
  return getApiUrl().replace(/\/chat$/, '/conversation');
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

export async function sendMessage(message: string, conversationId: string | null): Promise<ApiResponse> {
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: buildAuthHeaders(true),
    body: JSON.stringify({ message, conversation_id: conversationId }),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function getConversation(conversationId: string): Promise<ConversationResponse> {
  const response = await fetch(`${getConversationUrl()}/${conversationId}`, {
    headers: buildAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Conversation error: ${response.status}`);
  return response.json();
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await fetch(`${getConversationUrl()}/${conversationId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  }).catch(() => {});
}

export async function sendPresenceStatus(
  conversationId: string,
  knownHistoryCount: number
): Promise<PresenceResponse> {
  const response = await fetch(`${getConversationUrl()}/${conversationId}/presence`, {
    method: 'POST',
    headers: buildAuthHeaders(true),
    body: JSON.stringify({ known_history_count: knownHistoryCount }),
  });
  if (!response.ok) throw new Error(`Presence error: ${response.status}`);
  return response.json();
}

export async function loadTerracePlanData(terraceCode: string): Promise<TerracePlanData> {
  const formData = new FormData();
  formData.append('terrassen_code', terraceCode);
  const response = await fetch(TERRACE_LOAD_URL, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Terrace load error: ${response.status}`);
  return response.json();
}

export async function saveTerracePlanData(payload: TerracePlanData): Promise<{ terrassencode: string }> {
  const formData = new FormData();
  formData.append('planungsdaten', JSON.stringify(payload));
  const response = await fetch(TERRACE_SAVE_URL, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(`Terrace save error: ${response.status}`);
  return response.json();
}
