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
  planningCodeAutoLoadMessage: string;

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

  // ── Quick-reply labels — loaded plan ────────────────────────────
  quickReplyChangeDimensions: string;
  quickReplyChangeDiele: string;
  quickReplyChangeProfilfarbe: string;
  quickReplyChangeUK: string;
  quickReplyBauplanPdf: string;
  quickReplyMateriallistePdf: string;
  quickReplyDealerNearMe: string;

  // ── Quick-reply labels — general ────────────────────────────────
  quickReplyFindDealerProximity: string;
  quickReplyOrderSample: string;
  quickReplyFindSpecialistDealer: string;

  // ── Profile colours ──────────────────────────────────────────────
  profileColorSilver: string;
  profileColorAnthracite: string;

  // ── Aria labels for input cards ──────────────────────────────────
  dimensionCardAriaLabel: string;
  dealerCardAriaLabel: string;
  planningCodeCardAriaLabel: string;
  infoViewAriaLabel: string;
  shapeRectangleAriaLabel: string;
  shapeLAriaLabel: string;
  shapeUAriaLabel: string;
  shapeOAriaLabel: string;

  // ── Footer ───────────────────────────────────────────────────────
  quickRepliesAriaLabel: string;

  // ── PromptPacks — button labels ───────────────────────────────────
  promptPackHowCanYouHelp: string;
  promptPackDiscoverDecking: string;
  promptPackFindDealer: string;
  promptPackProjectConsulting: string;
  promptPackTechnicalProperties: string;
  promptPackFindPartnerDealer: string;
  promptPackCreateNewPlan: string;
  promptPackUseExistingPlan: string;
  promptPackStartProjectPlan: string;
  promptPackContinueWithCode: string;
  promptPackFindDealerForImplementation: string;
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
    planningCodeAutoLoadMessage: 'Bitte lade meine bestehende Planung mit dem Planungscode {code} und zeige mir danach passende Änderungsoptionen.',

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

    // ── Quick-reply labels — loaded plan ────────────────────────────
    quickReplyChangeDimensions: 'Form/Maße ändern',
    quickReplyChangeDiele: 'Diele/Farbe ändern',
    quickReplyChangeProfilfarbe: 'Profilfarbe anpassen',
    quickReplyChangeUK: 'Unterkonstruktion ändern',
    quickReplyBauplanPdf: 'Bauplan als PDF',
    quickReplyMateriallistePdf: 'Materialliste als PDF',
    quickReplyDealerNearMe: 'Händler in meiner Nähe finden',

    // ── Quick-reply labels — general ────────────────────────────────
    quickReplyFindDealerProximity: 'Passenden Händler finden',
    quickReplyOrderSample: 'Muster bestellen',
    quickReplyFindSpecialistDealer: 'Fachhändler finden',

    // ── Profile colours ──────────────────────────────────────────────
    profileColorSilver: 'Silber',
    profileColorAnthracite: 'Anthrazit',

    // ── Aria labels for input cards ──────────────────────────────────
    dimensionCardAriaLabel: 'Maßeingabe',
    dealerCardAriaLabel: 'Standort-Eingabe für Händlersuche',
    planningCodeCardAriaLabel: 'Planungscode-Eingabe',
    infoViewAriaLabel: 'Informationen über den KI-Assistenten',
    shapeRectangleAriaLabel: 'Rechteck mit Seitenmarkierung',
    shapeLAriaLabel: 'L-Form mit Seitenmarkierungen',
    shapeUAriaLabel: 'U-Form mit Seitenmarkierungen',
    shapeOAriaLabel: 'O-Form mit Seitenmarkierungen',

    // ── Footer ───────────────────────────────────────────────────────
    quickRepliesAriaLabel: 'Schnellaktionen',

    // ── PromptPacks — button labels ───────────────────────────────────
    promptPackHowCanYouHelp: 'Wie kannst du mir helfen?',
    promptPackDiscoverDecking: 'Dielen entdecken',
    promptPackFindDealer: 'Händler finden',
    promptPackProjectConsulting: 'Projektbezogene Beratung',
    promptPackTechnicalProperties: 'Technische Eigenschaften',
    promptPackFindPartnerDealer: 'Partnerhändler finden',
    promptPackCreateNewPlan: 'Neue Planung erstellen',
    promptPackUseExistingPlan: 'Vorhandene Planung nutzen',
    promptPackStartProjectPlan: 'Projektplanung starten',
    promptPackContinueWithCode: 'Planungscode weiterbearbeiten',
    promptPackFindDealerForImplementation: 'Händler/Partner für Umsetzung',
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
    planningCodeAutoLoadMessage: 'Please load my existing planning with the planning code {code} and then show me suitable change options.',

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

    // ── Quick-reply labels — loaded plan ────────────────────────────
    quickReplyChangeDimensions: 'Change dimensions',
    quickReplyChangeDiele: 'Change decking/colour',
    quickReplyChangeProfilfarbe: 'Adjust profile colour',
    quickReplyChangeUK: 'Change substructure',
    quickReplyBauplanPdf: 'Construction plan as PDF',
    quickReplyMateriallistePdf: 'Materials list as PDF',
    quickReplyDealerNearMe: 'Find dealer near me',

    // ── Quick-reply labels — general ────────────────────────────────
    quickReplyFindDealerProximity: 'Find suitable dealer',
    quickReplyOrderSample: 'Order sample',
    quickReplyFindSpecialistDealer: 'Find specialist dealer',

    // ── Profile colours ──────────────────────────────────────────────
    profileColorSilver: 'Silver',
    profileColorAnthracite: 'Anthracite',

    // ── Aria labels for input cards ──────────────────────────────────
    dimensionCardAriaLabel: 'Dimension input',
    dealerCardAriaLabel: 'Location input for dealer search',
    planningCodeCardAriaLabel: 'Planning code input',
    infoViewAriaLabel: 'Information about the AI assistant',
    shapeRectangleAriaLabel: 'Rectangle with side labels',
    shapeLAriaLabel: 'L-shape with side labels',
    shapeUAriaLabel: 'U-shape with side labels',
    shapeOAriaLabel: 'O-shape with side labels',

    // ── Footer ───────────────────────────────────────────────────────
    quickRepliesAriaLabel: 'Quick actions',

    // ── PromptPacks — button labels ───────────────────────────────────
    promptPackHowCanYouHelp: 'How can you help me?',
    promptPackDiscoverDecking: 'Discover decking',
    promptPackFindDealer: 'Find dealer',
    promptPackProjectConsulting: 'Project-specific consulting',
    promptPackTechnicalProperties: 'Technical properties',
    promptPackFindPartnerDealer: 'Find partner dealer',
    promptPackCreateNewPlan: 'Create new plan',
    promptPackUseExistingPlan: 'Use existing plan',
    promptPackStartProjectPlan: 'Start project plan',
    promptPackContinueWithCode: 'Continue with planning code',
    promptPackFindDealerForImplementation: 'Dealer/partner for implementation',
  },
};
