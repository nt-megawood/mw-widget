// --- Teaser logic ---
const params = new URLSearchParams(window.location.search);
const teaserEnabled = params.get('teaser') === '1';
const teaserEl = document.getElementById('chat-teaser');
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

// set time on initial greeting
const initTimeEl = document.getElementById('initial-time');
if (initTimeEl) initTimeEl.textContent = currentTime();

// --- Chat toggle ---
const chat = document.querySelector('.chat-container');
const toggle = document.getElementById('chat-toggle');
toggle.addEventListener('click', () => {
  chat.classList.remove('closed');
  toggle.classList.add('hidden');
  hideTeaser();
});
// add a close icon handler
const closeIcon = document.querySelector('.header-icons span:last-child');
if (closeIcon) {
  closeIcon.addEventListener('click', () => {
    chat.classList.add('closed');
    toggle.classList.remove('hidden');
  });
}
// refresh button: reset conversation in-place without closing the window
const refreshIcon = document.querySelector('.header-icons span:first-child');
if (refreshIcon) {
  refreshIcon.addEventListener('click', () => {
    const chatBody = document.querySelector('.chat-body');
    // remove all messages and button groups added during the session
    chatBody.querySelectorAll('.message-wrapper, .button-group').forEach(el => el.remove());
    // restore initial greeting
    chatBody.insertAdjacentHTML('afterbegin', `
      <div class="message-wrapper bot initial">
        <div class="bot-icon"><img src="woody.jpg" alt="Woody"></div>
        <div class="bot-bubble-col">
          <div class="bubble">
            <p>Willkommen bei megawood&#174;! &#128075;</p>
            <p>Ich bin <b>Woody</b>, die megawood&#174; KI! Du kannst mir alle Fragen zu unseren Produkten stellen.</p>
            <p>Womit kann ich dir heute helfen?</p>
          </div>
          <div class="bot-meta">
            <span class="meta-time">${currentTime()}</span>
            <span class="meta-brand">Erstellt von megawood KI</span>
          </div>
        </div>
      </div>
      <div class="button-group">
          <button class="chat-btn" data-message="Was kannst du alles für mich tun?">Wie kannst du mir helfen?</button>
          <button class="chat-btn" data-message="Erzähl mir mehr über die megawood® Dielen und ihre Eigenschaften.">Informationen zu den megawood&#174; Dielen</button>
          <button class="chat-btn" data-message="Ich suche einen Händler in meiner Nähe.">Händlersuche</button>
      </div>
    `);
    // clear input field
    document.getElementById('chat-input').value = '';
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
    <div class="bot-icon"><img src="woody.jpg" alt="Woody"></div>
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
function addBotMessage(answer, sources) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot';

  const icon = document.createElement('div');
  icon.className = 'bot-icon';
  icon.innerHTML = '<img src="woody.jpg" alt="Woody">';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = renderMarkdown(answer);

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
  right.appendChild(makeBotMeta(answer));

  wrapper.appendChild(icon);
  wrapper.appendChild(right);
  document.querySelector('.chat-body').appendChild(wrapper);
  scrollToBottom();
}

// send button behavior: echo user message and optionally respond
const sendBtn = document.querySelector('.send-btn');
const input = document.getElementById('chat-input');

function sendUserMessage(text) {
  if (!text) return;
  // remove initial greeting + buttons if still present
  const initMsg = document.querySelector('.chat-body .message-wrapper.bot.initial');
  if (initMsg) {
    initMsg.remove();
    const btnGroup = document.querySelector('.button-group');
    if (btnGroup) btnGroup.remove();
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper user';
  const bubble = document.createElement('div');
  bubble.className = 'bubble user';
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  document.querySelector('.chat-body').appendChild(wrapper);
  scrollToBottom();
  // show thinking indicator while waiting for response
  const removeIndicator = showThinkingIndicator();
  // call the real API
  sendMessage(text)
    .then(({ answer, sources }) => {
      removeIndicator();
      addBotMessage(answer, sources);
    })
    .catch(err => {
      removeIndicator();
      addBotMessage('Es tut mir leid, ich konnte keine Verbindung zum Server herstellen. Bitte versuche es später erneut.');
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
