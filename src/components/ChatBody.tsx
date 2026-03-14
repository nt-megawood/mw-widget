import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { BotMessage } from './Message/BotMessage';
import { UserMessage } from './Message/UserMessage';
import { ThinkingIndicator } from './Message/ThinkingIndicator';

interface ChatBodyProps {
  messages: Message[];
  isThinking: boolean;
  thinkingText: string;
  initialGreeting: React.ReactNode;
  quickReplies: string[];
  onQuickReply: (text: string) => void;
}

export const ChatBody: React.FC<ChatBodyProps> = ({
  messages,
  isThinking,
  thinkingText,
  initialGreeting,
  quickReplies,
  onQuickReply,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="chat-body">
      {initialGreeting}
      {messages.length === 0 && quickReplies.length > 0 && (
        <div className="button-group">
          {quickReplies.map((reply, i) => (
            <button key={i} className="quick-reply-btn" onClick={() => onQuickReply(reply)}>
              {reply}
            </button>
          ))}
        </div>
      )}
      {messages.map((message) =>
        message.role === 'bot' ? (
          <BotMessage key={message.id} message={message} />
        ) : (
          <UserMessage key={message.id} message={message} />
        )
      )}
      {isThinking && <ThinkingIndicator text={thinkingText} />}
      <div ref={bottomRef} />
    </div>
  );
};
