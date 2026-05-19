export type WidgetLanguage = 'de' | 'en';

export const LOCALE_MAP: Record<string, string> = { de: 'de-DE', en: 'en-GB' };

export interface UiCopy {
  // ── existing keys ────────────────────────────────────────────────
  login: string;
  logout: string;
  loginAction: string;
  logoutAction: string;
  restartConversation: string;
  closeChat: string;
  inputPlaceholder: string;
  inputLabel: string;
  sendLabel: string;
  openChatLabel: string;
  greetingWelcome: string;
  greetingClassicLine1: string;
  greetingClassicLine2: string;
  greetingClassicLine3: string;
  greetingLandscapeLine1: string;
  greetingLandscapeLine2: string;
  greetingLandscapeLine3: string;
  createdBy: string;
  aiDisclaimer: string;

  // ── ChatHeader ───────────────────────────────────────────────────
  switchToEnglish: string;
  switchToGerman: string;

  // ── ChatFooter ───────────────────────────────────────────────────
  cancelGeneration: string;
  startLiveChat: string;
  stopLiveChat: string;
  liveListeningPlaceholder: string;
  footerPrivacy: string;
  footerImprint: string;
  liveRecognizedPrefix: string;

  // ── ChatBody — DimensionInputCard ────────────────────────────────
  dimensionInputFallbackTitle: string;
  dimensionSubmitButton: string;
  dimensionPlaceholder: string;

  // ── ChatBody — DealerLocationInputCard ───────────────────────────
  dealerInputFallbackTitle: string;
  dealerSubmitButton: string;
  dealerPostalPlaceholder: string;
  dealerCityPlaceholder: string;

  // ── ChatBody — PlanningCodeInputCard ─────────────────────────────
  planningCodeInputFallbackTitle: string;
  planningCodeLabel: string;
  planningCodeLoadButton: string;
  planningCodePlaceholder: string;

  // ── ChatBody — info view ─────────────────────────────────────────
  infoViewBackLabel: string;
  infoViewDescription: string;
  infoViewContextIdLabel: string;
  infoViewNoContextId: string;

  // ── BotMessage ───────────────────────────────────────────────────
  thumbUpLabel: string;
  thumbDownLabel: string;
  copyLabel: string;
  speakLabel: string;
  respinLabel: string;
  sourcesTitle: string;
  contextIdLabel: string;
  noContextId: string;

  // ── ChatTeaser ───────────────────────────────────────────────────
  teaserCloseLabel: string;

  // ── LoginModal ───────────────────────────────────────────────────
  loginModalAriaLabel: string;
  loginModalCloseLabel: string;
  loginModalHeading: string;
  loginModalSubtitle: string;
  loginModalUsernameLabel: string;
  loginModalUsernamePlaceholder: string;
  loginModalPasswordLabel: string;
  loginModalPasswordPlaceholder: string;
  loginModalCancelButton: string;
  loginModalSubmitButton: string;

  // ── ChatWidget (live-chat system messages) ───────────────────────
  liveChatStarted: string;
  liveChatStopped: string;
  liveChatStartError: string;
  greetingHelloPrefix: string;

  // ── useChat — thinking messages ──────────────────────────────────
  thinkingMsg0: string;
  thinkingMsg1: string;
  thinkingMsg2: string;
  thinkingMsg3: string;
  thinkingMsg4: string;
  thinkingMsg5: string;
  thinkingMsg6: string;
  thinkingMsg7: string;
  thinkingMsg8: string;
  thinkingMsg9: string;

  // ── useChat — input-request titles ──────────────────────────────
  dimensionInputRequestTitle: string;
  planningCodeRequestTitle: string;
  dealerLocationRequestTitle: string;
  dealerCityFieldLabel: string;
  dealerPostalFieldLabel: string;

  // ── useChat — quick-reply labels (shown to user) ─────────────────
  planningCodeEnterLabel: string;
  dealerSearchOpenLabel: string;

  // ── useChat — planning-code flow bot message ─────────────────────
  planningCodeBotPrompt: string;

  // ── useChat — error message ──────────────────────────────────────
  chatErrorMessage: string;

  // ── useRealtimeStt — status texts ────────────────────────────────
  sttStatusListening: string;
  sttStatusRecording: string;
  sttStatusProcessing: string;
  sttStatusInitializing: string;
  sttErrorUnavailable: string;
  sttErrorFailed: string;
  sttErrorPrefix: string;

  // ── PlanningEditor — status & error messages ─────────────────────
  planningEditorEnterCodeError: string;
  planningEditorLoadingStatus: string;
  planningEditorLoadedSuccess: string;
  planningEditorLoadError: string;
  planningEditorHistoryLoadError: string;
  planningEditorHistoryLoading: string;
  planningEditorHistoryEmpty: string;
  planningEditorSavingStatus: string;
  planningEditorSavedSuccess: string;
  planningEditorSaveError: string;
  planningEditorNoPlanError: string;
  planningEditorInvalidCodeError: string;

  // ── PlanningEditor — UI labels ───────────────────────────────────
  planningEditorTitle: string;
  planningEditorHistorySectionTitle: string;
  planningEditorHistorySectionDesc: string;
  planningEditorCodeLabel: string;
  planningEditorCodeHint: string;
  planningEditorLoadedPlanPrefix: string;
  planningEditorFormLabel: string;
  planningEditorDielenLabel: string;
  planningEditorDielenFarbeLabel: string;
  planningEditorProfilLabel: string;
  planningEditorUkLabel: string;
  planningEditorReloadButton: string;
  planningEditorBauplanButton: string;
  planningEditorMateriallisteButton: string;
  planningEditorSavingButton: string;
  planningEditorSaveButton: string;
  planningEditorLoadButton: string;
  planningEditorUnknownForm: string;
  planningEditorUnknownDiele: string;
  planningEditorColorFallback: string;
}

export const UI_COPY: Record<WidgetLanguage, UiCopy> = {
  de: {
    // ── existing keys ────────────────────────────────────────────────
    login: 'Login',
    logout: 'Logout',
    loginAction: 'Einloggen',
    logoutAction: 'Ausloggen',
    restartConversation: 'Gespräch neu starten',
    closeChat: 'Chat schließen',
    inputPlaceholder: 'Stell Woody deine Frage...',
    inputLabel: 'Nachricht eingeben',
    sendLabel: 'Senden',
    openChatLabel: 'Chat öffnen',
    greetingWelcome: 'Willkommen bei megawood®! 👋',
    greetingClassicLine1: 'Ich bin Woody, dein megawood® KI-Assistent!',
    greetingClassicLine2: 'Womit kann ich dir heute helfen?',
    greetingClassicLine3: 'Ich lerne noch, daher prüfe wichtige Antworten bitte sicherheitshalber nach.',
    greetingLandscapeLine1: 'Ich bin Handwerker Woody, dein persönlicher KI-Assistent! Du kannst mich alles zu unseren Produkten fragen, oder wir können eine Planung zusammen erstellen.',
    greetingLandscapeLine2: 'Lass uns gleich mit der Planung beginnen!',
    greetingLandscapeLine3: 'Ich lerne aktuell noch, daher prüfe wichtige Antworten bitte sicherheitshalber nach!',
    createdBy: 'Erstellt von megawood KI',
    aiDisclaimer: 'KI-Unterstützung kann Fehler machen.',

    // ── ChatHeader ───────────────────────────────────────────────────
    switchToEnglish: 'Switch to English',
    switchToGerman: 'Auf Deutsch wechseln',

    // ── ChatFooter ───────────────────────────────────────────────────
    cancelGeneration: 'Antwort abbrechen',
    startLiveChat: 'Live-Chat starten',
    stopLiveChat: 'Live-Chat beenden',
    liveListeningPlaceholder: 'Woody hört dir zu...',
    footerPrivacy: 'Datenschutz',
    footerImprint: 'Impressum',
    liveRecognizedPrefix: 'Erkannt: ',

    // ── ChatBody — DimensionInputCard ────────────────────────────────
    dimensionInputFallbackTitle: 'Bitte gib die Maße ein.',
    dimensionSubmitButton: 'Maße übernehmen',
    dimensionPlaceholder: 'z.B. 4.2',

    // ── ChatBody — DealerLocationInputCard ───────────────────────────
    dealerInputFallbackTitle: 'Bitte gib Stadt oder Postleitzahl ein.',
    dealerSubmitButton: 'Händler suchen',
    dealerPostalPlaceholder: 'z. B. 33442',
    dealerCityPlaceholder: 'z. B. Rheda-Wiedenbrück',

    // ── ChatBody — PlanningCodeInputCard ─────────────────────────────
    planningCodeInputFallbackTitle: 'Bitte gib deinen Planungscode ein.',
    planningCodeLabel: 'Planungscode',
    planningCodeLoadButton: 'Planung laden',
    planningCodePlaceholder: 'z. B. mgw150823',

    // ── ChatBody — info view ─────────────────────────────────────────
    infoViewBackLabel: 'Zurück zum Chat',
    infoViewDescription: 'Ich bin ein KI-gestützter Assistent und helfe dir bei Fragen rund um megawood®. Meine Antworten werden automatisch generiert – ich bin daher möglicherweise nicht immer 100 % korrekt. Bitte überprüfe wichtige Informationen.',
    infoViewContextIdLabel: 'Kontext-ID:',
    infoViewNoContextId: 'Keine Kontext-ID verfügbar',

    // ── BotMessage ───────────────────────────────────────────────────
    thumbUpLabel: 'Hilfreich',
    thumbDownLabel: 'Nicht hilfreich',
    copyLabel: 'Kopieren',
    speakLabel: 'Vorlesen',
    respinLabel: 'Neu generieren',
    sourcesTitle: '✨ So ist Woody auf seine Antwort gekommen',
    contextIdLabel: 'Kontext-ID:',
    noContextId: 'Keine Kontext-ID verfügbar',

    // ── ChatTeaser ───────────────────────────────────────────────────
    teaserCloseLabel: 'Schließen',

    // ── LoginModal ───────────────────────────────────────────────────
    loginModalAriaLabel: 'Einloggen',
    loginModalCloseLabel: 'Schließen',
    loginModalHeading: 'Einloggen',
    loginModalSubtitle: 'Bitte melde dich mit deinem Benutzernamen und Passwort an.',
    loginModalUsernameLabel: 'Benutzername',
    loginModalUsernamePlaceholder: 'Benutzername',
    loginModalPasswordLabel: 'Passwort',
    loginModalPasswordPlaceholder: 'Passwort',
    loginModalCancelButton: 'Abbrechen',
    loginModalSubmitButton: 'Anmelden',

    // ── ChatWidget (live-chat system messages) ───────────────────────
    liveChatStarted: 'Live-Chat wurde gestartet.',
    liveChatStopped: 'Live-Chat wurde beendet. Du kannst wie gewohnt weiterschreiben.',
    liveChatStartError: 'Live-Chat konnte nicht gestartet werden. Du kannst normal weiterschreiben.',
    greetingHelloPrefix: 'Hallo',

    // ── useChat — thinking messages ──────────────────────────────────
    thinkingMsg0: 'Woody denkt nach...',
    thinkingMsg1: 'Woody überlegt ganz kurz',
    thinkingMsg2: 'Woody sucht die beste Antwort für dich',
    thinkingMsg3: 'Einen Moment, Woody schaut nach',
    thinkingMsg4: 'Woody sammelt gerade alle Infos',
    thinkingMsg5: 'Woody setzt alles für dich zusammen',
    thinkingMsg6: 'Fast geschafft – Woody ist dran',
    thinkingMsg7: 'Woody prüft das nochmal ganz genau',
    thinkingMsg8: 'Oh, gute Frage… Woody denkt darüber nach',
    thinkingMsg9: 'Woody arbeitet dran, gleich fertig',

    // ── useChat — input-request titles ──────────────────────────────
    dimensionInputRequestTitle: 'Bitte gib die Maße für diese Form an.',
    planningCodeRequestTitle: 'Bitte gib deinen Planungscode ein, damit ich deine bestehende Planung laden kann.',
    dealerLocationRequestTitle: 'Bitte gib Stadt oder Postleitzahl ein, damit ich einen Händler in deiner Nähe finden kann.',
    dealerCityFieldLabel: 'Stadt',
    dealerPostalFieldLabel: 'Postleitzahl',

    // ── useChat — quick-reply labels (shown to user) ─────────────────
    planningCodeEnterLabel: 'Planungscode eingeben',
    dealerSearchOpenLabel: 'Händlersuche öffnen',

    // ── useChat — planning-code flow bot message ─────────────────────
    planningCodeBotPrompt: 'Gerne. Bitte gib deinen Planungscode ein, dann lade ich deine bestehende Planung und biete dir passende Änderungsoptionen an.',

    // ── useChat — error message ──────────────────────────────────────
    chatErrorMessage: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut, oder kontaktiere unseren Support.',

    // ── useRealtimeStt — status texts ────────────────────────────────
    sttStatusListening: 'Höre zu…',
    sttStatusRecording: 'Aufnahme läuft…',
    sttStatusProcessing: 'Verarbeite Sprache…',
    sttStatusInitializing: 'Mikrofon wird initialisiert…',
    sttErrorUnavailable: 'Mikrofonzugriff ist in diesem Browser-Kontext nicht verfügbar.',
    sttErrorFailed: 'STT konnte nicht gestartet werden.',
    sttErrorPrefix: 'Fehler: ',

    // ── PlanningEditor — status & error messages ─────────────────────
    planningEditorEnterCodeError: 'Bitte zuerst einen Planungscode eingeben.',
    planningEditorLoadingStatus: 'Planungsdaten werden geladen ...',
    planningEditorLoadedSuccess: 'Planungsdaten erfolgreich geladen.',
    planningEditorLoadError: 'Planung konnte nicht geladen werden.',
    planningEditorHistoryLoadError: 'Vorherige Planungen konnten nicht geladen werden.',
    planningEditorHistoryLoading: 'Planungen werden geladen …',
    planningEditorHistoryEmpty: 'Noch keine gespeicherten Planungen gefunden.',
    planningEditorSavingStatus: 'Änderungen werden gespeichert ...',
    planningEditorSavedSuccess: 'Planung gespeichert. Aktueller Code:',
    planningEditorSaveError: 'Speichern fehlgeschlagen.',
    planningEditorNoPlanError: 'Es sind noch keine Planungsdaten geladen.',
    planningEditorInvalidCodeError: 'Bitte zuerst einen gültigen Planungscode laden.',

    // ── PlanningEditor — UI labels ───────────────────────────────────
    planningEditorTitle: 'Planung bearbeiten',
    planningEditorHistorySectionTitle: 'Vorherige Planungen',
    planningEditorHistorySectionDesc: 'Wähle eine frühere Planung direkt aus, um sofort in die Bearbeitung zu springen.',
    planningEditorCodeLabel: 'Planungscode',
    planningEditorCodeHint: 'Sobald Woody eine Planung erstellt hat, wird der Code hier automatisch erkannt.',
    planningEditorLoadedPlanPrefix: 'Geladene Planung:',
    planningEditorFormLabel: 'Form',
    planningEditorDielenLabel: 'Diele',
    planningEditorDielenFarbeLabel: 'Dielenfarbe',
    planningEditorProfilLabel: 'Profil',
    planningEditorUkLabel: 'UK',
    planningEditorReloadButton: 'Neu laden',
    planningEditorBauplanButton: 'Bauplan PDF',
    planningEditorMateriallisteButton: 'Materialliste PDF',
    planningEditorSavingButton: 'Wird gespeichert…',
    planningEditorSaveButton: 'Speichern',
    planningEditorLoadButton: 'Laden',
    planningEditorUnknownForm: 'Unbekannte Form',
    planningEditorUnknownDiele: 'Diele unbekannt',
    planningEditorColorFallback: 'Farbe',
  },
  en: {
    // ── existing keys ────────────────────────────────────────────────
    login: 'Login',
    logout: 'Logout',
    loginAction: 'Sign in',
    logoutAction: 'Sign out',
    restartConversation: 'Restart conversation',
    closeChat: 'Close chat',
    inputPlaceholder: 'Ask Woody your question...',
    inputLabel: 'Type message',
    sendLabel: 'Send',
    openChatLabel: 'Open chat',
    greetingWelcome: 'Welcome to megawood®! 👋',
    greetingClassicLine1: 'I am Woody, your megawood® AI assistant!',
    greetingClassicLine2: 'How can I help you today?',
    greetingClassicLine3: 'I am still learning, so please verify important answers for accuracy.',
    greetingLandscapeLine1: 'I am Woody the Craftsman, your personal AI assistant! Ask me anything about our products, or we can create a planning together.',
    greetingLandscapeLine2: "Let's start planning right away!",
    greetingLandscapeLine3: 'I am still learning, so please verify important answers for accuracy.',
    createdBy: 'Created by megawood AI',
    aiDisclaimer: 'AI assistance can make mistakes.',

    // ── ChatHeader ───────────────────────────────────────────────────
    switchToEnglish: 'Switch to English',
    switchToGerman: 'Switch to German',

    // ── ChatFooter ───────────────────────────────────────────────────
    cancelGeneration: 'Cancel response',
    startLiveChat: 'Start live chat',
    stopLiveChat: 'Stop live chat',
    liveListeningPlaceholder: 'Woody is listening...',
    footerPrivacy: 'Privacy policy',
    footerImprint: 'Imprint',
    liveRecognizedPrefix: 'Recognised: ',

    // ── ChatBody — DimensionInputCard ────────────────────────────────
    dimensionInputFallbackTitle: 'Please enter the dimensions.',
    dimensionSubmitButton: 'Apply dimensions',
    dimensionPlaceholder: 'e.g. 4.2',

    // ── ChatBody — DealerLocationInputCard ───────────────────────────
    dealerInputFallbackTitle: 'Please enter a city or postcode.',
    dealerSubmitButton: 'Find dealer',
    dealerPostalPlaceholder: 'e.g. SW1A 1AA',
    dealerCityPlaceholder: 'e.g. London',

    // ── ChatBody — PlanningCodeInputCard ─────────────────────────────
    planningCodeInputFallbackTitle: 'Please enter your planning code.',
    planningCodeLabel: 'Planning code',
    planningCodeLoadButton: 'Load planning',
    planningCodePlaceholder: 'e.g. mgw150823',

    // ── ChatBody — info view ─────────────────────────────────────────
    infoViewBackLabel: 'Back to chat',
    infoViewDescription: 'I am an AI-powered assistant and help you with questions about megawood®. My answers are generated automatically – so I may not always be 100 % correct. Please verify important information.',
    infoViewContextIdLabel: 'Context ID:',
    infoViewNoContextId: 'No context ID available',

    // ── BotMessage ───────────────────────────────────────────────────
    thumbUpLabel: 'Helpful',
    thumbDownLabel: 'Not helpful',
    copyLabel: 'Copy',
    speakLabel: 'Read aloud',
    respinLabel: 'Regenerate',
    sourcesTitle: '✨ Here is how Woody arrived at this answer',
    contextIdLabel: 'Context ID:',
    noContextId: 'No context ID available',

    // ── ChatTeaser ───────────────────────────────────────────────────
    teaserCloseLabel: 'Close',

    // ── LoginModal ───────────────────────────────────────────────────
    loginModalAriaLabel: 'Sign in',
    loginModalCloseLabel: 'Close',
    loginModalHeading: 'Sign in',
    loginModalSubtitle: 'Please sign in with your username and password.',
    loginModalUsernameLabel: 'Username',
    loginModalUsernamePlaceholder: 'Username',
    loginModalPasswordLabel: 'Password',
    loginModalPasswordPlaceholder: 'Password',
    loginModalCancelButton: 'Cancel',
    loginModalSubmitButton: 'Sign in',

    // ── ChatWidget (live-chat system messages) ───────────────────────
    liveChatStarted: 'Live chat has started.',
    liveChatStopped: 'Live chat has ended. You can continue typing as usual.',
    liveChatStartError: 'Live chat could not be started. You can continue typing normally.',
    greetingHelloPrefix: 'Hello',

    // ── useChat — thinking messages ──────────────────────────────────
    thinkingMsg0: 'Woody is thinking...',
    thinkingMsg1: 'Woody is pondering for a moment',
    thinkingMsg2: 'Woody is looking for the best answer for you',
    thinkingMsg3: 'One moment, Woody is checking',
    thinkingMsg4: 'Woody is gathering all the information',
    thinkingMsg5: 'Woody is putting it all together for you',
    thinkingMsg6: 'Almost there – Woody is on it',
    thinkingMsg7: 'Woody is double-checking that',
    thinkingMsg8: 'Oh, great question… Woody is thinking about it',
    thinkingMsg9: 'Woody is working on it, almost done',

    // ── useChat — input-request titles ──────────────────────────────
    dimensionInputRequestTitle: 'Please enter the dimensions for this shape.',
    planningCodeRequestTitle: 'Please enter your planning code so I can load your existing planning.',
    dealerLocationRequestTitle: 'Please enter a city or postcode so I can find a dealer near you.',
    dealerCityFieldLabel: 'City',
    dealerPostalFieldLabel: 'Postcode',

    // ── useChat — quick-reply labels (shown to user) ─────────────────
    planningCodeEnterLabel: 'Enter planning code',
    dealerSearchOpenLabel: 'Open dealer search',

    // ── useChat — planning-code flow bot message ─────────────────────
    planningCodeBotPrompt: 'Sure. Please enter your planning code and I will load your existing planning and offer suitable options.',

    // ── useChat — error message ──────────────────────────────────────
    chatErrorMessage: 'Sorry, an error occurred. Please try again or contact our support.',

    // ── useRealtimeStt — status texts ────────────────────────────────
    sttStatusListening: 'Listening…',
    sttStatusRecording: 'Recording…',
    sttStatusProcessing: 'Processing speech…',
    sttStatusInitializing: 'Initialising microphone…',
    sttErrorUnavailable: 'Microphone access is not available in this browser context.',
    sttErrorFailed: 'STT could not be started.',
    sttErrorPrefix: 'Error: ',

    // ── PlanningEditor — status & error messages ─────────────────────
    planningEditorEnterCodeError: 'Please enter a planning code first.',
    planningEditorLoadingStatus: 'Loading planning data ...',
    planningEditorLoadedSuccess: 'Planning data loaded successfully.',
    planningEditorLoadError: 'Planning could not be loaded.',
    planningEditorHistoryLoadError: 'Previous plannings could not be loaded.',
    planningEditorHistoryLoading: 'Loading plannings …',
    planningEditorHistoryEmpty: 'No saved plannings found yet.',
    planningEditorSavingStatus: 'Saving changes ...',
    planningEditorSavedSuccess: 'Planning saved. Current code:',
    planningEditorSaveError: 'Saving failed.',
    planningEditorNoPlanError: 'No planning data has been loaded yet.',
    planningEditorInvalidCodeError: 'Please load a valid planning code first.',

    // ── PlanningEditor — UI labels ───────────────────────────────────
    planningEditorTitle: 'Edit planning',
    planningEditorHistorySectionTitle: 'Previous plannings',
    planningEditorHistorySectionDesc: 'Select a previous planning directly to jump straight into editing.',
    planningEditorCodeLabel: 'Planning code',
    planningEditorCodeHint: 'Once Woody has created a planning, the code will be detected here automatically.',
    planningEditorLoadedPlanPrefix: 'Loaded planning:',
    planningEditorFormLabel: 'Shape',
    planningEditorDielenLabel: 'Decking',
    planningEditorDielenFarbeLabel: 'Decking colour',
    planningEditorProfilLabel: 'Profile',
    planningEditorUkLabel: 'Substructure',
    planningEditorReloadButton: 'Reload',
    planningEditorBauplanButton: 'Construction plan PDF',
    planningEditorMateriallisteButton: 'Materials list PDF',
    planningEditorSavingButton: 'Saving…',
    planningEditorSaveButton: 'Save',
    planningEditorLoadButton: 'Load',
    planningEditorUnknownForm: 'Unknown shape',
    planningEditorUnknownDiele: 'Decking unknown',
    planningEditorColorFallback: 'Colour',
  },
};
