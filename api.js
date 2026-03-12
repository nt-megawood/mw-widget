const API_URL = window.CHATBOT_API_URL || 'https://mw-chatbot-backend.vercel.app/chat';

/**
 * Send a message to the chatbot API.
 * @param {string} message
 * @returns {Promise<{ answer: string, sources: string[] }>}
 */
async function sendMessage(message) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 42vombj8mp9an8jv5evp3vfup8izma7oh9yxma4tp9b6anemudxb2ei3bw2koiqyx7umnp55w3rodpp79k6izp27wchm2u2vjvviwwvqxqgb2j859c4dk2g4s6k7wpct'
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
