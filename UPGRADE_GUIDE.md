# Upgrade Guide

This document explains how to maintain and extend the megawood® Chat Widget codebase. It is written for future developers and AI agents.

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server with hot-reload
npm run dev
# Opens both widgets:
#   http://localhost:5173/           → classic widget
#   http://localhost:5173/index-landscape.html → landscape widget

# Type-check + production build
npm run build
# Output: dist/index.html, dist/index-landscape.html

# Run linter
npm run lint

# Preview production build
npm run preview
```

---

## Setting Up Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

> **Important:** Never commit `.env` to version control.

---

## Deploying to GitHub Pages

The `dist/` folder is the deployable artifact. GitHub Pages can be configured to serve from `dist/` or a CI workflow can copy the output to the repository root.

### Manual deployment
```bash
npm run build
# Then push the dist/ contents to the gh-pages branch or the docs/ folder
```

### Automated deployment (recommended)
Add a GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## How to Change the API Endpoint

The default API URL is set in `src/services/api.ts`:

```typescript
const DEFAULT_API_URL = 'https://mw-chatbot-backend.vercel.app/chat';
```

It can be overridden at runtime by setting `window.CHATBOT_API_URL` before the widget loads. The landscape widget sets this automatically in `src/landscape/main.tsx`.

---

## Adding a New Feature

### Adding a new quick-reply button

Edit `src/components/ChatWidget/ChatWidget.tsx`:

```typescript
const CLASSIC_QUICK_REPLIES = [
  'Wie kannst du mir helfen?',
  'Informationen zu den megawood® Dielen',
  'Händlersuche',
  'Dein neuer Button hier',  // ← add here
];
```

### Adding a new message meta action

Edit `src/components/Message/BotMessage.tsx` and add a new `<button>` inside `.bot-meta`.

### Adding a new planning form field

1. Add your option to `src/components/PlanningEditor/planningData.ts`
2. Add a `<select>` field in `src/components/PlanningEditor/PlanningEditor.tsx`
3. Include the field value in the `updatedData` object passed to `saveTerracePlanData()`

### Adding a new widget position

1. Add the position name to the `Position` type in `src/types/index.ts`
2. Add the corresponding CSS class in `src/styles/classic.css`

---

## Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages to their latest compatible version
npm update

# Upgrade to new major versions (review changelogs first!)
npm install react@latest react-dom@latest
npm install --save-dev vite@latest @vitejs/plugin-react@latest typescript@latest
```

### Key compatibility notes

- **Vite 8+ requires Node 18+**
- **React 19** uses the new JSX transform (`react-jsx`), so `import React from 'react'` is not needed in every file but is harmless to keep
- **ESLint 9** uses the flat config format (`eslint.config.js`). The legacy `.eslintrc.*` format is no longer supported

---

## Code Style

- **TypeScript strict mode** is enabled. Avoid `any` — use `unknown` and narrow with type guards.
- **Prettier** handles formatting. Run `npx prettier --write src/` to format all files.
- **ESLint** enforces React hooks rules and TypeScript best practices.
- Keep components **pure and presentational** — push state logic into custom hooks.

---

## Project Conventions

| Convention | Details |
|------------|---------|
| Component files | PascalCase `.tsx` |
| Hook files | camelCase `use*.ts` |
| Utility files | camelCase `.ts` |
| CSS class names | kebab-case, matching the original styling |
| German UI text | All visible text stays in German |

---

## Troubleshooting

### Build fails with "Cannot find module"
Run `npm install` to restore the `node_modules/` folder.

### TypeScript errors after upgrading
Run `npx tsc --noEmit` to see all errors without building. Fix type errors before running the full build.

### ESLint cannot find config
Ensure `eslint.config.js` exists at the project root (not `.eslintrc.*` files, which are unsupported in ESLint 9).

### Widget shows blank in iframe
Check that the backend is reachable and the widget can fetch its runtime token.

### Images not found in production build
Assets in `public/` are copied as-is to `dist/`. Images referenced by absolute path (`/woody.jpg`) resolve correctly. Images imported via `import` are fingerprinted and also work.
