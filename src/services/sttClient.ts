export interface RealtimeSttHandlers {
  onReady?: () => void;
  onPartialText?: (text: string) => void;
  onFinalText?: (text: string) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

interface ServerEvent {
  type?: string;
  text?: string;
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

    ws.onmessage = (event) => {
      if (typeof event.data !== 'string') return;
      let payload: ServerEvent;
      try {
        payload = JSON.parse(event.data) as ServerEvent;
      } catch {
        return;
      }

      if (payload.type === 'ready') this.handlers.onReady?.();
      else if (payload.type === 'partial') this.handlers.onPartialText?.(String(payload.text || ''));
      else if (payload.type === 'final') this.handlers.onFinalText?.(String(payload.text || ''));
      else if (payload.type === 'error') this.handlers.onError?.(String(payload.message || 'Unbekannter STT-Fehler'));
    };

    ws.onerror = () => this.handlers.onError?.('WebSocket-Verbindung fehlgeschlagen.');
    ws.onclose = () => {
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

  sendPing(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ type: 'ping' }));
  }

  close(): void {
    if (!this.ws) return;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'close' }));
    }
    this.ws.close();
    this.ws = null;
  }
}
