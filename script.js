// --- Teaser logic ---
const params = new URLSearchParams(window.location.search);
const teaserEnabled = params.get('teaser') === '1';
const teaserEl = document.getElementById('chat-teaser');
const position = params.get('position') || 'bottom-right';
const positionClass = 'pos-' + position;

// Apply position classes to chat container, toggle and teaser
const chatContainer = document.querySelector('.chat-container');
const chatTeaser = document.getElementById('chat-teaser');
const chatToggle = document.getElementById('chat-toggle');

console.log('Chatbot position:', position, 'class:', positionClass);

if (chatContainer) {
  chatContainer.classList.add(positionClass);
  console.log('Applied class to chat-container:', positionClass);
}
if (chatTeaser) {
  chatTeaser.classList.add(positionClass);
  console.log('Applied class to teaser:', positionClass);
}
if (chatToggle) {
  chatToggle.classList.add(positionClass);
  console.log('Applied class to chat-toggle:', positionClass);
}

if (params.get('teaser-title')) document.getElementById('teaser-title').textContent = params.get('teaser-title');
if (params.get('teaser-text'))  document.getElementById('teaser-text').textContent  = params.get('teaser-text');

function hideTeaser() {
  teaserEl.classList.add('hidden');
}

if (teaserEnabled) {
  setTimeout(() => {
    // only show if chat is still closed
    if (document.querySelector('.chat-container.closed')) {
      teaserEl.classList.remove('hidden');
    }
  }, 10000);
  document.querySelector('.teaser-close').addEventListener('click', hideTeaser);
}

// remember original chat body HTML so we can reset later
const chatBody = document.querySelector('.chat-body');
const originalChatBodyHTML = chatBody ? chatBody.innerHTML : '';

// set time on initial greeting
const initTimeEl = document.getElementById('initial-time');
if (initTimeEl) initTimeEl.textContent = currentTime();
// chat session counter to disregard out-of-band responses
let chatSessionId = 0;

// active conversation ID (null until the first message is sent)
let conversationId = null;
let conversationIdCounter = 0;
let knownHistoryCount = 0;
const CONVERSATION_ID_STORAGE_KEY = 'mw-chatbot-conversation-id';
const PRESENCE_INTERVAL_MS = 60 * 1000;
let presenceIntervalId = null;

function setConversationIdDisplay(id) {
  const el = document.getElementById('conversation-id');
  if (!el) return;
  el.textContent = id ? `Kontext-ID: ${id}` : 'Kontext-ID: –';
}

function setConversationId(id) {
  const changed = conversationId !== id;
  conversationId = id;
  if (changed) knownHistoryCount = 0;
  setConversationIdDisplay(id);
  try {
    if (id) {
      localStorage.setItem(CONVERSATION_ID_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(CONVERSATION_ID_STORAGE_KEY);
    }
  } catch {
    // ignore localStorage errors (e.g. in private mode)
  }
  restartPresencePolling();
}

// restore stored conversation from previous session, if any
try {
  const stored = localStorage.getItem(CONVERSATION_ID_STORAGE_KEY);
  if (stored) {
    conversationId = stored;
    setConversationIdDisplay(conversationId);
  }
} catch {}
// Generate a random UUID for conversation tracking
function generateConversationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID but with crypto.getRandomValues
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Per RFC 4122 section 4.4: set version to 4 and variant to 10xxxxxx
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).slice(1));
    }

    return (
      byteToHex[bytes[0]] +
      byteToHex[bytes[1]] +
      byteToHex[bytes[2]] +
      byteToHex[bytes[3]] + '-' +
      byteToHex[bytes[4]] +
      byteToHex[bytes[5]] + '-' +
      byteToHex[bytes[6]] +
      byteToHex[bytes[7]] + '-' +
      byteToHex[bytes[8]] +
      byteToHex[bytes[9]] + '-' +
      byteToHex[bytes[10]] +
      byteToHex[bytes[11]] +
      byteToHex[bytes[12]] +
      byteToHex[bytes[13]] +
      byteToHex[bytes[14]] +
      byteToHex[bytes[15]]
    );
  }

  // Last-resort, non-cryptographic fallback for very old environments without crypto.
  // Avoid Math.random to reduce predictability flagged by static analysis.
  conversationIdCounter += 1;
  const timestamp = Date.now().toString(36);
  const counterPart = conversationIdCounter.toString(36);
  return 'fallback-' + timestamp + '-' + counterPart;
}

function removeInitialGreeting() {
  const chatBody = document.querySelector('.chat-body');
  const initMsg = chatBody && chatBody.querySelector('.message-wrapper.bot.initial');
  if (initMsg) initMsg.remove();
  const btnGroup = chatBody && chatBody.querySelector('.button-group');
  if (btnGroup) btnGroup.remove();
}

function appendUserMessage(text, options = {}) {
  const { trackHistory = true } = options;
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper user';
  const bubble = document.createElement('div');
  bubble.className = 'bubble user';
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  document.querySelector('.chat-body').appendChild(wrapper);
  if (trackHistory) knownHistoryCount += 1;
  scrollToBottom();
}

// --- Landscape planning editor ---
const planningUi = {
  codeInput: document.getElementById('planning-code-input'),
  loadBtn: document.getElementById('planning-load-btn'),
  status: document.getElementById('planning-status'),
  editor: document.getElementById('planning-editor')
};

const PLANNING_FORM_FIELDS = {
  rechteck: [
    { key: 'rechteck_mass_1', label: 'Breite (m)' },
    { key: 'rechteck_mass_2', label: 'Laenge (m)' }
  ],
  lform: [
    { key: 'l_width_1', label: 'L Breite 1 (m)' },
    { key: 'l_length_1', label: 'L Laenge 1 (m)' },
    { key: 'l_width_2', label: 'L Breite 2 (m)' },
    { key: 'l_length_2', label: 'L Laenge 2 (m)' }
  ],
  uform: [
    { key: 'u_width_1', label: 'U Breite 1 (m)' },
    { key: 'u_length_1', label: 'U Laenge 1 (m)' },
    { key: 'u_width_2', label: 'U Breite 2 (m)' },
    { key: 'u_length_2', label: 'U Laenge 2 (m)' },
    { key: 'u_width_3', label: 'U Breite 3 (m)' },
    { key: 'u_length_3', label: 'U Laenge 3 (m)' }
  ],
  oform: [
    { key: 'o_length_1', label: 'O Laenge 1 (m)' },
    { key: 'o_length_2', label: 'O Laenge 2 (m)' },
    { key: 'o_length_3', label: 'O Laenge 3 (m)' },
    { key: 'o_length_4', label: 'O Laenge 4 (m)' },
    { key: 'o_width_1', label: 'O Breite 1 (m)' },
    { key: 'o_width_2', label: 'O Breite 2 (m)' }
  ]
};

const DIELEN_VARIANTS = {
  1: { name: 'PREMIUM', masse: '21x145', colors: [1, 2, 3] },
  2: { name: 'PREMIUM', masse: '21x242', colors: [1, 2, 3] },
  3: { name: 'PREMIUM PLUS', masse: '21x145', colors: [4, 5] },
  4: { name: 'PREMIUM PLUS', masse: '21x242', colors: [4, 5] },
  5: { name: 'CLASSIC', masse: '21x145', colors: [1, 2, 3, 4, 5, 36, 37, 38] },
  13: { name: 'SIGNUM', masse: '21x242', colors: [6, 7] },
  14: { name: 'SIGNUM', masse: '21x145', colors: [6, 7, 26, 31, 32, 33] },
  22: { name: 'DYNUM', masse: '21x242', colors: [12, 13, 16, 17, 18] },
  23: { name: 'DYNUM', masse: '25x293', colors: [12, 13] },
  49: { name: 'DELTA', masse: '21x145', colors: [16, 17, 18, 24, 26] }
};

const DIELEN_COLORS = {
  1: 'Naturbraun',
  2: 'Nussbraun',
  3: 'Basaltgrau',
  4: 'Lavabraun',
  5: 'Schiefergrau',
  6: 'Muskat',
  7: 'Tonka',
  8: 'Terra',
  9: 'Graphit',
  10: 'Braun',
  11: 'Grau',
  12: 'Cardamom',
  13: 'Nigella',
  16: 'Sel gris',
  17: 'Ingwer',
  18: 'Lorbeer',
  19: 'Ecru',
  20: 'Jade',
  21: 'Platin',
  22: 'Umbra',
  23: 'Titan',
  24: 'Varia Grau',
  25: 'Varia Braun',
  26: 'Varia Schokoschwarz',
  27: 'Fokus gruen',
  28: 'Fokus braun',
  29: 'Fokus grau',
  30: 'Fokus Schokoschwarz',
  31: 'Malui grau',
  32: 'Mentha Nigra',
  33: 'Anise',
  34: 'Gruenschwarz',
  35: 'Sandbraun',
  36: 'Amber Tan',
  37: 'Amber Chocolate',
  38: 'Amber Grey'
};

const planningState = {
  currentCode: '',
  loadedPayload: null,
  isBusy: false,
  dimensionValuesByForm: {}
};

function setPlanningStatus(message, type) {
  if (!planningUi.status) return;
  planningUi.status.textContent = message || '';
  planningUi.status.classList.remove('is-error', 'is-success');
  if (type === 'error') planningUi.status.classList.add('is-error');
  if (type === 'success') planningUi.status.classList.add('is-success');
}

function extractTerraceCode(text) {
  const source = String(text || '');
  const labeled = source.match(/(?:planungscode|terrassencode|code)\s*(?:ist|:)?\s*[:\-]?\s*([a-z0-9_]{6,})/i);
  if (labeled && labeled[1]) return labeled[1].trim();

  const fallback = source.match(/\b(mgw[a-z0-9]{4,}|_temp[a-z0-9]{4,})\b/i);
  return fallback && fallback[1] ? fallback[1].trim() : '';
}

function parseGroesseValue(rawValue) {
  if (typeof rawValue === 'object' && rawValue !== null) return rawValue;
  if (typeof rawValue !== 'string' || !rawValue.trim()) return {};
  try {
    return JSON.parse(rawValue);
  } catch {
    return {};
  }
}

function normalizePlanningForm(rawForm) {
  const cleaned = String(rawForm || '').trim().toLowerCase();
  if (PLANNING_FORM_FIELDS[cleaned]) return cleaned;
  return cleaned || 'rechteck';
}

function toPositiveNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Number(num.toFixed(3));
}

function getDimensionValuesForForm(form, fallbackValues) {
  const fields = PLANNING_FORM_FIELDS[form] || [];
  const source = fallbackValues || {};
  return fields.reduce((acc, field) => {
    acc[field.key] = source[field.key] ?? '';
    return acc;
  }, {});
}

function readDimensionValuesFromDom(form) {
  const fields = PLANNING_FORM_FIELDS[form] || [];
  const values = {};
  fields.forEach((field) => {
    const input = document.getElementById(`planning-dim-${field.key}`);
    values[field.key] = input ? input.value : '';
  });
  return values;
}

function renderFormDimensionInputs(form, sourceValues) {
  const fields = PLANNING_FORM_FIELDS[form];
  const container = document.getElementById('planning-dimensions');
  if (!container) return;

  if (!fields || !fields.length) {
    container.innerHTML = '<p class="planning-inline-note">Diese Form ist aktuell nicht direkt editierbar. Du kannst aber Diele, Farbe, Profil und UK anpassen.</p>';
    return;
  }

  const dimensionValues = getDimensionValuesForForm(form, sourceValues);
  planningState.dimensionValuesByForm[form] = { ...dimensionValues };

  container.innerHTML = fields.map((field) => `
    <label class="planning-label" for="planning-dim-${field.key}">${field.label}</label>
    <input
      id="planning-dim-${field.key}"
      class="planning-input"
      type="number"
      min="0.1"
      step="0.01"
      value="${dimensionValues[field.key] ?? ''}"
    >
  `).join('');
}

function buildDielenOptions(selectedDielenId) {
  return Object.entries(DIELEN_VARIANTS)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, variant]) => {
      const isSelected = Number(selectedDielenId) === Number(id);
      const label = `${variant.name} ${variant.masse}`;
      return `<option value="${id}" ${isSelected ? 'selected' : ''}>${label}</option>`;
    })
    .join('');
}

function buildColorOptionsForDielen(dielenId, selectedColorId) {
  const variant = DIELEN_VARIANTS[Number(dielenId)] || DIELEN_VARIANTS[5];
  const allowedColors = variant.colors || [];

  return allowedColors
    .map((colorId) => {
      const selected = Number(selectedColorId) === Number(colorId);
      const colorName = DIELEN_COLORS[colorId] || `Farbe ${colorId}`;
      return `<option value="${colorId}" ${selected ? 'selected' : ''}>${colorName}</option>`;
    })
    .join('');
}

function refreshDielenColorOptions(preferredColorId) {
  const dielenSelect = document.getElementById('planning-dielen-id');
  const colorSelect = document.getElementById('planning-dielen-farbe-id');
  if (!dielenSelect || !colorSelect) return;

  const dielenId = Number(dielenSelect.value || 5);
  const variant = DIELEN_VARIANTS[dielenId] || DIELEN_VARIANTS[5];
  const currentColorId = Number(preferredColorId ?? colorSelect.value);
  const compatibleColors = variant.colors || [];
  const nextColorId = compatibleColors.includes(currentColorId) ? currentColorId : compatibleColors[0];
  colorSelect.innerHTML = buildColorOptionsForDielen(dielenId, nextColorId);
}

function buildPlanningSummaryMessage(payload) {
  const code = payload?.terrassencode || planningState.currentCode || 'deiner Planung';
  const form = normalizePlanningForm(payload?.form || '');
  const dielenId = Number(payload?.dielenId || 5);
  const colorId = Number(payload?.dielenFarbeId || 37);
  const dielenLabel = DIELEN_VARIANTS[dielenId]
    ? `${DIELEN_VARIANTS[dielenId].name} ${DIELEN_VARIANTS[dielenId].masse}`
    : `ID ${dielenId}`;
  const colorLabel = DIELEN_COLORS[colorId] || `ID ${colorId}`;
  const profil = payload?.profil || 'bronze';
  const uk = payload?.uk || 'standard';

  return [
    `Ich habe deine Planung ${code} geladen.`,
    `Aktuell: Form ${form}, Diele ${dielenLabel}, Farbe ${colorLabel}, Profil ${profil}, UK ${uk}.`,
    'Sag mir einfach, was ich als Naechstes fuer dich anpassen soll.'
  ].join(' ');
}

function renderPlanningEditor(payload) {
  if (!planningUi.editor) return;

  const form = normalizePlanningForm(payload.form);
  const groesseObj = parseGroesseValue(payload.groesse);
  const dielenId = Number(payload.dielenId || 5);
  const dielenFarbeId = Number(payload.dielenFarbeId || 37);

  planningState.dimensionValuesByForm[form] = getDimensionValuesForForm(form, groesseObj);

  const hasKnownForm = Boolean(PLANNING_FORM_FIELDS[form]);
  const knownForms = ['rechteck', 'lform', 'uform', 'oform'];
  const dynamicCurrentFormOption = hasKnownForm
    ? ''
    : `<option value="${form}" selected>Bestehende Form (${form})</option>`;

  planningUi.editor.innerHTML = `
    <strong class="planning-editor-title">Geladene Planung: ${payload.terrassencode || planningState.currentCode}</strong>
    <div class="planning-form-grid">
      <label class="planning-label" for="planning-form">Form</label>
      <select id="planning-form" class="planning-input">
        <option value="rechteck" ${form === 'rechteck' ? 'selected' : ''}>Rechteck</option>
        <option value="lform" ${form === 'lform' ? 'selected' : ''}>L-Form</option>
        <option value="uform" ${form === 'uform' ? 'selected' : ''}>U-Form</option>
        <option value="oform" ${form === 'oform' ? 'selected' : ''}>O-Form</option>
        ${dynamicCurrentFormOption}
      </select>

      <div id="planning-dimensions" class="planning-dimensions-block"></div>

      <label class="planning-label" for="planning-dielen-id">Diele</label>
      <select id="planning-dielen-id" class="planning-input">
        ${buildDielenOptions(dielenId)}
      </select>

      <label class="planning-label" for="planning-dielen-farbe-id">Dielenfarbe</label>
      <select id="planning-dielen-farbe-id" class="planning-input">
        ${buildColorOptionsForDielen(dielenId, dielenFarbeId)}
      </select>

      <label class="planning-label" for="planning-profil">Profil</label>
      <select id="planning-profil" class="planning-input">
        <option value="bronze" ${(payload.profil || 'bronze') === 'bronze' ? 'selected' : ''}>bronze</option>
        <option value="silver" ${payload.profil === 'silver' ? 'selected' : ''}>silver</option>
        <option value="anthracite" ${payload.profil === 'anthracite' ? 'selected' : ''}>anthracite</option>
      </select>

      <label class="planning-label" for="planning-uk">UK</label>
      <select id="planning-uk" class="planning-input">
        <option value="standard" ${(payload.uk || 'standard') === 'standard' ? 'selected' : ''}>standard</option>
        <option value="variofix1" ${payload.uk === 'variofix1' ? 'selected' : ''}>variofix1</option>
        <option value="variofix2" ${payload.uk === 'variofix2' ? 'selected' : ''}>variofix2</option>
      </select>

    </div>
    <div class="planning-actions-row">
      <button id="planning-reload-btn" class="side-menu-btn" type="button">Neu laden</button>
      <button id="planning-save-btn" class="side-menu-btn side-menu-btn-primary" type="button">Speichern</button>
    </div>
  `;

  renderFormDimensionInputs(form, planningState.dimensionValuesByForm[form] || groesseObj);

  const formSelect = document.getElementById('planning-form');
  if (formSelect) {
    formSelect.addEventListener('change', () => {
      const previousForm = normalizePlanningForm(payload.form);
      if (PLANNING_FORM_FIELDS[previousForm]) {
        planningState.dimensionValuesByForm[previousForm] = readDimensionValuesFromDom(previousForm);
      }
      const nextForm = normalizePlanningForm(formSelect.value);
      renderFormDimensionInputs(nextForm, planningState.dimensionValuesByForm[nextForm]);
      payload.form = nextForm;
    });
  }

  refreshDielenColorOptions(dielenFarbeId);
  planningUi.editor.classList.remove('hidden');
}

function resetPlanningEditor() {
  planningState.currentCode = '';
  planningState.loadedPayload = null;
  planningState.isBusy = false;
  planningState.dimensionValuesByForm = {};
  if (planningUi.codeInput) planningUi.codeInput.value = '';
  if (planningUi.editor) {
    planningUi.editor.classList.add('hidden');
    planningUi.editor.innerHTML = '';
  }
  setPlanningStatus('');
}

function buildPlanningPayloadFromEditor() {
  if (!planningState.loadedPayload) {
    throw new Error('Es sind noch keine Planungsdaten geladen.');
  }

  const payload = { ...planningState.loadedPayload };
  const form = document.getElementById('planning-form')?.value || 'rechteck';

  let groesseObj = parseGroesseValue(payload.groesse);
  if (PLANNING_FORM_FIELDS[form]) {
    const formFields = PLANNING_FORM_FIELDS[form];
    const collected = {};
    for (const field of formFields) {
      const value = toPositiveNumber(document.getElementById(`planning-dim-${field.key}`)?.value);
      if (value === null) {
        throw new Error(`Bitte '${field.label}' als Zahl groesser 0 eingeben.`);
      }
      collected[field.key] = value;
    }
    groesseObj = collected;
  }

  payload.terrassencode = planningState.currentCode;
  payload.form = form;
  payload.groesse = JSON.stringify(groesseObj);
  payload.dielenId = document.getElementById('planning-dielen-id')?.value || payload.dielenId || '5';
  payload.dielenFarbeId = document.getElementById('planning-dielen-farbe-id')?.value || payload.dielenFarbeId || '37';
  payload.profil = document.getElementById('planning-profil')?.value || payload.profil;
  payload.uk = document.getElementById('planning-uk')?.value || payload.uk;
  // language is not editable in the widget; preserve existing or default to 'de'
  payload.language = payload.language || 'de';
  payload._tempSave = String(payload._tempSave || 'false');

  return payload;
}

async function loadPlanningByCode(terraceCode, options = {}) {
  if (!planningUi.codeInput || !planningUi.loadBtn || !planningUi.editor) return;
  if (planningState.isBusy) return;

  const { announceInChat = false } = options;

  const code = String(terraceCode || planningUi.codeInput.value || '').trim();
  if (!code) {
    setPlanningStatus('Bitte zuerst einen Planungscode eingeben.', 'error');
    return;
  }

  planningState.isBusy = true;
  planningUi.loadBtn.disabled = true;
  setPlanningStatus('Planungsdaten werden geladen ...');

  try {
    const payload = await loadTerracePlanData(code);
    planningState.currentCode = payload.terrassencode;
    planningState.loadedPayload = payload;
    planningUi.codeInput.value = planningState.currentCode;
    renderPlanningEditor(payload);
    setPlanningStatus('Planungsdaten erfolgreich geladen.', 'success');
    if (announceInChat) {
      removeInitialGreeting();
      addBotMessage(buildPlanningSummaryMessage(payload));
    }
  } catch (err) {
    setPlanningStatus(err.message || 'Planung konnte nicht geladen werden.', 'error');
  } finally {
    planningState.isBusy = false;
    planningUi.loadBtn.disabled = false;
  }
}

async function savePlanningChanges() {
  if (!planningUi.editor || planningState.isBusy) return;

  const saveBtn = document.getElementById('planning-save-btn');
  if (saveBtn) saveBtn.disabled = true;
  planningState.isBusy = true;
  setPlanningStatus('Aenderungen werden gespeichert ...');

  try {
    const payload = buildPlanningPayloadFromEditor();
    const saveResult = await saveTerracePlanData(payload);
    const nextCode = saveResult.terrassencode || planningState.currentCode;
    await loadPlanningByCode(nextCode);
    setPlanningStatus(`Planung gespeichert. Aktueller Code: ${nextCode}`, 'success');
  } catch (err) {
    setPlanningStatus(err.message || 'Speichern fehlgeschlagen.', 'error');
  } finally {
    planningState.isBusy = false;
    if (saveBtn) saveBtn.disabled = false;
  }
}

function syncPlanningCodeFromAnswer(answerText) {
  const extractedCode = extractTerraceCode(answerText);
  if (!planningUi.codeInput || !extractedCode) return;

  const currentInputCode = String(planningUi.codeInput.value || '').trim();
  if (currentInputCode.toLowerCase() === extractedCode.toLowerCase()) return;

  planningUi.codeInput.value = extractedCode;
  setPlanningStatus(`Planungscode erkannt: ${extractedCode}`);
  loadPlanningByCode(extractedCode);
}

function initPlanningEditor() {
  if (!planningUi.codeInput || !planningUi.loadBtn || !planningUi.editor) return;

  planningUi.loadBtn.addEventListener('click', () => {
    loadPlanningByCode(planningUi.codeInput.value, { announceInChat: true });
    chatSessionId += 1; // new context when loading manually
  });

  planningUi.codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loadPlanningByCode(planningUi.codeInput.value, { announceInChat: true });
    }
  });

  planningUi.editor.addEventListener('click', (e) => {
    const saveBtn = e.target.closest('#planning-save-btn');
    if (saveBtn) {
      savePlanningChanges();
      return;
    }
    const reloadBtn = e.target.closest('#planning-reload-btn');
    if (reloadBtn) {
      loadPlanningByCode(planningState.currentCode || planningUi.codeInput.value);
    }
  });

  planningUi.editor.addEventListener('change', (e) => {
    const dielenSelect = e.target.closest('#planning-dielen-id');
    if (dielenSelect) {
      refreshDielenColorOptions();
    }
  });
}

// --- Chat toggle ---
const chat = document.querySelector('.chat-container');
const toggle = document.getElementById('chat-toggle');
toggle.addEventListener('click', () => {
  chat.classList.remove('closed');
  toggle.classList.add('hidden');
  hideTeaser();
});
// add a close icon handler (keep conversation context when hiding)
const closeIcon = document.querySelector('.header-icons span:last-child');
if (closeIcon) {
  closeIcon.addEventListener('click', () => {
    // Keep conversationId and chat history intact when closing the widget.
    // This allows users to reopen the chat and continue where they left off.
    chat.classList.add('closed');
    toggle.classList.remove('hidden');
  });
}
// refresh button: reset conversation in-place without closing the window
const refreshIcon = document.querySelector('.header-icons span:first-child');
if (refreshIcon) {
  refreshIcon.addEventListener('click', () => {
    if (conversationId) {
      deleteConversation(conversationId);
      setConversationId(null);
      knownHistoryCount = 0;
      chatBody.innerHTML = originalChatBodyHTML;
      // reset timestamp if present
      const initTimeEl2 = document.getElementById('initial-time');
      if (initTimeEl2) initTimeEl2.textContent = currentTime();
    }
    resetPlanningEditor();
    // bump session id: ignore any inflight responses
    chatSessionId += 1;
  });
}

// utility: scroll chat to bottom
function scrollToBottom() {
  const body = document.querySelector('.chat-body');
  body.scrollTop = body.scrollHeight;
}

// show animated thinking indicator; returns a cleanup function
function showThinkingIndicator() {
  const messages = [
    'Ich lese deine Nachricht',
    'Woody denkt nach',
    'Ich gucke im meiner Wissensdatenbank nach',
    'Woody bereitet seine Antwort vor',
  ];
  let idx = 0;

  const wrapper = document.createElement('div');
  wrapper.className = 'thinking-indicator';
  wrapper.innerHTML = `
    <div class="bot-icon"><img src="woody.png" alt="Woody"></div>
    <div class="thinking-text">
      <span class="thinking-label">${messages[0]}</span>
      <span class="thinking-dots"><span></span><span></span><span></span></span>
    </div>
  `;
  document.querySelector('.chat-body').appendChild(wrapper);
  scrollToBottom();

  const label = wrapper.querySelector('.thinking-label');
  const intervalId = setInterval(() => {
    idx = (idx + 1) % messages.length;
    label.style.opacity = '0';
    setTimeout(() => {
      label.textContent = messages[idx];
      label.style.opacity = '1';
    }, 350);
  }, 2500);

  return function removeIndicator() {
    clearInterval(intervalId);
    wrapper.remove();
  };
}

// minimal markdown → HTML renderer (bold, bullets, line breaks)
function renderMarkdown(text) {
  return text
    // escape HTML entities first
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // bullet lines: lines starting with * or - followed by spaces
    .replace(/^[\*\-][ \t]+(.+)/gm, '<li>$1</li>')
    // wrap consecutive <li> blocks in <ul>
    .replace(/(<li>.*<\/li>\n?)+/gs, match => `<ul>${match}</ul>`)
    // paragraphs: double newlines
    .split(/\n{2,}/).map(p => p.trim())
      .filter(Boolean)
      .map(p => p.startsWith('<ul>') ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// utility for bot replies: bubble with avatar icon
function currentTime() {
  return new Date().toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
}

function makeBotMeta(plainText) {
  const meta = document.createElement('div');
  meta.className = 'bot-meta';
  meta.innerHTML = `
    <button class="thumb-btn thumb-up" title="Hilfreich"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
    <button class="thumb-btn thumb-down" title="Nicht hilfreich"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
    <button class="copy-btn" title="Kopieren"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
    <button class="speak-btn" title="Vorlesen"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>
    <span class="meta-time">${currentTime()}</span>
    <span class="meta-brand">Erstellt von megawood KI</span>
  `;

  // Thumbs up / down
  const thumbUp = meta.querySelector('.thumb-up');
  const thumbDown = meta.querySelector('.thumb-down');
  thumbUp.addEventListener('click', () => {
    const active = thumbUp.classList.toggle('active');
    if (active) thumbDown.classList.remove('active');
  });
  thumbDown.addEventListener('click', () => {
    const active = thumbDown.classList.toggle('active');
    if (active) thumbUp.classList.remove('active');
  });

  // Copy
  meta.querySelector('.copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(plainText).then(() => {
      const btn = meta.querySelector('.copy-btn');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      setTimeout(() => { btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }, 1500);
    });
  });

  // Speaker / Text-to-speech
  const speakBtn = meta.querySelector('.speak-btn');
  speakBtn.addEventListener('click', () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speakBtn.classList.remove('active');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = 'de-DE';
    utterance.onend = () => speakBtn.classList.remove('active');
    utterance.onerror = () => speakBtn.classList.remove('active');
    speakBtn.classList.add('active');
    window.speechSynthesis.speak(utterance);
  });

  return meta;
}

/**
 * @param {string} answer   - plain-text / markdown answer from the API
 * @param {string[]} sources - optional array of source URLs
 */
function addBotMessage(answer, sources, imageUrl, options = {}) {
  const { trackHistory = true } = options;
  const safeAnswer = typeof answer === 'string' ? answer : '';
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot';

  const icon = document.createElement('div');
  icon.className = 'bot-icon';
  icon.innerHTML = '<img src="woody.png" alt="Woody">';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (safeAnswer) {
    bubble.innerHTML = renderMarkdown(safeAnswer);
  }

  if (imageUrl) {
    const img = document.createElement('img');
    img.className = 'bubble-image';
    img.src = imageUrl;
    img.alt = 'Support Bild';
    img.loading = 'lazy';
    bubble.appendChild(img);
  }

  // sources block
  let sourcesEl = null;
  if (sources && sources.length) {
    sourcesEl = document.createElement('div');
    sourcesEl.className = 'bot-sources';
    sourcesEl.innerHTML = '<span class="sources-label">Quellen</span>' +
      sources.map(url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`).join('');
  }

  const right = document.createElement('div');
  right.className = 'bot-bubble-col';
  right.appendChild(bubble);
  if (sourcesEl) right.appendChild(sourcesEl);
  right.appendChild(makeBotMeta(safeAnswer || 'Bild vom Support'));

  wrapper.appendChild(icon);
  wrapper.appendChild(right);
  document.querySelector('.chat-body').appendChild(wrapper);
  if (trackHistory) knownHistoryCount += 1;
  scrollToBottom();
}

function renderHistoryTurn(turn, options = {}) {
  if (!turn || !turn.role) return false;
  const { trackHistory = false } = options;
  const text = typeof turn.text === 'string' ? turn.text : '';
  const imageUrl = typeof turn.image_url === 'string' ? turn.image_url : '';

  if (turn.role === 'user') {
    if (!text) return false;
    appendUserMessage(text, { trackHistory });
    return true;
  }

  if (turn.role === 'model' || turn.role === 'assistant' || turn.role === 'admin') {
    if (!text && !imageUrl) return false;
    addBotMessage(text, [], imageUrl, { trackHistory });
    return true;
  }

  return false;
}

function isPresenceEligible() {
  return !document.hidden && document.hasFocus();
}

async function sendPresenceHeartbeat() {
  if (!conversationId || !isPresenceEligible()) return;
  try {
    const status = await sendPresenceStatus(conversationId, knownHistoryCount);
    if (Array.isArray(status.new_messages) && status.new_messages.length) {
      removeInitialGreeting();
      status.new_messages.forEach((turn) => {
        renderHistoryTurn(turn, { trackHistory: false });
      });
    }
    if (typeof status.history_count === 'number') {
      knownHistoryCount = Math.max(0, status.history_count);
    }
  } catch (err) {
    if (err && err.message && err.message.includes('404')) {
      setConversationId(null);
      knownHistoryCount = 0;
    }
    console.warn('Presence-Status konnte nicht aktualisiert werden:', err);
  }
}

function clearPresencePolling() {
  if (presenceIntervalId) {
    clearInterval(presenceIntervalId);
    presenceIntervalId = null;
  }
}

function restartPresencePolling() {
  clearPresencePolling();
  if (!conversationId) return;
  sendPresenceHeartbeat();
  presenceIntervalId = setInterval(() => {
    sendPresenceHeartbeat();
  }, PRESENCE_INTERVAL_MS);
}

// send button behavior: echo user message and optionally respond
const sendBtn = document.querySelector('.send-btn');
const input = document.getElementById('chat-input');

function sendUserMessage(text) {
  if (!text) return;
  removeInitialGreeting();
  // Generate a conversation ID on the very first message of a session
  if (!conversationId) {
    setConversationId(generateConversationId());
  }
  const mySession = chatSessionId;
  const myConversationId = conversationId;
  appendUserMessage(text);

  // Also recognize planning codes when users type them themselves.
  syncPlanningCodeFromAnswer(text);

  // show thinking indicator while waiting for response
  const removeIndicator = showThinkingIndicator();
  // call the real API with the active conversation ID
  sendMessage(text, myConversationId)
    .then(({ answer, sources, conversation_id }) => {
      if (mySession !== chatSessionId) return; // outdated response
      // Keep conversation ID in sync with whatever the backend returns
      if (conversation_id) {
        setConversationId(conversation_id);
      }
      removeIndicator();
      syncPlanningCodeFromAnswer(answer);
      removeInitialGreeting();
      addBotMessage(answer, sources);
    })
    .catch(err => {
      removeIndicator();
      addBotMessage(
        'Es tut mir leid, ich konnte keine Verbindung zum Server herstellen. Bitte versuche es später erneut, oder kontaktiere unseren Support.',
        [],
        '',
        { trackHistory: false }
      );
      console.error(err);
    });
}

// click on quick-reply buttons (event delegation — works after reset too)
document.querySelector('.chat-body').addEventListener('click', (e) => {
  const btn = e.target.closest('.chat-btn:not([disabled])');
  if (!btn) return;
  sendUserMessage(btn.dataset.message || btn.textContent.trim());
});

// Brand popup: show on .meta-brand click
const brandPopup = document.getElementById('brand-popup');
document.addEventListener('click', (e) => {
  const brand = e.target.closest('.meta-brand');
  if (brand) {
    e.stopPropagation();
    // temporarily make visible to measure height
    brandPopup.style.visibility = 'hidden';
    brandPopup.classList.remove('hidden');
    const popupH = brandPopup.offsetHeight;
    const popupW = brandPopup.offsetWidth;
    brandPopup.style.visibility = '';
    const rect = brand.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - popupW - 8));
    const topAbove = rect.top - popupH - 8;
    brandPopup.style.left = left + 'px';
    brandPopup.style.top = (topAbove < 8 ? rect.bottom + 8 : topAbove) + 'px';
    return;
  }
  if (!brandPopup.classList.contains('hidden') && !brandPopup.contains(e.target)) {
    brandPopup.classList.add('hidden');
  }
});

initPlanningEditor();

async function restoreConversationFromStorage() {
  if (!conversationId) return;
  try {
    const data = await getConversation(conversationId);
    if (!data || !Array.isArray(data.history) || !data.history.length) return;

    // Replace the initial greeting + button group with restored chat history
    removeInitialGreeting();

    data.history.forEach((turn) => {
      renderHistoryTurn(turn, { trackHistory: false });
    });
    knownHistoryCount = data.history.length;
    scrollToBottom();
  } catch (err) {
    // If the stored conversation no longer exists on the backend, clear local state.
    if (err && err.message && err.message.includes('404')) {
      setConversationId(null);
      knownHistoryCount = 0;
    }
    console.warn('Kontext konnte nicht geladen werden:', err);
  }
}

restoreConversationFromStorage();
restartPresencePolling();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) sendPresenceHeartbeat();
});

window.addEventListener('focus', () => {
  sendPresenceHeartbeat();
});

window.addEventListener('beforeunload', () => {
  clearPresencePolling();
});

if (sendBtn && input) {
  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    sendUserMessage(text);
    input.value = '';
    input.style.height = 'auto';
  });
  // also send on enter (shift+enter = newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendBtn.click();
      e.preventDefault();
    }
  });
  // auto-grow textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });
}
