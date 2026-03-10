# megawood® Chatbot Widgets

Das Projekt enthält jetzt zwei Widget-Varianten mit gemeinsamer Core-Logik (API, Chat-Interaktion, Nachrichtenfluss) und unterschiedlichem Layout.

## Funktionen

- 🤖 **KI-Chatbot**: Powered by Vercel Backend (`mw-chatbot-backend.vercel.app`)
- 🎨 **Styled Widget**: Modernes Chat-Interface mit Megawood-Branding
- 💬 **Teaser-Funktion**: Optional konfigurierbarer Willkommens-Popup
- ⚡ **Einfache Integration**: Ein Script-Tag, fertig
- 🎯 **Megawood-Charakter**: Woody als Avatar und personality
- 🔄 **Interaktiv**: Dynamische Antworten, Daumen-Buttons, Kopieren, Vorlesen

## Widget-Varianten

- Classic Widget: Rundes Toggle + klassisches, hohes Chatfenster ([index.html](index.html))
- Landscape Widget: Rundes Toggle + breites Chatfenster mit rechter Feature-Spalte ([index-landscape.html](index-landscape.html))

Beide Varianten verwenden dieselbe Core-Funktionalität aus [api.js](api.js) und [script.js](script.js). Dadurch müssen Logikänderungen nur einmal umgesetzt werden.

## Schnellstart

Classic Widget:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js" data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"></script>
```

Landscape Widget:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index-landscape.html"
  data-width="980"
  data-height="620"></script>
```

Beide Widgets können parallel auf derselben Seite laufen.

## Integration & Anpassungen

### Position des Widgets

Das Widget kann an 6 verschiedenen Positionen angezeigt werden. Nutze das `data-position` Attribut:

**Verfügbare Positionen:**
- `bottom-right` (Standard) - Unten rechts
- `bottom-left` - Unten links
- `bottom-center` - Unten Mitte
- `middle-right` - Mitte rechts
- `middle-left` - Mitte links
- `top-right` - Oben rechts
- `top-left` - Oben links
- `top-center` - Oben Mitte

**Beispiel - Oben links:**
```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js" 
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"
  data-position="top-left">
</script>
```

**Beispiel - Unten links:**
```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js" 
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"
  data-position="bottom-left">
</script>
```

### Teaser-Popup

Zeige einen Willkommens-Popup nach 10 Sekunden, wenn der Chat noch geschlossen ist:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js" 
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"
  data-teaser="true"
  data-position="bottom-right"
  data-teaser-title="Hallo! 👋"
  data-teaser-text="Ich bin Woody, dein KI-Assistent. Wie kann ich dir heute helfen?">
</script>
```

### Attribute

- `data-chatbot-url` - URL zum Chat-Widget (erforderlich)
- `data-widget-id` - Optionale eindeutige ID pro Instanz (wichtig bei mehreren Widgets auf einer Seite)
- `data-position` - Position des Widgets: `bottom-right`, `bottom-left`, `bottom-center`, `middle-right`, `middle-left`, `top-right`, `top-left`, `top-center` (default: `bottom-right`)
- `data-width` - Optionale iframe-Breite in px (Standard: `480`, Landscape standardmäßig `980`)
- `data-height` - Optionale iframe-Höhe in px (Standard: `720`, Landscape standardmäßig `620`)
- `data-teaser` - Teaser anzeigen? (`true`/`false`, default: `false`)
- `data-teaser-title` - Teaser-Überschrift
- `data-teaser-text` - Teaser-Text

## Mehrere Widgets auf einer Seite

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-widget-id="classic"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"
  data-position="bottom-left"></script>

<script src="https://nt-megawood.github.io/mw-widget/embed.js"
  data-widget-id="landscape"
  data-chatbot-url="https://nt-megawood.github.io/mw-widget/index-landscape.html"
  data-position="bottom-right"
  data-width="980"
  data-height="620"></script>
```

## Dateistruktur

- `index.html` - Haupt-Chat-Interface
- `index-landscape.html` - Landscape-Variante mit rechter Feature-Spalte
- `embed.js` - Embed-Script zum Einbetten auf externen Seiten
- `script.js` - Chat-Logik und Event-Handler
- `styling.css` - Chat-Widget Styling
- `styling-landscape.css` - Layout-Overrides für Landscape Widget
- `api.js` - Backend-API Kommunikation
- `example.html` - Beispiel-HTML zum Testen

## Backend

Der Chatbot kommuniziert mit dem megawood Backend unter:

```
https://mw-chatbot-backend.vercel.app/chat
```

Sende eine POST-Anfrage mit:
```json
{
  "message": "Deine Frage hier"
}
```

Erhältst:
```json
{
  "answer": "Antwort vom Chatbot",
  "sources": ["Quelle 1", "Quelle 2"]
}
```

## Live-Demo

Die aktuelle Version ist verfügbar unter:
- 🔗 Widget: https://nt-megawood.github.io/mw-widget/index.html
- 📝 Beispiel: [example.html](example.html)

## Lizenz

© megawood® - Alle Rechte vorbehalten.
