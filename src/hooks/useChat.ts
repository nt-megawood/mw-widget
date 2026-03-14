import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';
import { generateUUID } from '../utils/uuid';
import { sendMessage as apiSendMessage } from '../services/api';

const THINKING_MESSAGES = [
  'Woody denkt nach…',
  'Ich suche die beste Antwort…',
  'Moment, ich frage meine Datenbank…',
  'Fast fertig…',
  'Ich analysiere deine Frage…',
];

export function useChat(conversationId: string | null, onConversationIdChange: (id: string) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState(THINKING_MESSAGES[0]);
  const sessionIdRef = useRef(generateUUID());
  const thinkingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startThinking = useCallback(() => {
    setIsThinking(true);
    let index = 0;
    thinkingIntervalRef.current = setInterval(() => {
      index = (index + 1) % THINKING_MESSAGES.length;
      setThinkingText(THINKING_MESSAGES[index]);
    }, 2000);
  }, []);

  const stopThinking = useCallback(() => {
    setIsThinking(false);
    if (thinkingIntervalRef.current) {
      clearInterval(thinkingIntervalRef.current);
      thinkingIntervalRef.current = null;
    }
  }, []);

  const addUserMessage = useCallback((text: string) => {
    const message: Message = {
      id: generateUUID(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const addBotMessage = useCallback((text: string, sources?: Array<{ title: string; url: string }>) => {
    const message: Message = {
      id: generateUUID(),
      role: 'bot',
      text,
      sources,
      timestamp: new Date(),
      sessionId: sessionIdRef.current,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    addUserMessage(text);
    startThinking();
    const currentSessionId = sessionIdRef.current;
    try {
      const response = await apiSendMessage(text, conversationId);
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      if (response.conversation_id) {
        onConversationIdChange(response.conversation_id);
      }
      addBotMessage(response.answer, response.sources);
    } catch (error) {
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      addBotMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.');
      console.error('Chat error:', error);
    }
  }, [conversationId, onConversationIdChange, addUserMessage, addBotMessage, startThinking, stopThinking]);

  const clearMessages = useCallback(() => {
    sessionIdRef.current = generateUUID();
    setMessages([]);
  }, []);

  const restoreMessages = useCallback((historyItems: Array<{ role: string; text: string }>) => {
    const restored: Message[] = historyItems.map((item) => ({
      id: generateUUID(),
      role: item.role === 'user' ? 'user' : 'bot',
      text: item.text,
      timestamp: new Date(),
      sessionId: sessionIdRef.current,
    }));
    setMessages(restored);
  }, []);

  return {
    messages,
    isThinking,
    thinkingText,
    sendMessage,
    addBotMessage,
    clearMessages,
    restoreMessages,
  };
}
