(function(){
  const script = document.currentScript;
  // URL zur index.html des Chatbots (deine echte Version)
  const widgetUrl = (script && script.getAttribute('data-chatbot-url')) || 'https://nt-megawood.github.io/mw-widget/index.html';

  // Transparentes iframe — die index.html bringt ihren eigenen Toggle-Button mit
  const iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.id = 'gh-chatbot-iframe';
  iframe.title = 'Chatbot';
  iframe.allowTransparency = true;
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');

  const css = document.createElement('style');
  css.textContent = [
    '#gh-chatbot-iframe{',
    '  position:fixed;',
    '  bottom:0;',
    '  right:0;',
    '  width:480px;',
    '  height:720px;',
    '  border:none;',
    '  background:transparent;',
    '  z-index:999999;',
    '  pointer-events:none;',  // iframe selbst nicht klickbar, Inhalte schon (s.u.)
    '}'
  ].join('\n');

  document.head.appendChild(css);
  document.body.appendChild(iframe);

  // pointer-events nach Laden aktivieren, damit Klicks im iframe funktionieren
  iframe.addEventListener('load', function(){
    iframe.style.pointerEvents = 'auto';
  });
})();
