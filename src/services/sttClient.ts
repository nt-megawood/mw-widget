export interface RealtimeSttHandlers {
  onReady?: () => void;
  onPartialText?: (text: string) => void;
  onTranscribed?: (text: string) => void;
  onAnswerDelta?: (delta: string) => void;
  onDone?: (answer: string) => void;
  onFinalText?: (text: string) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
  onInitializing?: (message: string) => void;
}

interface ServerEvent {
  type?: string;
  text?: string;
  delta?: string;
  answer?: string;
  message?: string;
}

export class RealtimeSttClient {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private readonly handlers: RealtimeSttHandlers;

  constructor(url: string, handlers: RealtimeSttHandlers = {}) {
    this.url = url;
    this.handlers = handlers;
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    const ws = new WebSocket(this.url);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;

    ws.onopen = () => {
      console.log('[STT WebSocket] Connected and open');
    };

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        console.log(`[STT WebSocket] Received binary data: ${event.data?.byteLength || 0} bytes`);
        return;
      }
      let payload: ServerEvent;
      try {
        payload = JSON.parse(event.data) as ServerEvent;
      } catch (e) {
        console.warn(`[STT WebSocket] Failed to parse message: ${event.data}`);
        return;
      }

      console.log(`[STT WebSocket] Received event type: ${payload.type}`);

      if (payload.type === 'ready') {
        console.log('[STT WebSocket] Server ready');
        this.handlers.onReady?.();
      }
      else if (payload.type === 'initializing') {
        console.log(`[STT WebSocket] Server initializing: ${payload.message}`);
        this.handlers.onInitializing?.(String(payload.message || 'Initializing...'));
      }
      else if (payload.type === 'partial') {
        console.log(`[STT WebSocket] Partial: "${payload.text}"`);
        this.handlers.onPartialText?.(String(payload.text || ''));
      }
      else if (payload.type === 'transcribed') {
        console.log(`[STT WebSocket] Transcribed: "${payload.text}"`);
        this.handlers.onTranscribed?.(String(payload.text || ''));
      }
      else if (payload.type === 'answer_delta') {
        this.handlers.onAnswerDelta?.(String(payload.delta || ''));
      }
      else if (payload.type === 'done') {
        console.log(`[STT WebSocket] Done with answer: "${payload.answer}"`);
        this.handlers.onDone?.(String(payload.answer || ''));
      }
      else if (payload.type === 'final') {
        console.log(`[STT WebSocket] Final: "${payload.text}"`);
        this.handlers.onFinalText?.(String(payload.text || ''));
      }
      else if (payload.type === 'error') {
        console.error(`[STT WebSocket] Error: ${payload.message}`);
        this.handlers.onError?.(String(payload.message || 'Unbekannter STT-Fehler'));
      }
      else {
        console.debug(`[STT WebSocket] Unknown event type: ${payload.type}`);
      }
    };

    ws.onerror = (event) => {
      console.error('[STT WebSocket] Error:', event);
      this.handlers.onError?.('WebSocket-Verbindung fehlgeschlagen.');
    };
    ws.onclose = () => {
      console.log('[STT WebSocket] Closed');
      this.ws = null;
      this.handlers.onClose?.();
    };
  }

  sendAudioChunk(data: ArrayBuffer | Uint8Array): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    if (data instanceof Uint8Array) {
      this.ws.send(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
      return;
    }
    this.ws.send(data);
  }

  isReady(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'ping' }));
  }

  /** Sends the desired transcription language to the backend. */
  setLanguage(lang: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'set_language', language: lang }));
  }

  /** Sends close signal but keeps WebSocket alive to receive final transcription. */
  sendEndOfAudio(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'close' }));
  }

  /** Forcefully closes the WebSocket immediately (for cleanup/abort). */
  disconnect(): void {
    if (!this.ws) return;
    this.ws.onclose = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    try { this.ws.close(); } catch {}
    this.ws = null;
  }
}
