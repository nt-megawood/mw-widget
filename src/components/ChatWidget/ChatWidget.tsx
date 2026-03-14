import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from '../ChatHeader';
import { ChatBody } from '../ChatBody';
import { ChatFooter } from '../ChatFooter';
import { ChatTeaser } from '../ChatTeaser';
import { ChatToggle } from '../ChatToggle';
import { useChat } from '../../hooks/useChat';
import { useConversation } from '../../hooks/useConversation';
import { useTeaser } from '../../hooks/useTeaser';
import { usePresence } from '../../hooks/usePresence';
import { getConversation, deleteConversation } from '../../services/api';
import type { WidgetConfig, ConversationHistoryItem } from '../../types';

interface ChatWidgetProps {
  config: WidgetConfig;
  widgetId: string;
  children?: React.ReactNode;
}

const CLASSIC_QUICK_REPLIES = [
  'Wie kannst du mir helfen?',
  'Informationen zu den megawood® Dielen',
  'Händlersuche',
];

const LANDSCAPE_QUICK_REPLIES = [
  'Wie kannst du mir helfen?',
  'Informationen zu den megawood® Dielen',
  'Händlersuche',
  'Neue Planung erstellen',
  'Vorhandene Planung nutzen',
];

const INITIAL_GREETING = (
  <div className="message-wrapper bot initial-greeting">
    <div className="bubble bot-bubble">
      <p><strong>Willkommen bei megawood®! 👋</strong></p>
      <p>Ich bin Woody, die megawood® KI! Du kannst mir alle Fragen zu unseren Produkten stellen.</p>
      <p>Womit kann ich dir heute helfen?</p>
    </div>
  </div>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config, widgetId, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { conversationId, saveConversationId, clearConversation } = useConversation(widgetId);
  const { messages, isThinking, thinkingText, sendMessage, addBotMessage, clearMessages, restoreMessages } =
    useChat(conversationId, saveConversationId);
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

  const quickReplies = config.mode === 'landscape' ? LANDSCAPE_QUICK_REPLIES : CLASSIC_QUICK_REPLIES;

  return (
    <>
      {!isOpen && isTeaserVisible && (
        <ChatTeaser
          title={config.teaser.title}
          text={config.teaser.text}
          onClose={dismissTeaser}
          onOpen={handleOpen}
        />
      )}
      {!isOpen && <ChatToggle onClick={handleOpen} />}
      {isOpen && (
        <div className={`chat-container ${config.mode === 'landscape' ? 'landscape-widget' : ''} ${config.position}`}>
          {config.mode === 'landscape' ? (
            <div className="chat-layout">
              <div className="chat-main">
                <ChatHeader onRefresh={handleRefresh} onClose={handleClose} />
                <ChatBody
                  messages={messages}
                  isThinking={isThinking}
                  thinkingText={thinkingText}
                  initialGreeting={INITIAL_GREETING}
                  quickReplies={quickReplies}
                  onQuickReply={handleSend}
                />
                <ChatFooter onSend={handleSend} disabled={isThinking} />
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
                initialGreeting={INITIAL_GREETING}
                quickReplies={quickReplies}
                onQuickReply={handleSend}
              />
              <ChatFooter onSend={handleSend} disabled={isThinking} />
            </>
          )}
        </div>
      )}
    </>
  );
};
