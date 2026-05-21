import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from '../ChatHeader';
import { ChatBody } from '../ChatBody';
import { ChatFooter } from '../ChatFooter';
import { ChatTeaser } from '../ChatTeaser';
import { ChatToggle } from '../ChatToggle';
import { LoginModal } from '../LoginModal';
import { useChat } from '../../hooks/useChat';
import { useConversation } from '../../hooks/useConversation';
import { useTeaser } from '../../hooks/useTeaser';
import { usePresence } from '../../hooks/usePresence';
import { useRealtimeStt } from '../../hooks/useRealtimeStt';
import { speakText, stopSpeaking } from '../../utils/speech';
//import { useWidgetToken } from '../../hooks/useWidgetToken';
import { getConversation, deleteConversation } from '../../services/api';
import type { WidgetConfig, ConversationHistoryItem, QuickReplyOption } from '../../types';
import { getPromptPack } from '../../config/promptPacks';
import { getAuthData, getAudiencePath } from '../../hooks/useAuth';
import type { WidgetLanguage } from '../../config/i18n';
import { UI_COPY, LOCALE_MAP } from '../../config/i18n';

const BASE_URL = import.meta.env.BASE_URL;
const SHOW_VOICE_BUTTON = (import.meta.env.VITE_SHOW_VOICE_BUTTON ?? 'true') === 'true';

interface ChatWidgetProps {
  config: WidgetConfig;
  widgetId: string;
  onPlanningCodeDetected?: (code: string) => void;
  onLanguageChange?: (language: WidgetLanguage) => void;
  children?: React.ReactNode;
}


function InitialGreeting({ mode, language }: { mode: 'website' | 'planner'; language: WidgetLanguage }) {
  const copy = UI_COPY[language];
  const auth = getAuthData();
  const userName = auth?.user?.name ? ` ${copy.greetingHelloPrefix} ${auth.user.name}!` : '';

  return (
    <div className="message-wrapper bot initial">
      <div className="bot-icon"><img src={`${BASE_URL}woody.png`} alt="Woody" /></div>
      <div className="bot-bubble-col">
        <div className="bubble">
          <p>{userName} {copy.greetingWelcome}</p>
          {mode === 'planner' ? (
            <>
              <p>{copy.greetingLandscapeLine1}</p>
              <p>{copy.greetingLandscapeLine3}</p>
              <p>{copy.greetingLandscapeLine2}</p>
            </>
          ) : (
            <>
              <p>{copy.greetingClassicLine1}</p>
              <p>{copy.greetingClassicLine3}</p>             
              <p>{copy.greetingClassicLine2}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config, widgetId, onPlanningCodeDetected, onLanguageChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [language, setLanguage] = useState<WidgetLanguage>('de');

  const handleLanguageChange = useCallback((lang: WidgetLanguage) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  }, [onLanguageChange]);
  const isLiveConnecting = false;
  const { conversationId, saveConversationId, clearConversation } = useConversation(widgetId);
  const audiencePath = getAudiencePath(getAuthData()) ?? 'privatkunde';
  const {
    messages,
    activeQuickReplies,
    activeInputRequest,
    isThinking,
    isStreaming,
    thinkingText,
    sendMessage,
    handleQuickReply,
    handleDealerLocationSubmit,
    addUserMessage,
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
      widgetVariant: config.mode,
      audiencePath,
      language,
      planningCode: config.planningCode,
    });
  const { isVisible: isTeaserVisible, dismiss: dismissTeaser } = useTeaser(
    config.teaser.show,
    isOpen
  );

  const [browserSttPrefill] = useState('');
  const { vadState, partialText, finalText, transcribedText, statusText: liveStatusText, start: startStt, stop: stopStt, clearFinal, clearTranscribed, levelRef: liveLevelRef } = useRealtimeStt({ isStreaming, language });
  const lastSubmittedSttTextRef = useRef('');
  const lastSubmittedAtRef = useRef(0);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());

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
      addBotMessage(UI_COPY[language].liveChatStopped);
    }
  }, [addBotMessage, language, stopStt]);

  const startLiveMode = useCallback(async () => {
    if (isLiveMode || isLiveConnecting) return;
    await startStt();
    setIsLiveMode(true);
    addBotMessage(UI_COPY[language].liveChatStarted);
  }, [addBotMessage, isLiveConnecting, isLiveMode, language, startStt]);

  useEffect(() => {
    const text = transcribedText?.replace(/\s+/g, ' ').trim();
    if (!text) return;
    addUserMessage(text);
    clearTranscribed();
  }, [transcribedText, addUserMessage, clearTranscribed]);

  useEffect(() => {
    const normalizedText = finalText.replace(/\s+/g, ' ').trim();
    if (!normalizedText) return;

    const now = Date.now();
    const isDuplicate = normalizedText === lastSubmittedSttTextRef.current && now - lastSubmittedAtRef.current < 10000;
    if (isDuplicate || normalizedText.length < 2) {
      clearFinal();
      return;
    }

    lastSubmittedSttTextRef.current = normalizedText;
    lastSubmittedAtRef.current = now;

    if (isLiveMode) {
      addBotMessage(normalizedText);
    } else {
      sendMessage(normalizedText);
    }
    clearFinal();
  }, [clearFinal, finalText, sendMessage, addBotMessage, isLiveMode]);

  const toggleLiveMode = useCallback(() => {
    if (isLiveMode || isLiveConnecting) {
      stopLiveMode();
      return;
    }
    startLiveMode().catch(() => {
      addBotMessage(UI_COPY[language].liveChatStartError);
      stopLiveMode(true);
    });
  }, [addBotMessage, isLiveConnecting, isLiveMode, language, startLiveMode, stopLiveMode]);

  useEffect(() => {
    return () => {
      stopLiveMode(true);
    };
  }, [stopLiveMode]);

  useEffect(() => {
    if (!isLiveMode) return;
    stopSpeaking();
    spokenMessageIdsRef.current.clear();
  }, [isLiveMode]);

  useEffect(() => {
    if (!isLiveMode || isStreaming || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'bot' && lastMessage.text && !spokenMessageIdsRef.current.has(lastMessage.id)) {
      spokenMessageIdsRef.current.add(lastMessage.id);
      stopSpeaking();
      speakText(lastMessage.text, LOCALE_MAP[language]);
    }
  }, [isLiveMode, isStreaming, messages]);

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
  const quickReplies: QuickReplyOption[] = getPromptPack(config.mode, audiencePath, language);
  const footerQuickReplies: QuickReplyOption[] = messages.length > 0
    ? activeQuickReplies
    : quickReplies;
  const posClass = `pos-${config.position}`;
  const copy = UI_COPY[language];
  const initialGreeting = <InitialGreeting mode={config.mode} language={language} />;

  const autoSentPlanningCodeRef = useRef(false);
  useEffect(() => {
    if (autoSentPlanningCodeRef.current) return;
    if (!isOpen) return;
    if (config.mode !== 'planner') return;
    const code = config.planningCode?.trim();
    if (!code || !/^mgw[a-z0-9]{4,}$/i.test(code)) return;
    if (messages.length > 0) return;
    autoSentPlanningCodeRef.current = true;
    sendMessage(copy.planningCodeAutoLoadMessage.replace('{code}', code));
  }, [isOpen, config.mode, config.planningCode, messages.length, sendMessage, copy]);

  return (
    <>
      {!isOpen && isTeaserVisible && (
        <ChatTeaser
          title={config.teaser.title}
          text={config.teaser.text}
          position={config.position}
          onClose={dismissTeaser}
          onOpen={handleOpen}
          language={language}
        />
      )}
      {!isOpen && <ChatToggle onClick={handleOpen} position={config.position} language={language} />}
      {isOpen && (
        <div className={`chat-container ${config.mode === 'planner' ? 'planner-widget' : ''} ${posClass}`}>
          {config.mode === 'planner' ? (
            <div className="chat-layout">
              <div className="chat-main">
                <ChatHeader onRefresh={handleRefresh} onClose={handleClose} onLoginClick={handleOpenLogin} language={language} onLanguageChange={handleLanguageChange} />
                <ChatBody
                  messages={messages}
                  isThinking={isThinking}
                  thinkingText={thinkingText}
                  initialGreeting={initialGreeting}
                  inputRequest={activeInputRequest}
                  onSubmitInputRequest={handleSend}
                  onDealerLocationSubmit={handleDealerLocationSubmit}
                  conversationId={conversationId}
                  onRespinLastAnswer={handleRespinLastAnswer}
                  disableRespin={isThinking}
                  language={language}
                />
                <ChatFooter
                  quickReplies={footerQuickReplies}
                  onQuickReply={handleQuickReply}
                  onSend={handleSend}
                  disabled={isStreaming}
                  isGenerating={isStreaming}
                  onCancelGeneration={cancelResponseGeneration}
                  placeholder={copy.inputPlaceholder}
                  language={language}
                  prefillInput={browserSttPrefill}
                  showLiveButton={SHOW_VOICE_BUTTON}
                  isLiveMode={isLiveMode}
                  onToggleLiveMode={toggleLiveMode}
                  liveStatusText={partialText ? `${copy.liveRecognizedPrefix}${partialText}` : liveStatusText}
                  vadState={vadState}
                  liveLevelRef={liveLevelRef}
                />
              </div>
              {children}
            </div>
          ) : (
            <>
              <ChatHeader onRefresh={handleRefresh} onClose={handleClose} onLoginClick={handleOpenLogin} language={language} onLanguageChange={handleLanguageChange} />
              <ChatBody
                messages={messages}
                isThinking={isThinking}
                thinkingText={thinkingText}
                initialGreeting={initialGreeting}
                inputRequest={activeInputRequest}
                onSubmitInputRequest={handleSend}
                onDealerLocationSubmit={handleDealerLocationSubmit}
                conversationId={conversationId}
                onRespinLastAnswer={handleRespinLastAnswer}
                disableRespin={isThinking}
                language={language}
              />
              <ChatFooter
                quickReplies={footerQuickReplies}
                onQuickReply={handleQuickReply}
                onSend={handleSend}
                disabled={isStreaming || isLiveMode || isLiveConnecting}
                isGenerating={isStreaming}
                onCancelGeneration={cancelResponseGeneration}
                placeholder={isLiveMode ? copy.liveListeningPlaceholder : copy.inputPlaceholder}
                showLiveButton={SHOW_VOICE_BUTTON}
                isLiveMode={isLiveMode}
                onToggleLiveMode={toggleLiveMode}
                liveStatusText={partialText ? `${copy.liveRecognizedPrefix}${partialText}` : liveStatusText}
                vadState={vadState}
                language={language}
                prefillInput={browserSttPrefill}
                liveLevelRef={liveLevelRef}
              />
            </>
          )}
        </div>
      )}
      {isOpen && isLoginOpen && <LoginModal onClose={handleCloseLogin} language={language} />}
    </>
  );
};
