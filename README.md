# megawood® Chatbot Widget

The megawood® Chat Widget is an embeddable AI chatbot built with **React** and **TypeScript**. It provides two layout variants — a classic chat popup and a landscape terrace-planner layout — that share the same core logic.

## Features

- 🤖 **KI-Chatbot**: Powered by the Vercel backend (`mw-chatbot-backend.vercel.app`)
- 🎨 **Styled Widget**: Modern chat interface with megawood® branding
- 💬 **Teaser-Funktion**: Optional configurable welcome popup
- ⚡ **Einfache Integration**: One `<script>` tag, done
- 🎯 **Woody**: Avatar and AI personality
- 🔄 **Interactive**: Thumbs up/down, copy, text-to-speech
- 🏗️ **React TypeScript**: Fully typed, component-based, easy to maintain
- 🌿 **Terrace Planner**: Landscape variant with an integrated planning editor

## Technology Stack

- [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- [Vite 8](https://vitejs.dev/) for fast builds
- [ESLint 9](https://eslint.org/) + [Prettier](https://prettier.io/) for code quality

---

## Quick Start

Classic Widget:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html">
</script>
```

Landscape Widget:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index-landscape.html"
  data-width="980"
  data-height="620">
</script>
```

Both widgets can run in parallel on the same page.

---

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template and add your API token
cp .env.example .env

# Start development server
npm run dev
# http://localhost:5173/            → classic widget
# http://localhost:5173/index-landscape.html → landscape widget

# Production build
npm run build

# Lint
npm run lint
```

---

## Integration & Configuration

### Widget Position

Use the `data-position` attribute to place the widget:

| Value | Description |
|-------|-------------|
| `bottom-right` | Bottom right (default) |
| `bottom-left` | Bottom left |
| `bottom-center` | Bottom center |
| `middle-right` | Middle right |
| `middle-left` | Middle left |
| `top-right` | Top right |
| `top-left` | Top left |
| `top-center` | Top center |

### Teaser Popup

Show a welcome popup after 10 seconds when the chat is still closed:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"
  data-teaser="true"
  data-teaser-title="Hallo! 👋"
  data-teaser-text="Ich bin Woody, dein KI-Assistent. Wie kann ich dir heute helfen?"
  data-position="bottom-right">
</script>
```

### All Attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-chatbot-url` | ✅ | — | URL of the widget HTML |
| `data-widget-id` | | auto | Unique ID for multi-instance support |
| `data-position` | | `bottom-right` | Widget position |
| `data-width` | | `480` / `980` | iframe width in px |
| `data-height` | | `720` / `620` | iframe height in px |
| `data-teaser` | | `false` | Show teaser popup (`true`/`false`) |
| `data-teaser-title` | | — | Teaser heading text |
| `data-teaser-text` | | — | Teaser body text |

### Multiple Widgets on One Page

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-widget-id="classic"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"
  data-position="bottom-left">
</script>

<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-widget-id="landscape"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index-landscape.html"
  data-position="bottom-right"
  data-width="980"
  data-height="620">
</script>
```

---

## Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full directory layout and technical design decisions.

For upgrade and maintenance instructions, see [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md).

---

## Backend API

The chatbot communicates with the megawood backend:

```
POST https://mw-chatbot-backend.vercel.app/chat
Authorization: Bearer <token>
Content-Type: application/json

{ "message": "Your question", "conversation_id": "uuid" }
```

Response:
```json
{
  "answer": "Bot response",
  "sources": [{ "title": "Source title", "url": "https://…" }],
  "conversation_id": "uuid"
}
```

---

## Live Demo

- 🔗 Classic Widget: https://nt-megawood.github.io/mw-widget/index.html
- 🌿 Landscape Widget: https://nt-megawood.github.io/mw-widget/index-landscape.html
- 📝 Example page: [example.html](example.html)

---

## License

© megawood® — All rights reserved.

