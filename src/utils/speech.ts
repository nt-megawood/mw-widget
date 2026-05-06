interface SpeakTextOptions {
  onEnd?: () => void;
}

export function speakText(text: string, options?: SpeakTextOptions): void {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  if (options?.onEnd) {
    utterance.onend = () => {
      options.onEnd?.();
    };
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
