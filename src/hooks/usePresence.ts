import { useEffect, useRef, useCallback } from 'react';
import { sendPresenceStatus } from '../services/api';
import type { ConversationHistoryItem } from '../types';

const PRESENCE_INTERVAL_MS = 60_000;

interface UsePresenceOptions {
  conversationId: string | null;
  historyCount: number;
  onNewMessages: (messages: ConversationHistoryItem[]) => void;
}

export function usePresence({ conversationId, historyCount, onNewMessages }: UsePresenceOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyCountRef = useRef(historyCount);
  historyCountRef.current = historyCount;

  const checkPresence = useCallback(async () => {
    if (!conversationId) return;
    try {
      const result = await sendPresenceStatus(conversationId, historyCountRef.current);
      if (result.new_messages?.length > 0) {
        onNewMessages(result.new_messages);
      }
    } catch (error) {
      console.error('Presence check failed:', error);
    }
  }, [conversationId, onNewMessages]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(checkPresence, PRESENCE_INTERVAL_MS);
  }, [checkPresence]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    startPolling();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPresence();
        startPolling();
      } else {
        stopPolling();
      }
    };
    const handleFocus = () => {
      checkPresence();
      startPolling();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [conversationId, checkPresence, startPolling, stopPolling]);
}
