# Chatbot als GitHub Pages + Einbettung

Kurzanleitung (Deutsch):

- Dateien: `index.html`, `styling.css`, `widget.html`, `embed.js` in einem Repo ablegen.
- Ersetze in `embed.js` und im Einbett-Snippet `USERNAME` und `REPO` durch deinen GitHub-Benutzernamen und Repo-Namen.
- Repo erstellen, committen und pushen:

```bash
git init
git add .
git commit -m "Add chatbot widget and embed script"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

- GitHub Pages aktivieren: Repository → Settings → Pages → Branch: `main`, Folder: `/ (root)`, Save. Warte kurz bis die Seite veröffentlicht ist.

- Die veröffentlichte Widget-URL lautet dann in der Regel:

```
https://USERNAME.github.io/REPO/widget.html
```

- Einbett-Snippet für andere Webseiten (einfach in `<head>` oder am Ende von `<body>` einfügen). Ersetze `USERNAME` und `REPO` oder setze `data-chatbot-url` mit der endgültigen URL:

```html
<script src="https://USERNAME.github.io/REPO/embed.js" data-chatbot-url="https://USERNAME.github.io/REPO/widget.html"></script>
```

- Optional kannst du Attribute verwenden:
  - `data-position`: `bottom-right` (Standard) oder `bottom-left`
  - `data-width`, `data-height`: Pixelgrößen für das Widget

Beispiel:

```html
<script src="https://USERNAME.github.io/REPO/embed.js" data-chatbot-url="https://USERNAME.github.io/REPO/widget.html" data-position="bottom-left" data-width="400" data-height="600"></script>
```

- Hinweis: Wenn dein Chatbot reale Backend-Endpunkte erfordert, musst du `widget.html` entsprechend anpassen, damit die Kommunikation (fetch / WebSocket) richtig funktioniert und CORS erlaubt ist.

Wenn du willst, helfe ich dir beim Ersetzen von `USERNAME/REPO`, beim Erstellen des GitHub-Repo, oder beim Anpassen von `widget.html` für dein Backend.
