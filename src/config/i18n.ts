export type WidgetLanguage = 'de' | 'en';

export interface UiCopy {
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
  greetingLandscapeLine1: string;
  greetingLandscapeLine2: string;
  createdBy: string;
  aiDisclaimer: string;
}

export const UI_COPY: Record<WidgetLanguage, UiCopy> = {
  de: {
    login: 'Login',
    logout: 'Logout',
    loginAction: 'Einloggen',
    logoutAction: 'Ausloggen',
    restartConversation: 'Gespräch neu starten',
    closeChat: 'Chat schließen',
    inputPlaceholder: 'Stelle deine Frage...',
    inputLabel: 'Nachricht eingeben',
    sendLabel: 'Senden',
    openChatLabel: 'Chat öffnen',
    greetingWelcome: 'Willkommen bei megawood®! 👋',
    greetingClassicLine1: 'Ich bin Woody, die megawood® KI! Du kannst mir alle Fragen zu unseren Produkten stellen.',
    greetingClassicLine2: 'Womit kann ich dir heute helfen?',
    greetingLandscapeLine1: 'Ich bin Handwerker Woody, dein persönlicher KI-Assistent! Du kannst mich alles zu unseren Produkten fragen, oder wir können eine Planung zusammen erstellen.',
    greetingLandscapeLine2: 'Lass uns gleich mit der Planung beginnen!',
    createdBy: 'Erstellt von megawood KI',
    aiDisclaimer: 'KI-Unterstützung kann Fehler machen.',
  },
  en: {
    login: 'Login',
    logout: 'Logout',
    loginAction: 'Sign in',
    logoutAction: 'Sign out',
    restartConversation: 'Restart conversation',
    closeChat: 'Close chat',
    inputPlaceholder: 'Ask your question...',
    inputLabel: 'Type message',
    sendLabel: 'Send',
    openChatLabel: 'Open chat',
    greetingWelcome: 'Welcome to megawood®! 👋',
    greetingClassicLine1: 'I am Woody, the megawood® AI! You can ask me anything about our products.',
    greetingClassicLine2: 'How can I help you today?',
    greetingLandscapeLine1: 'I am Woody the Craftsman, your personal AI assistant! Ask me anything about our products, or we can create a planning together.',
    greetingLandscapeLine2: "Let's start planning right away!",
    createdBy: 'Created by megawood AI',
    aiDisclaimer: 'AI assistance can make mistakes.',
  },
};
