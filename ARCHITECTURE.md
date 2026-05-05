# Architecture Guide

This document describes the architecture of the megawood® Chat Widget after its rewrite from vanilla JavaScript to React TypeScript.

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 19 |
| Language | TypeScript 5 (strict mode) |
| Build Tool | Vite 8 |
| Linter | ESLint 9 (flat config) |
| Formatter | Prettier 3 |

---

## Directory Structure

```
mw-widget/
├── src/
│   ├── classic/
│   │   └── main.tsx            # Entry point for the classic widget
│   ├── landscape/
│   │   └── main.tsx            # Entry point for the landscape (terrace planner) widget
│   ├── components/
│   │   ├── ChatWidget/
│   │   │   ├── ChatWidget.tsx  # Root widget component — wires all hooks and sub-components
│   │   │   └── index.ts
│   │   ├── Message/
│   │   │   ├── BotMessage.tsx  # Bot chat bubble with sources, meta buttons, brand popup
│   │   │   ├── UserMessage.tsx # User chat bubble
│   │   │   ├── ThinkingIndicator.tsx  # Animated "Woody is thinking" indicator
│   │   │   └── index.ts
│   │   ├── PlanningEditor/
│   │   │   ├── PlanningEditor.tsx  # Terrace planner sidebar (landscape only)
│   │   │   ├── planningData.ts     # Static data: products, colors, shape variants
│   │   │   └── index.ts
│   │   ├── BrandPopup.tsx      # "About this assistant" modal
│   │   ├── ChatBody.tsx        # Scrollable message list + quick reply buttons
│   │   ├── ChatFooter.tsx      # Textarea input + send button
│   │   ├── ChatHeader.tsx      # Header with refresh and close buttons
│   │   ├── ChatTeaser.tsx      # Auto-appearing teaser popup
│   │   └── ChatToggle.tsx      # Floating toggle button (when chat is closed)
│   ├── hooks/
│   │   ├── useChat.ts          # Message state + send/receive + thinking indicator
│   │   ├── useConversation.ts  # Conversation ID persistence via localStorage
│   │   ├── usePresence.ts      # Heartbeat polling for new messages
│   │   └── useTeaser.ts        # Teaser popup delay logic
│   ├── services/
│   │   └── api.ts              # All HTTP calls to the chatbot backend
│   ├── styles/
│   │   ├── classic.css         # Classic widget styles (400×640 px)
│   │   └── landscape.css       # Landscape widget overrides (860×540 px)
│   ├── types/
│   │   ├── index.ts            # Shared TypeScript interfaces
│   │   └── images.d.ts         # Type declarations for image imports
│   ├── utils/
│   │   ├── markdown.ts         # Lightweight markdown → HTML renderer
│   │   ├── speech.ts           # Web Speech API helper
│   │   └── uuid.ts             # UUID generator (crypto.randomUUID with fallback)
│   └── vite-env.d.ts           # Vite environment type declarations
├── public/
│   ├── woody.jpg               # Woody avatar image
│   └── background.PNG          # Background image
├── index.html                  # Vite entry HTML for the classic widget
├── index-landscape.html        # Vite entry HTML for the landscape widget
├── embed.js                    # Embed script for external sites (unchanged)
├── example.html                # Local test page for both widgets
├── vite.config.ts              # Vite build config (multi-page)
├── tsconfig.json               # TypeScript config for src/
├── tsconfig.node.json          # TypeScript config for vite.config.ts
├── eslint.config.js            # ESLint 9 flat config
├── .prettierrc                 # Prettier formatting rules
├── .env.example                # Environment variable template
└── package.json
```

---

## Widget Variants

The project builds **two separate HTML bundles** from a single shared codebase.

### Classic Widget (`index.html`)
- 400 × 640 px chat interface
- 3 quick-reply buttons
- Loaded by `embed.js` when `data-chatbot-url` points to the classic HTML
- API endpoint: `https://mw-chatbot-backend.vercel.app/chat`

### Landscape Widget (`index-landscape.html`)
- 860 × 540 px two-column layout (chat + terrace planner sidebar)
- 5 quick-reply buttons (includes planning actions)
- API endpoint: `https://mw-chatbot-backend.vercel.app/terrassenplaner/chat`

---

## Data Flow

```
Client Website
    │
    ▼
embed.js
  Reads data-* attributes from <script> tag
  Creates transparent fixed-position <iframe>
    │
    ▼
index.html  OR  index-landscape.html
  (loaded inside the iframe)
    │
    ▼
main.tsx (classic or landscape)
  Reads URL query params (teaser, position, …)
  Renders <ChatWidget config={…} widgetId="…">
    │
    ├── useConversation    → localStorage: persists conversation_id
    ├── useChat            → manages messages[], isThinking state
    ├── usePresence        → 60s heartbeat poll for new messages
    └── useTeaser          → 10s delay auto-shows teaser popup
    │
    ▼
User types message
    │
    ▼
useChat.sendMessage(text)
  → api.sendMessage(text, conversationId)
    → POST /chat  (or /terrassenplaner/chat)
    → { answer, sources, conversation_id }
  → addBotMessage(answer, sources)
```

---

## Authentication

The backend API uses a short-lived widget token that is fetched dynamically at runtime. No static auth token is stored in `.env`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|

---

## Styling Architecture

- `src/styles/classic.css` — base styles shared by both widgets
- `src/styles/landscape.css` — additional styles for the landscape layout, imported only in `src/landscape/main.tsx`

CSS custom properties (defined in `:root`):
```css
--primary-red: #b4032f;
--dark-red: #96022a;
```

---

## Key Design Decisions

1. **Multi-page Vite build** — Two entry points (`index.html` and `index-landscape.html`) produce separate bundles. This keeps each variant's JS/CSS footprint minimal.

2. **Hooks architecture** — All stateful logic lives in custom hooks (`useChat`, `useConversation`, `usePresence`, `useTeaser`). Components are thin presentational wrappers.

3. **Session guard** — `useChat` stores a `sessionIdRef` to discard API responses that arrive after the user has cleared the conversation.

4. **Presence polling** — `usePresence` runs a 60-second heartbeat and pauses when the browser tab is hidden (via `visibilitychange` / `focus` events).

5. **PlanningEditor as a React child** — The landscape entry point passes `<PlanningEditor />` as a child of `<ChatWidget>`, keeping the widget layout-agnostic.

6. **Embed script unchanged** — `embed.js` continues to work as before. It points its iframe to the built `index.html` or `index-landscape.html` output files.
