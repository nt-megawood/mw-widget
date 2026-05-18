import { useCallback, useEffect, useRef, useState } from 'react';
import { getBackendBaseUrl } from '../config/api';
import { getAuthToken } from '../services/api';
import { RealtimeSttClient } from '../services/sttClient';

const SAMPLE_RATE = 16000;
const CHUNK_SAMPLES = 4096;
const NOISE_FLOOR_DECAY = 0.001;
const VOICE_THRESHOLD_MULTIPLIER = 2.5;
const SILENCE_THRESHOLD_MULTIPLIER = 1.8;
const MIN_ABSOLUTE_THRESHOLD = 0.015;
const SPEECH_ONSET_FRAMES = 3;
const SILENCE_FRAMES_LIMIT = 6;
const MAX_UTTERANCE_MS = 30000;
const RESPONSE_TIMEOUT_MS = 15000;
const COOLDOWN_MS = 2000;
const ABORT_SILENT_FRAMES = 3;
const MAX_PENDING_CHUNKS = 10;

export type VadState = 'idle' | 'listening' | 'recording' | 'processing';

function toSttWsUrl(token: string): string {
  const base = getBackendBaseUrl().replace(/\/$/, '');
  const url = `${base}/v1/stt/realtime`.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
  return `${url}?token=${encodeURIComponent(token)}`;
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

function computeRms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

function bufferChunk(pending: Uint8Array[], pcm16: Uint8Array, max: number): void {
  if (pending.length < max) {
    pending.push(pcm16);
  }
}

function flushBuffer(pending: Uint8Array[], sendFn: (chunk: Uint8Array) => void): void {
  for (const chunk of pending) {
    sendFn(chunk);
  }
  pending.length = 0;
}

interface UseRealtimeSttOptions {
  isStreaming?: boolean;
  language?: string;
}

export function useRealtimeStt(options: UseRealtimeSttOptions = {}) {
  const [vadState, setVadState] = useState<VadState>('idle');
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [statusText, setStatusText] = useState<string | null>(null);

  const clientRef = useRef<RealtimeSttClient | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const vadStateRef = useRef<VadState>('idle');
  const silenceFramesRef = useRef(0);
  const speechOnsetFramesRef = useRef(0);
  const utteranceStartRef = useRef(0);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCooldownRef = useRef(false);
  const noiseFloorRef = useRef(0.01);
  const hasConfirmedSpeechRef = useRef(false);
  const abortFramesRef = useRef(0);
  const pendingAudioRef = useRef<Uint8Array[]>([]);
  const answerTextRef = useRef('');
  const startListeningRef = useRef<() => void>(() => {});

  const updateVadState = useCallback((next: VadState) => {
    vadStateRef.current = next;
    setVadState(next);
    switch (next) {
      case 'listening':
        setStatusText('Höre zu…');
        setPartialText('');
        break;
      case 'recording':
        setStatusText('Aufnahme läuft…');
        break;
      case 'processing':
        setStatusText('Verarbeite Sprache…');
        break;
      default:
        break;
    }
  }, []);

  const cleanupConnection = useCallback(() => {
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  const startListening = useCallback(async () => {
    if (vadStateRef.current === 'idle') return;

    const token = await getAuthToken();
    answerTextRef.current = '';
    const client = new RealtimeSttClient(toSttWsUrl(token), {
      onInitializing: (msg) => {
        setStatusText(msg);
      },
      onReady: () => {
        if (vadStateRef.current === 'idle') {
          client.disconnect();
          return;
        }
        if (options.language) {
          client.setLanguage(options.language);
        }
        if (hasConfirmedSpeechRef.current) {
          flushBuffer(pendingAudioRef.current, (chunk) => client.sendAudioChunk(chunk));
        }
        utteranceStartRef.current = Date.now();
        silenceFramesRef.current = 0;
        abortFramesRef.current = 0;
        updateVadState('recording');
      },
      onPartialText: (text) => {
        setPartialText(text);
      },
      onTranscribed: (text) => {
        setTranscribedText(text);
      },
      onAnswerDelta: (delta) => {
        answerTextRef.current += delta;
        setPartialText(answerTextRef.current);
      },
      onDone: (answer: string) => {
        cleanupConnection();
        pendingAudioRef.current = [];
        answerTextRef.current = '';
        setFinalText(answer);
        setPartialText('');
        if (vadStateRef.current !== 'idle') {
          isCooldownRef.current = true;
          setTimeout(() => {
            isCooldownRef.current = false;
          }, COOLDOWN_MS);
          updateVadState('listening');
        }
      },
      onFinalText: (text) => {
        cleanupConnection();
        pendingAudioRef.current = [];
        setFinalText(text);
        setPartialText('');
        if (vadStateRef.current !== 'idle') {
          isCooldownRef.current = true;
          setTimeout(() => {
            isCooldownRef.current = false;
          }, COOLDOWN_MS);
          updateVadState('listening');
        }
      },
      onError: (message) => {
        cleanupConnection();
        pendingAudioRef.current = [];
        setStatusText(`Fehler: ${message}`);
        if (vadStateRef.current !== 'idle') {
          isCooldownRef.current = true;
          setTimeout(() => {
            isCooldownRef.current = false;
          }, COOLDOWN_MS);
          updateVadState('listening');
        }
      },
      onClose: () => {
        if (vadStateRef.current === 'processing') return;
        cleanupConnection();
      },
    });
    client.connect();
    clientRef.current = client;
  }, [cleanupConnection, updateVadState]);

  startListeningRef.current = startListening;

  const stop = useCallback(() => {
    cleanupConnection();
    pendingAudioRef.current = [];
    answerTextRef.current = '';
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    silenceFramesRef.current = 0;
    speechOnsetFramesRef.current = 0;
    utteranceStartRef.current = 0;
    isCooldownRef.current = false;
    noiseFloorRef.current = 0.01;
    hasConfirmedSpeechRef.current = false;
    abortFramesRef.current = 0;
    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
    }
    updateVadState('idle');
    setPartialText('');
    setStatusText(null);
    setFinalText('');
    setTranscribedText('');
  }, [cleanupConnection, updateVadState]);

  const start = useCallback(async () => {
    if (vadStateRef.current !== 'idle') return;

    setStatusText('Mikrofon wird initialisiert…');

    try {
      const mediaDevices = typeof window !== 'undefined' ? window.navigator?.mediaDevices : undefined;
      if (!mediaDevices?.getUserMedia) {
        throw new Error('Mikrofonzugriff ist in diesem Browser-Kontext nicht verfügbar.');
      }

      const stream = await mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      const processor = audioCtx.createScriptProcessor(CHUNK_SAMPLES, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const ch = e.inputBuffer.getChannelData(0);
        const rms = computeRms(ch);
        const state = vadStateRef.current;

        if (state === 'listening' || state === 'idle') {
          if (rms < noiseFloorRef.current) {
            noiseFloorRef.current = rms;
          } else {
            noiseFloorRef.current += (rms - noiseFloorRef.current) * NOISE_FLOOR_DECAY;
          }
        }

        const voiceThreshold = Math.max(noiseFloorRef.current * VOICE_THRESHOLD_MULTIPLIER, MIN_ABSOLUTE_THRESHOLD);
        const silenceThreshold = Math.max(noiseFloorRef.current * SILENCE_THRESHOLD_MULTIPLIER, MIN_ABSOLUTE_THRESHOLD * 0.8);

        if (state === 'listening') {
          if (isCooldownRef.current) return;
          if (options.isStreaming) {
            speechOnsetFramesRef.current = 0;
            return;
          }
          if (rms >= voiceThreshold) {
            speechOnsetFramesRef.current++;
            const pcm16 = floatToPcm16(ch);
            bufferChunk(pendingAudioRef.current, pcm16, MAX_PENDING_CHUNKS);
            if (speechOnsetFramesRef.current >= SPEECH_ONSET_FRAMES) {
              speechOnsetFramesRef.current = 0;
              hasConfirmedSpeechRef.current = false;
              updateVadState('recording');
              startListeningRef.current();
            }
          } else {
            speechOnsetFramesRef.current = 0;
          }
          return;
        }

        if (state === 'recording') {
          if (!hasConfirmedSpeechRef.current) {
            const pcm16 = floatToPcm16(ch);
            bufferChunk(pendingAudioRef.current, pcm16, MAX_PENDING_CHUNKS);
            if (rms >= voiceThreshold) {
              hasConfirmedSpeechRef.current = true;
              abortFramesRef.current = 0;
              if (clientRef.current?.isReady()) {
                flushBuffer(pendingAudioRef.current, (chunk) => clientRef.current!.sendAudioChunk(chunk));
              }
            } else {
              abortFramesRef.current++;
              if (abortFramesRef.current >= ABORT_SILENT_FRAMES) {
                pendingAudioRef.current = [];
                cleanupConnection();
                updateVadState('listening');
              }
            }
            return;
          }

          if (rms < silenceThreshold) {
            silenceFramesRef.current++;
            if (silenceFramesRef.current >= SILENCE_FRAMES_LIMIT) {
              if (clientRef.current) {
                clientRef.current.sendEndOfAudio();
                updateVadState('processing');
                responseTimerRef.current = setTimeout(() => {
                  cleanupConnection();
                  if (vadStateRef.current !== 'idle') {
                    isCooldownRef.current = true;
                    setTimeout(() => {
                      isCooldownRef.current = false;
                    }, COOLDOWN_MS);
                    updateVadState('listening');
                  }
                }, RESPONSE_TIMEOUT_MS);
              } else {
                cleanupConnection();
                updateVadState('listening');
              }
              return;
            }
          } else {
            silenceFramesRef.current = 0;
          }

          if (Date.now() - utteranceStartRef.current > MAX_UTTERANCE_MS) {
            if (clientRef.current) {
              clientRef.current.sendEndOfAudio();
              updateVadState('processing');
              responseTimerRef.current = setTimeout(() => {
                cleanupConnection();
                if (vadStateRef.current !== 'idle') {
                  isCooldownRef.current = true;
                  setTimeout(() => {
                    isCooldownRef.current = false;
                  }, COOLDOWN_MS);
                  updateVadState('listening');
                }
              }, RESPONSE_TIMEOUT_MS);
            } else {
              cleanupConnection();
              updateVadState('listening');
            }
            return;
          }

          if (clientRef.current?.isReady()) {
            clientRef.current.sendAudioChunk(floatToPcm16(ch));
          } else {
            bufferChunk(pendingAudioRef.current, floatToPcm16(ch), MAX_PENDING_CHUNKS);
          }
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      updateVadState('listening');
    } catch (err) {
      console.error('[STT Error] Failed to start:', err);
      setStatusText('STT konnte nicht gestartet werden.');
      stop();
    }
  }, [cleanupConnection, updateVadState, stop, options.isStreaming]);

  useEffect(() => () => stop(), [stop]);

  const clearTranscribed = useCallback(() => setTranscribedText(''), []);

  return { vadState, partialText, finalText, transcribedText, statusText, start, stop, clearFinal: () => setFinalText(''), clearTranscribed };
}
