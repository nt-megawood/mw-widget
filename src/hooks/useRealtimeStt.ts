import { useCallback, useEffect, useRef, useState } from 'react';
import { getBackendBaseUrl } from '../config/api';
import { RealtimeSttClient } from '../services/sttClient';

function toSttWsUrl(): string {
  const base = getBackendBaseUrl().replace(/\/$/, '');
  return `${base}/v1/stt/realtime`.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
}

function floatToPcm16(input: Float32Array): Uint8Array {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i += 1) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

export function useRealtimeStt() {
  const [isActive, setIsActive] = useState(false);
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [statusText, setStatusText] = useState<string | null>(null);

  const clientRef = useRef<RealtimeSttClient | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    clientRef.current?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    clientRef.current = null;

    setIsActive(false);
    setPartialText('');
    setStatusText(null);
  }, []);

  const start = useCallback(async () => {
    if (isActive) return;
    setStatusText('Mikrofon wird initialisiert…');

    try {
      const mediaDevices = typeof window !== 'undefined' ? window.navigator?.mediaDevices : undefined;
      if (!mediaDevices?.getUserMedia) {
        throw new Error('Mikrofonzugriff ist in diesem Browser-Kontext nicht verfügbar. Bitte HTTPS und Mikrofonfreigabe prüfen.');
      }

      const stream = await mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log('✓ Microphone stream acquired');

      const client = new RealtimeSttClient(toSttWsUrl(), {
        onInitializing: (msg) => {
          console.log(`[STT] Initializing: ${msg}`);
          setStatusText(msg);
        },
        onReady: () => {
          console.log('[STT] Ready - can start speaking');
          setStatusText('Sprich jetzt…');
        },
        onPartialText: (text) => {
          console.log(`[STT Partial] ${text}`);
          setPartialText(text);
        },
        onFinalText: (text) => {
          console.log(`[STT Final] ${text}`);
          setFinalText(text);
          setPartialText('');
        },
        onError: (message) => {
          console.error(`[STT Error] ${message}`);
          setStatusText(`Fehler: ${message}`);
        },
        onClose: () => {
          console.log('[STT] Connection closed');
          setStatusText('Verbindung geschlossen.');
        },
      });
      console.log(`[STT] Connecting to ${toSttWsUrl()}`);
      client.connect();
      clientRef.current = client;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      let audioChunkCount = 0;

      processor.onaudioprocess = (e) => {
        const ch = e.inputBuffer.getChannelData(0);
        const pcm16 = floatToPcm16(ch);
        audioChunkCount += 1;
        if (audioChunkCount % 10 === 0) {
          console.log(`[Audio] Chunk #${audioChunkCount}: ${pcm16.byteLength} bytes`);
        }
        client.sendAudioChunk(pcm16);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsActive(true);
      console.log('[STT] Audio processing started');
    } catch (err) {
      console.error('[STT Error] Failed to start:', err);
      setStatusText('STT konnte nicht gestartet werden.');
      stop();
    }
  }, [isActive, stop]);

  useEffect(() => () => stop(), [stop]);

  return { isActive, partialText, finalText, statusText, start, stop, clearFinal: () => setFinalText('') };
}
