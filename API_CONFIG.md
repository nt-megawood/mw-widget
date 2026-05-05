# API Konfiguration

## Übersicht

Die API Base Path wird jetzt an **EINER zentralen Stelle** konfiguriert: in der `.env` Datei.

Vorher mussten die API URLs an 4 verschiedenen Stellen angepasst werden:
- `api.js`
- `src/services/api.ts`
- `src/landscape/main.tsx`
- `src/hooks/useWidgetToken.ts`

**Jetzt nur noch eine Stelle!** ✅

## Dateistruktur

### `.env` (Konfigurationsdatei)
Enthält alle Umgebungsvariablen:
- `VITE_API_BASE_URL` - Die Hauptkonfiguration (zentral!)
- `VITE_AUTH_TOKEN` - Authentifizierungs-Token
- Verschiedene Terrace Planner URLs

### `src/config/api.ts` (Konfiguration-Modul)
Dieses Modul liest die `.env` Variablen und stellt folgende Funktionen bereit:

```typescript
// Chat API URL (z.B. http://localhost:8000/v1/chat)
getApiUrl(): string

// Conversation API URL (für History)
getConversationUrl(): string

// Live WebSocket URL
getLiveWebSocketUrl(token?: string): string

// Backend Base URL (ohne Endpoint)
getBackendBaseUrl(): string
```

Alle TERRACE URLs sind auch als Konstanten exportiert:
- `TERRACE_LOAD_URL`
- `TERRACE_SAVE_URL`
- `TERRACE_BAUPLAN_PDF_URL_BASE`
- `TERRACE_MATERIALLISTE_PDF_URL_BASE`
- `TERRACE_HISTORY_URL_BASE`

## Konfiguration

### Setup (lokal)

1. `.env.example` als `.env` kopieren:
```bash
cp .env.example .env
```

2. `VITE_API_BASE_URL` nach Bedarf anpassen:
```env
# Development (lokal)
VITE_API_BASE_URL=http://localhost:8000

# Production (Vercel)
VITE_API_BASE_URL=https://mw-chatbot-backend.vercel.app
```

3. Starten:
```bash
npm run dev
```

Die Konfiguration wird automatisch geladen und verwendet!

## Verwendung in Code

### TypeScript (empfohlen)
```typescript
import { 
  getApiUrl, 
  getConversationUrl,
  getLiveWebSocketUrl,
  TERRACE_LOAD_URL 
} from '@/config/api';

// Verwende die zentral konfigurierte URL
const chatUrl = getApiUrl(); // http://localhost:8000/v1/chat
```

### Alte Methode (funktioniert auch noch)
Die `window.CHATBOT_API_URL` Variable wird automatisch gesetzt und kann noch verwendet werden:
```typescript
const apiUrl = window.CHATBOT_API_URL; // funktioniert noch
```

## Migrationshistorie

Diese Konfiguration wurde implementiert um:
- ✅ Alle API URLs an einer Stelle zu konfigurieren
- ✅ Weniger Fehler beim Deploy auf verschiedene Umgebungen
- ✅ Einfacher zwischen Development und Production wechseln
- ✅ Wartbarkeit zu verbessern

## Dateien, die aktualisiert wurden

1. **Neu erstellt:**
   - `src/config/api.ts` - Zentrale API-Konfiguration
   - `.env` - Konfigurationsdatei

2. **Angepasst:**
   - `src/landscape/main.tsx` - Nutzt jetzt `getApiUrl()` aus config
   - `src/services/api.ts` - Importiert URLs aus config
   - `src/hooks/useWidgetToken.ts` - Nutzt `getBackendBaseUrl()` aus config
   - `api.js` - Kommentar hinzugefügt dass config in `.env` erfolgt
   - `.env.example` - Dokumentiert alle neuen Optionen

## Umgebungsvariablen

```env
# Hauptkonfiguration (zentral!)
VITE_API_BASE_URL=http://localhost:8000

# Optional: Andere URLs (normalerweise nicht ändern nötig)
VITE_TERRACE_LOAD_URL=https://betaplaner.megawood.com/api/terrassedaten/ladeDaten
VITE_TERRACE_SAVE_URL=https://betaplaner.megawood.com/api/terrassedaten/speichereDaten
VITE_TERRACE_BAUPLAN_URL_BASE=https://betaplaner.megawood.com/api/bauplan/pdf
VITE_TERRACE_MATERIALLISTE_URL_BASE=https://betaplaner.megawood.com/api/materialliste/pdf
VITE_TERRACE_HISTORY_URL_BASE=https://betaplaner.megawood.com/api/terrassehistorie
```

## Troubleshooting

### URLs werden nicht aktualisiert?
1. Stelle sicher, dass `.env` in der root des Projekts ist
2. Starten Sie den Dev-Server neu: `npm run dev`
3. Checke dass die Variable mit `VITE_` prefix beginnt (Vite-Convention)

### Unterschiedliche URLs für Dev und Prod?
Erstelle separate `.env` Dateien:
- `.env` - Development (wird verwendet)
- `.env.local` - Lokale Overrides (gitignored)
- `.env.production` - Production (Optional, für Build-Zeit)

Dann mit Vite bauen für die Umgebung:
```bash
# Development
npm run dev

# Production Build
npm run build
```
