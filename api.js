const API_URL = window.CHATBOT_API_URL || 'https://mw-chatbot-backend.vercel.app/chat';
// Derive the conversation base URL by stripping the trailing '/chat' segment.
// Falls back gracefully to a sibling '/conversation' path if the URL doesn't end with '/chat'.
const CONVERSATION_URL = API_URL.endsWith('/chat')
  ? API_URL.slice(0, -5) + '/conversation'
  : API_URL + '/conversation';
const TERRACE_LOAD_URL = 'https://betaplaner.megawood.com/api/terrassedaten/ladeDaten';
const TERRACE_SAVE_URL = 'https://betaplaner.megawood.com/api/terrassedaten/speichereDaten';

/**
 * Send a message to the chatbot API.
 * @param {string} message
 * @param {string|null} conversationId - existing conversation ID, or null for first message
 * @returns {Promise<{ answer: string, sources: string[], conversation_id: string }>}
 */
async function sendMessage(message, conversationId) {
  const body = { message };
  if (conversationId) body.conversation_id = conversationId;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 42vombj8mp9an8jv5evp3vfup8izma7oh9yxma4tp9b6anemudxb2ei3bw2koiqyx7umnp55w3rodpp79k6izp27wchm2u2vjvviwwvqxqgb2j859c4dk2g4s6k7wpct'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
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
      headers: {
        'Authorization': 'Bearer 42vombj8mp9an8jv5evp3vfup8izma7oh9yxma4tp9b6anemudxb2ei3bw2koiqyx7umnp55w3rodpp79k6izp27wchm2u2vjvviwwvqxqgb2j859c4dk2g4s6k7wpct'
      }
    });
  } catch (_) {
    // Best-effort cleanup — ignore network errors
  }
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
