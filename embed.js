(function(){
  const script = document.currentScript;
  const widgetUrl = (script && script.getAttribute('data-chatbot-url')) || 'https://nt-megawood.github.io/mw-widget/widget.html';
  const position = (script && script.getAttribute('data-position')) || 'bottom-right';
  const sizeW = (script && script.getAttribute('data-width')) || '350';
  const sizeH = (script && script.getAttribute('data-height')) || '500';

  const container = document.createElement('div');
  container.id = 'gh-chatbot-container';
  container.className = position==='bottom-left' ? 'bottom-left' : 'bottom-right';

  const css = document.createElement('style');
  css.textContent = '\n#gh-chatbot-container{position:fixed;z-index:99999}\n#gh-chatbot-container.bottom-right{right:20px;bottom:20px}\n#gh-chatbot-container.bottom-left{left:20px;bottom:20px}\n#gh-chatbot-container iframe{border:0;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.2)}\n#gh-chatbot-toggle{position:fixed;z-index:999999;border-radius:50%;width:56px;height:56px;border:0;background:#007bff;color:#fff;font-size:24px;display:flex;align-items:center;justify-content:center;cursor:pointer}\n#gh-chatbot-toggle.bottom-right{right:20px;bottom:20px}\n#gh-chatbot-toggle.bottom-left{left:20px;bottom:20px}\n';

  const iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.width = sizeW;
  iframe.height = sizeH;
  iframe.style.display = 'none';
  iframe.title = 'Chatbot';
  iframe.loading = 'lazy';

  const toggle = document.createElement('button');
  toggle.id = 'gh-chatbot-toggle';
  toggle.className = container.className;
  toggle.innerHTML = '&#128172;';
  toggle.addEventListener('click', ()=>{
    iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
  });

  container.appendChild(iframe);
  document.head.appendChild(css);
  document.body.appendChild(container);
  document.body.appendChild(toggle);
})();
