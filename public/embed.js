(function(){
  const script = document.currentScript;
  // URL zur index.html des Chatbots (deine echte Version)
  const widgetUrl = (script && script.getAttribute('data-chatbot-url')) || 'https://nt-megawood.github.io/mw-widget/index.html';
  const widgetIdRaw = (script && script.getAttribute('data-widget-id')) || ('widget-' + Math.random().toString(36).slice(2, 10));
  const widgetId = widgetIdRaw.replace(/[^a-zA-Z0-9_-]/g, '');

  // Position aus data-Attributen lesen (default: bottom-right)
  const position = (script && script.getAttribute('data-position')) || 'bottom-right';

  // Teaser-Optionen aus data-Attributen lesen
  const teaserEnabled = (script && script.getAttribute('data-teaser')) === 'true';
  const teaserTitle   = (script && script.getAttribute('data-teaser-title')) || '';
  const teaserText    = (script && script.getAttribute('data-teaser-text'))  || '';
  const pageContext   = (script && script.getAttribute('data-page-context')) || '';

  const isLandscapeWidget = /index-landscape\.html/i.test(widgetUrl);
  const defaultWidth = isLandscapeWidget ? 980 : 480;
  const defaultHeight = isLandscapeWidget ? 620 : 720;
  const widthAttr = script && parseInt(script.getAttribute('data-width'), 10);
  const heightAttr = script && parseInt(script.getAttribute('data-height'), 10);
  const iframeWidth = Number.isFinite(widthAttr) ? widthAttr : defaultWidth;
  const iframeHeight = Number.isFinite(heightAttr) ? heightAttr : defaultHeight;
  const halfWidth = Math.round(iframeWidth / 2);
  const halfHeight = Math.round(iframeHeight / 2);

  // Query-Params an widget-URL anhängen
  let finalUrl = widgetUrl;
  const sep = widgetUrl.includes('?') ? '&' : '?';
  const params = [];
  
  if (teaserEnabled) params.push('teaser=1');
  params.push('position=' + encodeURIComponent(position));
  if (teaserTitle) params.push('teaser-title=' + encodeURIComponent(teaserTitle));
  if (teaserText) params.push('teaser-text=' + encodeURIComponent(teaserText));
  if (pageContext) params.push('page_context=' + encodeURIComponent(pageContext));
  
  finalUrl = widgetUrl + sep + params.join('&');

  // Transparentes iframe — die index.html bringt ihren eigenen Toggle-Button mit
  const iframe = document.createElement('iframe');
  iframe.src = finalUrl;
  iframe.id = 'gh-chatbot-iframe-' + widgetId;
  iframe.title = 'Chatbot';
  iframe.allowTransparency = true;
  iframe.setAttribute('allow', 'autoplay');
  iframe.loading = 'lazy';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');

  const css = document.createElement('style');
  css.id = 'gh-chatbot-style-' + widgetId;

  const iframePositions = {
    'top-left':      'top:0;left:0;bottom:auto;right:auto;',
    'top-center':    'top:0;left:calc(50% - ' + halfWidth + 'px);bottom:auto;right:auto;',
    'top-right':     'top:0;right:0;bottom:auto;left:auto;',
    'middle-left':   'top:calc(50% - ' + halfHeight + 'px);left:0;bottom:auto;right:auto;',
    'middle-right':  'top:calc(50% - ' + halfHeight + 'px);right:0;bottom:auto;left:auto;',
    'bottom-left':   'bottom:0;left:0;top:auto;right:auto;',
    'bottom-center': 'bottom:0;left:calc(50% - ' + halfWidth + 'px);top:auto;right:auto;',
    'bottom-right':  'bottom:0;right:0;top:auto;left:auto;'
  };

  const posStyle = iframePositions[position] || iframePositions['bottom-right'];

  css.textContent = [
    '#gh-chatbot-iframe-' + widgetId + '{',
    '  position:fixed;',
    '  ' + posStyle,
    '  width:' + iframeWidth + 'px;',
    '  height:' + iframeHeight + 'px;',
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
