# megawood® Chatbot Widget

Das megawood® Chatbot Widget ist ein vorkonfiguriertes Chat-Widget mit dem KI-Charakter **Woody**. Es kann einfach auf beliebigen Websites eingebettet werden.

## Funktionen

- 🤖 **KI-Chatbot**: Powered by Vercel Backend (`mw-chatbot-backend.vercel.app`)
- 🎨 **Styled Widget**: Modernes Chat-Interface mit Megawood-Branding
- 💬 **Teaser-Funktion**: Optional konfigurierbarer Willkommens-Popup
- ⚡ **Einfache Integration**: Ein Script-Tag, fertig
- 🎯 **Megawood-Charakter**: Woody als Avatar und personality
- 🔄 **Interaktiv**: Dynamische Antworten, Daumen-Buttons, Kopieren, Vorlesen

## Schnellstart

Einbetten Sie das Widget auf Ihrer Website mit einer einzigen Zeile:

```html
<script src="https://nt-megawood.github.io/mw-widget/embed.js" data-chatbot-url="https://nt-megawood.github.io/mw-widget/index.html"></script>
```

Das Widget erscheint dann unten rechts auf Ihrer Seite.

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
- `data-position` - Position des Widgets: `bottom-right`, `bottom-left`, `bottom-center`, `middle-right`, `middle-left`, `top-right`, `top-left`, `top-center` (default: `bottom-right`)
- `data-teaser` - Teaser anzeigen? (`true`/`false`, default: `false`)
- `data-teaser-title` - Teaser-Überschrift
- `data-teaser-text` - Teaser-Text

## Dateistruktur

- `index.html` - Haupt-Chat-Interface
- `embed.js` - Embed-Script zum Einbetten auf externen Seiten
- `script.js` - Chat-Logik und Event-Handler
- `styling.css` - Chat-Widget Styling
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
