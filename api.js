const API_URL = window.CHATBOT_API_URL || 'http://localhost:8000/chat';
// Derive the conversation base URL by replacing known chat endpoints.
// This ensures '/terrassenplaner/chat' -> '/conversation' (not '/terrassenplaner/conversation').
const CONVERSATION_URL = API_URL
  .replace(/\/terrassenplaner\/chat$/, '/conversation')
  .replace(/\/chat$/, '/conversation');
const AUTH_TOKEN = '42vombj8mp9an8jv5evp3vfup8izma7oh9yxma4tp9b6anemudxb2ei3bw2koiqyx7umnp55w3rodpp79k6izp27wchm2u2vjvviwwvqxqgb2j859c4dk2g4s6k7wpct';
const TERRACE_LOAD_URL = 'https://betaplaner.megawood.com/api/terrassedaten/ladeDaten';
const TERRACE_SAVE_URL = 'https://betaplaner.megawood.com/api/terrassedaten/speichereDaten';

function buildAuthHeaders(includeJsonContentType = false) {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  };
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

/**
 * Send a message to the chatbot API.
 * @param {string} message
 * @param {string|null} conversationId - existing conversation ID, or null for first message
 * @returns {Promise<{ answer: string, sources: string[], conversation_id?: string }>}
 */
async function sendMessage(message, conversationId) {
  const body = { message };
  if (conversationId) body.conversation_id = conversationId;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: buildAuthHeaders(true),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches the stored conversation history from the backend.
 * @param {string} conversationId
 * @returns {Promise<{ conversation_id: string, history: Array<{role:string,text:string}> }>} 
 */
async function getConversation(conversationId) {
  if (!conversationId) throw new Error('Konversations-ID fehlt');
  const response = await fetch(`${CONVERSATION_URL}/${encodeURIComponent(conversationId)}`, {
    method: 'GET',
    headers: buildAuthHeaders(false)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kontext konnte nicht geladen werden: ${response.status} ${response.statusText} - ${body}`);
  }

  return response.json();
}

/**
 * Delete (end) a conversation on the backend, discarding its context.
 * Fire-and-forget: errors are silently ignored so the UI is never blocked.
 * @param {string} conversationId
 */
async function deleteConversation(conversationId) {
  if (!conversationId) return;
  try {
    await fetch(`${CONVERSATION_URL}/${encodeURIComponent(conversationId)}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(false)
    });
  } catch (_) {
    // Best-effort cleanup — ignore network errors
  }
}

/**
 * Presence heartbeat from the widget. Returns active status and any new messages.
 * @param {string} conversationId
 * @param {number} knownHistoryCount
 * @returns {Promise<{conversation_id:string,last_seen_at:string|null,is_active:boolean,history_count:number,new_messages:Array<object>}>}
 */
async function sendPresenceStatus(conversationId, knownHistoryCount) {
  if (!conversationId) throw new Error('Konversations-ID fehlt');

  const response = await fetch(`${CONVERSATION_URL}/${encodeURIComponent(conversationId)}/presence`, {
    method: 'POST',
    headers: buildAuthHeaders(true),
    body: JSON.stringify({ known_history_count: Math.max(0, Number(knownHistoryCount) || 0) })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Presence-Status konnte nicht gesendet werden: ${response.status} ${response.statusText} - ${body}`);
  }

  return response.json();
}

function appendFormValue(formData, key, value) {
  if (value === undefined || value === null) return;
  if (typeof value === 'string') {
    formData.append(key, value);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    formData.append(key, String(value));
    return;
  }
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    // The planner API expects JSON-like fields as serialized JSON strings.
    formData.append(key, JSON.stringify(value));
    return;
  }
  formData.append(key, String(value));
}

/**
 * Load terrace planner data by plan code.
 * @param {string} terraceCode
 * @returns {Promise<object>}
 */
async function loadTerracePlanData(terraceCode) {
  const cleanedCode = String(terraceCode || '').trim();
  if (!cleanedCode) throw new Error('Bitte einen gueltigen Planungscode angeben.');

  const formData = new FormData();
  appendFormValue(formData, 'terrassencode', cleanedCode);

  const response = await fetch(TERRACE_LOAD_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Planungsdaten konnten nicht geladen werden (${response.status}).`);
  }

  const result = await response.json();
  if (!result || !result.terrassencode) {
    throw new Error('Die Planer-API hat keine gueltigen Daten zurueckgegeben.');
  }
  return result;
}

/**
 * Save a terrace planner payload and return the API response.
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function saveTerracePlanData(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Ungueltige Planungsdaten zum Speichern.');
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    appendFormValue(formData, key, value);
  });

  const response = await fetch(TERRACE_SAVE_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Planung konnte nicht gespeichert werden (${response.status}).`);
  }

  const result = await response.json();
  if (!result || !result.terrassencode) {
    throw new Error('Die Planer-API hat keinen Planungscode zurueckgegeben.');
  }
  return result;
}
