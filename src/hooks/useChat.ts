import { useState, useCallback, useRef, useEffect } from 'react';
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

/** Extract a terrace planning code (e.g. mgw148964) from a bot response. */
export function extractPlanningCode(text: string): string | null {
  const source = String(text || '');
  const labeled = source.match(
    /(?:planungscode|terrassencode|code)\s*(?:ist|:)?\s*[:–-]?\s*([a-z0-9_]{6,})/i
  );
  if (labeled?.[1]) return labeled[1].trim();
  const fallback = source.match(/\b(mgw[a-z0-9]{4,}|_temp[a-z0-9]{4,})\b/i);
  return fallback?.[1] ? fallback[1].trim() : null;
}

interface UseChatOptions {
  conversationId: string | null;
  onConversationIdChange: (id: string) => void;
  onPlanningCodeDetected?: (code: string) => void;
}

export function useChat({
  conversationId,
  onConversationIdChange,
  onPlanningCodeDetected,
}: UseChatOptions) {
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

  const addBotMessage = useCallback((text: string, sources?: string[]) => {
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

  const onPlanningCodeDetectedRef = useRef(onPlanningCodeDetected);
  useEffect(() => {
    onPlanningCodeDetectedRef.current = onPlanningCodeDetected;
  }, [onPlanningCodeDetected]);

  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const sendMessage = useCallback(async (text: string) => {
    addUserMessage(text);
    startThinking();
    const currentSessionId = sessionIdRef.current;
    const currentConversationId = conversationIdRef.current;
    try {
      const response = await apiSendMessage(text, currentConversationId);
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      if (response.conversation_id) {
        onConversationIdChange(response.conversation_id);
      }
      addBotMessage(response.answer, response.sources);
      const code = extractPlanningCode(response.answer);
      if (code) onPlanningCodeDetectedRef.current?.(code);
    } catch (error) {
      if (currentSessionId !== sessionIdRef.current) return;
      stopThinking();
      addBotMessage('Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.');
      console.error('Chat error:', error);
    }
  }, [onConversationIdChange, addUserMessage, addBotMessage, startThinking, stopThinking]);

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
