(function(){
  const script = document.currentScript;
  // URL zur index.html des Chatbots (deine echte Version)
  const widgetUrl = (script && script.getAttribute('data-chatbot-url')) || 'https://nt-megawood.github.io/mw-widget/index.html';

  // Position aus data-Attributen lesen (default: bottom-right)
  const position = (script && script.getAttribute('data-position')) || 'bottom-right';

  // Teaser-Optionen aus data-Attributen lesen
  const teaserEnabled = (script && script.getAttribute('data-teaser')) === 'true';
  const teaserTitle   = (script && script.getAttribute('data-teaser-title')) || '';
  const teaserText    = (script && script.getAttribute('data-teaser-text'))  || '';

  // Query-Params an widget-URL anhängen
  let finalUrl = widgetUrl;
  const sep = widgetUrl.includes('?') ? '&' : '?';
  const params = [];
  
  if (teaserEnabled) params.push('teaser=1');
  params.push('position=' + encodeURIComponent(position));
  if (teaserTitle) params.push('teaser-title=' + encodeURIComponent(teaserTitle));
  if (teaserText) params.push('teaser-text=' + encodeURIComponent(teaserText));
  
  finalUrl = widgetUrl + sep + params.join('&');

  // Transparentes iframe — die index.html bringt ihren eigenen Toggle-Button mit
  const iframe = document.createElement('iframe');
  iframe.src = finalUrl;
  iframe.id = 'gh-chatbot-iframe';
  iframe.title = 'Chatbot';
  iframe.allowTransparency = true;
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');

  const css = document.createElement('style');

  const iframePositions = {
    'top-left':      'top:0;left:0;bottom:auto;right:auto;',
    'top-center':    'top:0;left:calc(50% - 240px);bottom:auto;right:auto;',
    'top-right':     'top:0;right:0;bottom:auto;left:auto;',
    'middle-left':   'top:calc(50% - 360px);left:0;bottom:auto;right:auto;',
    'middle-right':  'top:calc(50% - 360px);right:0;bottom:auto;left:auto;',
    'bottom-left':   'bottom:0;left:0;top:auto;right:auto;',
    'bottom-center': 'bottom:0;left:calc(50% - 240px);top:auto;right:auto;',
    'bottom-right':  'bottom:0;right:0;top:auto;left:auto;'
  };

  const posStyle = iframePositions[position] || iframePositions['bottom-right'];

  css.textContent = [
    '#gh-chatbot-iframe{',
    '  position:fixed;',
    '  ' + posStyle,
    '  width:480px;',
    '  height:720px;',
    '  border:none;',
    '  background:transparent;',
    '  z-index:999998;',
    '  pointer-events:none;',
    '}'
  ].join('\n');

  document.head.appendChild(css);
  document.body.appendChild(iframe);

  // pointer-events nach Laden aktivieren, damit Klicks im iframe funktionieren
  iframe.addEventListener('load', function(){
    iframe.style.pointerEvents = 'auto';
  });
})();
