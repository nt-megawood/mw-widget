import { useState, useEffect } from 'react';

const TEASER_DELAY_MS = 10_000;

export function useTeaser(enabled: boolean, isChatOpen: boolean) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      if (!isChatOpen) {
        setIsVisible(true);
      }
    }, TEASER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, isChatOpen]);

  const dismiss = () => setIsVisible(false);

  return { isVisible, dismiss };
}
