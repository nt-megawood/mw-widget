import { useState, useCallback } from 'react';
import { generateUUID } from '../utils/uuid';

const STORAGE_KEY = 'mw_conversation_id';

export function useConversation(widgetId: string) {
  const storageKey = `${STORAGE_KEY}_${widgetId}`;

  const [conversationId, setConversationId] = useState<string | null>(() => {
    return localStorage.getItem(storageKey);
  });

  const saveConversationId = useCallback((id: string) => {
    localStorage.setItem(storageKey, id);
    setConversationId(id);
  }, [storageKey]);

  const clearConversation = useCallback(() => {
    localStorage.removeItem(storageKey);
    setConversationId(null);
  }, [storageKey]);

  const getOrCreateConversationId = useCallback((): string => {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;
    const newId = generateUUID();
    localStorage.setItem(storageKey, newId);
    setConversationId(newId);
    return newId;
  }, [storageKey]);

  return { conversationId, saveConversationId, clearConversation, getOrCreateConversationId };
}
