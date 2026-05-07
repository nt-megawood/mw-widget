import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from '../ChatHeader';
import { ChatBody } from '../ChatBody';
import type { QuickReply } from '../ChatBody';
import { ChatFooter } from '../ChatFooter';
import { ChatTeaser } from '../ChatTeaser';
import { ChatToggle } from '../ChatToggle';
import { LoginModal } from '../LoginModal';
import { useChat } from '../../hooks/useChat';
import { useConversation } from '../../hooks/useConversation';
import { useTeaser } from '../../hooks/useTeaser';
import { usePresence } from '../../hooks/usePresence';
import { useRealtimeStt } from '../../hooks/useRealtimeStt';
//import { useWidgetToken } from '../../hooks/useWidgetToken';
import { getConversation, deleteConversation } from '../../services/api';
import type { WidgetConfig, ConversationHistoryItem } from '../../types';
import { getDefaultPromptPack, getPromptPack } from '../../config/promptPacks';
import { getAuthData } from '../../hooks/useAuth';
import type { WidgetLanguage } from '../../config/i18n';
import { UI_COPY } from '../../config/i18n';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatWidgetProps {
  config: WidgetConfig;
  widgetId: string;
  onPlanningCodeDetected?: (code: string) => void;
  children?: React.ReactNode;
}


function InitialGreeting({ mode, language }: { mode: 'classic' | 'landscape'; language: WidgetLanguage }) {
  const copy = UI_COPY[language];
  //const time = new Date().toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const auth = getAuthData();
  const userName = auth?.user?.name ? ` Hallo ${auth.user.name}!` : '';

  return (
    <div className="message-wrapper bot initial">
      <div className="bot-icon"><img src={`${BASE_URL}woody.png`} alt="Woody" /></div>
      <div className="bot-bubble-col">
        <div className="bubble">
          <p>{userName} {copy.greetingWelcome}</p>
          {mode === 'landscape' ? (
            <>
              <p>{copy.greetingLandscapeLine1}</p>
              <p>{copy.greetingLandscapeLine2}</p>
            </>
          ) : (
            <>
              <p>{copy.greetingClassicLine1}</p>
              <p>{copy.greetingClassicLine2}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config, widgetId, onPlanningCodeDetected, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [language, setLanguage] = useState<WidgetLanguage>('de');
  const isLiveConnecting = false;
  const { conversationId, saveConversationId, clearConversation } = useConversation(widgetId);
  const {
    messages,
    activeQuickReplies,
    activeInputRequest,
    entryContext,
    isEntryComplete,
    isThinking,
    thinkingText,
    sendMessage,
    handleQuickReply,
    addBotMessage,
    clearMessages,
    restoreMessages,
    cancelResponseGeneration,
  } =
    useChat({
      widgetId,
      conversationId,
      onConversationIdChange: saveConversationId,
      onPlanningCodeDetected,
      pageContext: config.pageContext,
      widgetVariant: config.mode,
    });
  const { isVisible: isTeaserVisible, dismiss: dismissTeaser } = useTeaser(
    config.teaser.show,
    isOpen
  );

  const [browserSttPrefill] = useState('');
  const { partialText, finalText, statusText: liveStatusText, start: startStt, stop: stopStt, clearFinal } = useRealtimeStt();

  const handleNewMessages = useCallback(
    (newMessages: ConversationHistoryItem[]) => {
      newMessages.forEach((msg) => {
        if (msg.role === 'assistant') {
          addBotMessage(msg.text);
        }
      });
    },
    [addBotMessage]
  );

  usePresence({
    conversationId,
    historyCount: messages.length,
    onNewMessages: handleNewMessages,
  });

  // Initialize widget token on mount
  //const { token: widgetToken, loading: tokenLoading, error: tokenError } = useWidgetToken();

  // Restore conversation history on mount only. We intentionally omit conversationId
  // and restoreMessages from the dependency array — this effect should run exactly
  // once so we replay persisted history without re-fetching on every re-render.
  const conversationIdRef = useRef(conversationId);
  const restoreMessagesRef = useRef(restoreMessages);
  useEffect(() => {
    const id = conversationIdRef.current;
    if (!id) return;
    getConversation(id)
      .then((data) => {
        if (data.history?.length > 0) {
          restoreMessagesRef.current(data.history);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    dismissTeaser();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsLoginOpen(false);
  };

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const stopLiveMode = useCallback((silent = false) => {
    stopStt();
    setIsLiveMode(false);

    if (!silent) {
      addBotMessage('Live-Chat wurde beendet. Du kannst wie gewohnt weiterschreiben.');
    }
  }, [addBotMessage, stopStt]);

  const startLiveMode = useCallback(async () => {
    if (isLiveMode || isLiveConnecting) return;
    await startStt();
    setIsLiveMode(true);
    addBotMessage('Live-Chat wurde gestartet.');
  }, [addBotMessage, isLiveConnecting, isLiveMode, startStt]);

  useEffect(() => {
    if (!finalText.trim()) return;
    sendMessage(finalText.trim());
    clearFinal();
  }, [clearFinal, finalText, sendMessage]);

  const toggleLiveMode = useCallback(() => {
    if (isLiveMode || isLiveConnecting) {
      stopLiveMode();
      return;
    }
    startLiveMode().catch(() => {
      addBotMessage('Live-Chat konnte nicht gestartet werden. Du kannst normal weiterschreiben.');
      stopLiveMode(true);
    });
  }, [addBotMessage, isLiveConnecting, isLiveMode, startLiveMode, stopLiveMode]);

  useEffect(() => {
    return () => {
      stopLiveMode(true);
    };
  }, [stopLiveMode]);

  const handleRefresh = async () => {
    if (conversationId) {
      await deleteConversation(conversationId);
    }
    clearConversation();
    clearMessages();
  };

  const handleSend = (text: string) => sendMessage(text);
  const handleRespinLastAnswer = useCallback(() => {
    if (isThinking || messages.length < 2) return;

    const lastMessage = messages[messages.length - 1];
    const previousMessage = messages[messages.length - 2];

    if (lastMessage.role !== 'bot' || previousMessage.role !== 'user') return;

    sendMessage(previousMessage.text);
  }, [messages, isThinking, sendMessage]);
  const quickReplies: QuickReply[] = isEntryComplete && entryContext.audiencePath
    ? getPromptPack(config.pageContext, entryContext.audiencePath)
    : getDefaultPromptPack(config.pageContext);
  const posClass = `pos-${config.position}`;
  const copy = UI_COPY[language];
  const initialGreeting = <InitialGreeting mode={config.mode} language={language} />;

  return (
    <>
      {!isOpen && isTeaserVisible && (
        <ChatTeaser
          title={config.teaser.title}
          text={config.teaser.text}
          position={config.position}
          onClose={dismissTeaser}
          onOpen={handleOpen}
        />
      )}
      {!isOpen && <ChatToggle onClick={handleOpen} position={config.position} language={language} />}
      {isOpen && (
        <div className={`chat-container ${config.mode === 'landscape' ? 'landscape-widget' : ''} ${posClass}`}>
          {config.mode === 'landscape' ? (
            <div className="chat-layout">
              <div className="chat-main">
                <ChatHeader onRefresh={handleRefresh} onClose={handleClose} onLoginClick={handleOpenLogin} language={language} onLanguageChange={setLanguage} />
                <ChatBody
                  messages={messages}
                  isThinking={isThinking}
                  thinkingText={thinkingText}
                  initialGreeting={initialGreeting}
                  quickReplies={quickReplies}
                  contextualQuickReplies={activeQuickReplies}
                  inputRequest={activeInputRequest}
                  onQuickReply={handleQuickReply}
                  onSubmitInputRequest={handleSend}
                  conversationId={conversationId}
                  onRespinLastAnswer={handleRespinLastAnswer}
                  disableRespin={isThinking}
                />
                <ChatFooter
                  onSend={handleSend}
                  disabled={isThinking}
                  isGenerating={isThinking}
                  onCancelGeneration={cancelResponseGeneration}
                  placeholder={copy.inputPlaceholder}
                  language={language}
                  prefillInput={browserSttPrefill}
                />
              </div>
              {children}
            </div>
          ) : (
            <>
              <ChatHeader onRefresh={handleRefresh} onClose={handleClose} onLoginClick={handleOpenLogin} language={language} onLanguageChange={setLanguage} />
              <ChatBody
                messages={messages}
                isThinking={isThinking}
                thinkingText={thinkingText}
                initialGreeting={initialGreeting}
                quickReplies={quickReplies}
                contextualQuickReplies={activeQuickReplies}
                inputRequest={activeInputRequest}
                onQuickReply={handleQuickReply}
                onSubmitInputRequest={handleSend}
                conversationId={conversationId}
                onRespinLastAnswer={handleRespinLastAnswer}
                disableRespin={isThinking}
              />
              <ChatFooter
                onSend={handleSend}
                disabled={isThinking || isLiveMode || isLiveConnecting}
                isGenerating={isThinking}
                onCancelGeneration={cancelResponseGeneration}
                placeholder={
                  isLiveMode
                    ? language === 'de' ? 'Woody hört dir zu...' : 'Woody is listening...'
                    : copy.inputPlaceholder
                }
                showLiveButton
                isLiveMode={isLiveMode}
                onToggleLiveMode={toggleLiveMode}
                liveStatusText={partialText ? `Erkannt: ${partialText}` : liveStatusText}
                language={language}
                prefillInput={browserSttPrefill}
              />
            </>
          )}
        </div>
      )}
      {isOpen && isLoginOpen && <LoginModal onClose={handleCloseLogin} />}
    </>
  );
};
