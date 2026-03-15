export function renderMarkdown(text: string): string {
  let html = String(text || '');
  // Escape raw HTML first to avoid injecting tags from model output.
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Markdown links: [label](https://example.com)
  const linkPlaceholders: string[] = [];
  html = html.replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, (_full, label, url) => {
    const anchor = `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    const token = `__MDLINK_${linkPlaceholders.length}__`;
    linkPlaceholders.push(anchor);
    return token;
  });

  // Auto-link plain URLs and trim trailing punctuation that often follows sentence endings.
  html = html.replace(/(https?:\/\/[^\s<]+)/g, (fullUrl) => {
    const match = String(fullUrl).match(/^(https?:\/\/[^\s<]*?)([)\].,;:!?]+)?$/);
    if (!match) {
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${fullUrl}</a>`;
    }
    const cleanUrl = match[1];
    const trailing = match[2] || '';
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailing}`;
  });

  html = html.replace(/__MDLINK_(\d+)__/g, (_full, idxText) => {
    const idx = Number(idxText);
    if (!Number.isFinite(idx)) return '';
    return linkPlaceholders[idx] || '';
  });

  const lines = html.split('\n');
  const blocks: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push(`<p>${paragraphLines.join('<br>')}</p>`);
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push(`<ul>${listItems.join('')}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);

    if (bullet) {
      flushParagraph();
      listItems.push(`<li>${bullet[1]}</li>`);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return blocks.join('');
}
