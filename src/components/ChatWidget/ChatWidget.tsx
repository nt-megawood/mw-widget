import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from '../ChatHeader';
import { ChatBody } from '../ChatBody';
import type { QuickReply } from '../ChatBody';
import { ChatFooter } from '../ChatFooter';
import { ChatTeaser } from '../ChatTeaser';
import { ChatToggle } from '../ChatToggle';
import { useChat } from '../../hooks/useChat';
import { useConversation } from '../../hooks/useConversation';
import { useTeaser } from '../../hooks/useTeaser';
import { usePresence } from '../../hooks/usePresence';
import { getConversation, deleteConversation } from '../../services/api';
import type { WidgetConfig, ConversationHistoryItem } from '../../types';
import { getDefaultPromptPack, getPromptPack } from '../../config/promptPacks';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatWidgetProps {
  config: WidgetConfig;
  widgetId: string;
  onPlanningCodeDetected?: (code: string) => void;
  children?: React.ReactNode;
}

function InitialGreeting({ mode }: { mode: 'classic' | 'landscape' }) {
  const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="message-wrapper bot initial">
      <div className="bot-icon"><img src={`${BASE_URL}woody.jpg`} alt="Woody" /></div>
      <div className="bot-bubble-col">
        <div className="bubble">
          <p>Willkommen bei megawood&#174;! &#128075;</p>
          {mode === 'landscape' ? (
            <>
              <p>Ich bin <b>Handwerker Woody</b>, dein persönlicher KI-Assistent! Du kannst mir alle Fragen zu unseren Produkten stellen oder eine Planung mit mir erstellen.</p>
              <p>Lass uns gleich mit der Planung beginnen!</p>
            </>
          ) : (
            <>
              <p>Ich bin <b>Woody</b>, die megawood&#174; KI! Du kannst mir alle Fragen zu unseren Produkten stellen.</p>
              <p>Womit kann ich dir heute helfen?</p>
            </>
          )}
        </div>
        <div className="bot-meta">
          <span className="meta-time">{time}</span>
          <span className="meta-brand">Erstellt von megawood KI</span>
        </div>
      </div>
    </div>
  );
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config, widgetId, onPlanningCodeDetected, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { conversationId, saveConversationId, clearConversation } = useConversation(widgetId);
  const {
    messages,
    activeQuickReplies,
    activeInputRequest,
    entryContext,
    isEntryComplete,
    isThinking,
    thinkingText,
    setEntryGoal,
    setAudiencePath,
    startEntryFlow,
    sendMessage,
    handleQuickReply,
    addBotMessage,
    clearMessages,
    restoreMessages,
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

  const handleClose = () => setIsOpen(false);

  const handleRefresh = async () => {
    if (conversationId) {
      await deleteConversation(conversationId);
    }
    clearConversation();
    clearMessages();
  };

  const handleSend = (text: string) => sendMessage(text);
  const inputLockedByEntryFlow = messages.length === 0 && !isEntryComplete;

  const quickReplies: QuickReply[] = isEntryComplete && entryContext.audiencePath
    ? getPromptPack(config.pageContext, entryContext.audiencePath)
    : getDefaultPromptPack(config.pageContext);
  const posClass = `pos-${config.position}`;
  const initialGreeting = <InitialGreeting mode={config.mode} />;

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
      {!isOpen && <ChatToggle onClick={handleOpen} position={config.position} />}
      {isOpen && (
        <div className={`chat-container ${config.mode === 'landscape' ? 'landscape-widget' : ''} ${posClass}`}>
          {config.mode === 'landscape' ? (
            <div className="chat-layout">
              <div className="chat-main">
                <ChatHeader onRefresh={handleRefresh} onClose={handleClose} />
                <ChatBody
                  messages={messages}
                  isThinking={isThinking}
                  thinkingText={thinkingText}
                  initialGreeting={initialGreeting}
                  quickReplies={quickReplies}
                  contextualQuickReplies={activeQuickReplies}
                  inputRequest={activeInputRequest}
                  entryContext={entryContext}
                  isEntryComplete={isEntryComplete}
                  onGoalSelect={setEntryGoal}
                  onAudienceSelect={setAudiencePath}
                  onStartEntryFlow={startEntryFlow}
                  onQuickReply={handleQuickReply}
                  onSubmitInputRequest={handleSend}
                />
                <ChatFooter
                  onSend={handleSend}
                  disabled={isThinking || inputLockedByEntryFlow}
                  conversationId={conversationId}
                  placeholder={inputLockedByEntryFlow ? 'Bitte zuerst Ziel und Zielgruppe auswählen.' : 'Stelle deine Frage...'}
                />
              </div>
              {children}
            </div>
          ) : (
            <>
              <ChatHeader onRefresh={handleRefresh} onClose={handleClose} />
              <ChatBody
                messages={messages}
                isThinking={isThinking}
                thinkingText={thinkingText}
                initialGreeting={initialGreeting}
                quickReplies={quickReplies}
                contextualQuickReplies={activeQuickReplies}
                inputRequest={activeInputRequest}
                entryContext={entryContext}
                isEntryComplete={isEntryComplete}
                onGoalSelect={setEntryGoal}
                onAudienceSelect={setAudiencePath}
                onStartEntryFlow={startEntryFlow}
                onQuickReply={handleQuickReply}
                onSubmitInputRequest={handleSend}
              />
              <ChatFooter
                onSend={handleSend}
                disabled={isThinking || inputLockedByEntryFlow}
                conversationId={conversationId}
                placeholder={inputLockedByEntryFlow ? 'Bitte zuerst Ziel und Zielgruppe auswählen.' : 'Stelle deine Frage...'}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};
