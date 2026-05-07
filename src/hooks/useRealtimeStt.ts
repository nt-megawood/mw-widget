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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const client = new RealtimeSttClient(toSttWsUrl(), {
        onReady: () => setStatusText('Sprich jetzt…'),
        onPartialText: (text) => setPartialText(text),
        onFinalText: (text) => {
          setFinalText(text);
          setPartialText('');
        },
        onError: (message) => setStatusText(`Fehler: ${message}`),
        onClose: () => setStatusText('Verbindung geschlossen.'),
      });
      client.connect();
      clientRef.current = client;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const ch = e.inputBuffer.getChannelData(0);
        client.sendAudioChunk(floatToPcm16(ch));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsActive(true);
    } catch {
      setStatusText('STT konnte nicht gestartet werden.');
      stop();
    }
  }, [isActive, stop]);

  useEffect(() => () => stop(), [stop]);

  return { isActive, partialText, finalText, statusText, start, stop, clearFinal: () => setFinalText('') };
}
