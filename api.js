const API_URL = window.CHATBOT_API_URL || 'https://mw-chatbot-backend.vercel.app/chat';

/**
 * Send a message to the chatbot API.
 * @param {string} message
 * @returns {Promise<{ answer: string, sources: string[] }>}
 */
async function sendMessage(message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
