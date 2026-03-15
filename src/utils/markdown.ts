export function renderMarkdown(text: string): string {
  let html = text;
  // Bold: **text** → <strong>text</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Bullet points: lines starting with - or *
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  // Paragraphs: double newlines
  html = html.replace(/\n\n+/g, '</p><p>');
  // Single newlines to <br>
  html = html.replace(/\n/g, '<br>');
  return `<p>${html}</p>`;
}
