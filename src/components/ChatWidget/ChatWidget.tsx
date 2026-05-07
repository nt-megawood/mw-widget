import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatHeader } from '../ChatHeader';
import { ChatBody } from '../ChatBody';
import type { QuickReply } from '../ChatBody';
import { ChatFooter } from '../ChatFooter';
import { ChatTeaser } from '../ChatTeaser';
import { ChatToggle } from '../ChatToggle';
import { LoginModal } from '../LoginModal';
import { useChat } from '../../hooks/useChat';
import { useConversation } from '../../hooks/useConversation';
import { useTeaser } from '../../hooks/useTeaser';
import { usePresence } from '../../hooks/usePresence';
//import { useWidgetToken } from '../../hooks/useWidgetToken';
import { getConversation, deleteConversation, getLiveWebSocketUrl } from '../../services/api';
import type { WidgetConfig, ConversationHistoryItem } from '../../types';
import { getDefaultPromptPack, getPromptPack } from '../../config/promptPacks';
import { speakText, stopSpeaking } from '../../utils/speech';
import { getAuthData } from '../../hooks/useAuth';
import type { WidgetLanguage } from '../../config/i18n';
import { UI_COPY } from '../../config/i18n';

const BASE_URL = import.meta.env.BASE_URL;

interface ChatWidgetProps {
  config: WidgetConfig;
  widgetId: string;
  onPlanningCodeDetected?: (code: string) => void;
  children?: React.ReactNode;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseSampleRate(mimeType?: string): number {
  const source = String(mimeType || '');
  const match = source.match(/rate=(\d+)/i);
  const parsed = match ? Number(match[1]) : 24000;
  if (!Number.isFinite(parsed) || parsed <= 0) return 24000;
  return parsed;
}

function pcm16BytesToFloat32(bytes: Uint8Array): Float32Array {
  const sampleCount = Math.floor(bytes.length / 2);
  const out = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i += 1) {
    const lo = bytes[i * 2];
    const hi = bytes[i * 2 + 1];
    let sample = (hi << 8) | lo;
    if (sample & 0x8000) sample = sample - 0x10000;
    out[i] = sample / 0x8000;
  }
  return out;
}

/*function mixAudioBufferToMono(inputBuffer: AudioBuffer): Float32Array {
  const channelCount = Math.max(1, inputBuffer.numberOfChannels || 1);
  const length = inputBuffer.length;
  const mono = new Float32Array(length);

  if (channelCount === 1) {
    mono.set(inputBuffer.getChannelData(0));
    return mono;
  }

  for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
    const channelData = inputBuffer.getChannelData(channelIndex);
    for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
      mono[sampleIndex] += channelData[sampleIndex] / channelCount;
    }
  }

  return mono;
}*/

/*function int16ArrayToLittleEndianBytes(samples: Int16Array): Uint8Array {
  const bytes = new Uint8Array(samples.length * 2);
  const view = new DataView(bytes.buffer);

  for (let i = 0; i < samples.length; i += 1) {
    view.setInt16(i * 2, samples[i], true);
  }

  return bytes;
}*/

// Convert Uint8Array to base64 string for WebSocket transmission
function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i += 1) {
    binary += String.fromCharCode(data[i]);
  }
  return window.btoa(binary);
}

/*function downsampleTo16k(input: Float32Array, sourceSampleRate: number): Int16Array {
  if (sourceSampleRate <= 16000) {
    const direct = new Int16Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      const s = Math.max(-1, Math.min(1, input[i]));
      direct[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return direct;
  }

  const ratio = sourceSampleRate / 16000;
  const outLength = Math.max(1, Math.round(input.length / ratio));
  const out = new Int16Array(outLength);
  let offset = 0;
  for (let i = 0; i < outLength; i += 1) {
    const nextOffset = Math.min(input.length, Math.round((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = offset; j < nextOffset; j += 1) {
      sum += input[j];
      count += 1;
    }
    const avg = count > 0 ? sum / count : 0;
    const clamped = Math.max(-1, Math.min(1, avg));
    out[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    offset = nextOffset;
  }
  return out;
}*/

interface LiveServerEvent {
  type?: string;
  text?: string;
  audio?: string;
  mime_type?: string;
  message?: string;
  thought?: boolean;
}

interface MinimalSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function InitialGreeting({ mode, language }: { mode: 'classic' | 'landscape'; language: WidgetLanguage }) {
  const copy = UI_COPY[language];
  //const time = new Date().toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const auth = getAuthData();
  const userName = auth?.user?.name ? ` Hallo ${auth.user.name}!` : '';

  return (
    <div className="message-wrapper bot initial">
      <div className="bot-icon"><img src={`${BASE_URL}woody.png`} alt="Woody" /></div>
      <div className="bot-bubble-col">
        <div className="bubble">
          <p>{userName} {copy.greetingWelcome}</p>
          {mode === 'landscape' ? (
            <>
              <p>{copy.greetingLandscapeLine1}</p>
              <p>{copy.greetingLandscapeLine2}</p>
            </>
          ) : (
            <>
              <p>{copy.greetingClassicLine1}</p>
              <p>{copy.greetingClassicLine2}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config, widgetId, onPlanningCodeDetected, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [language, setLanguage] = useState<WidgetLanguage>('de');
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState<string | null>(null);
  const { conversationId, saveConversationId, clearConversation } = useConversation(widgetId);
  const {
    messages,
    activeQuickReplies,
    activeInputRequest,
    entryContext,
    isEntryComplete,
    isThinking,
    thinkingText,
    sendMessage,
    handleQuickReply,
    addUserMessage,
    addBotMessage,
    clearMessages,
    restoreMessages,
    cancelResponseGeneration,
  } =
    useChat({
      widgetId,
      conversationId,
      onConversationIdChange: saveConversationId,
      onPlanningCodeDetected,
      pageContext: config.pageContext,
      widgetVariant: config.mode,
    });
  const { isVisible: isTeaserVisible, dismiss: dismissTeaser } = useTeaser(
    config.teaser.show,
    isOpen
  );

  const liveSocketRef = useRef<WebSocket | null>(null);
  const liveMicStreamRef = useRef<MediaStream | null>(null);
  const liveInputCtxRef = useRef<AudioContext | null>(null);
  const liveInputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  // AudioWorkletNode replaces deprecated ScriptProcessorNode for smooth continuous audio chunking
  const liveWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const liveInputGainRef = useRef<GainNode | null>(null);
  const liveOutputCtxRef = useRef<AudioContext | null>(null);
  const liveOutputNextStartRef = useRef(0);
  const liveTurnTextRef = useRef('');
  const liveTurnHadAudioRef = useRef(false);
  const liveUserMessageAddedRef = useRef(false);
  const liveUserTextRef = useRef('');
  const liveIntentionalStopRef = useRef(false);
  const liveTransportRef = useRef<'websocket' | 'browser-stt' | null>(null);
  const speechRecognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  const liveWsOpenTimeoutRef = useRef<number | null>(null);
  const liveWsOpenedRef = useRef(false);
  const lastAutoSpokenBotMessageIdRef = useRef<string | null>(null);

  const restartBrowserSpeechRecognition = useCallback(() => {
    if (liveIntentionalStopRef.current) return;
    if (liveTransportRef.current !== 'browser-stt') return;

    const recognition = speechRecognitionRef.current;
    if (!recognition) return;

    try {
      recognition.start();
    } catch {
      // Ignore browsers that already restarted the recognizer internally.
    }
  }, []);

  const [browserSttPrefill, setBrowserSttPrefill] = useState('');

  const handleNewMessages = useCallback(
    (newMessages: ConversationHistoryItem[]) => {
      newMessages.forEach((msg) => {
        if (msg.role === 'assistant') {
          addBotMessage(msg.text);
        }
      });
    },
    [addBotMessage]
  );

  usePresence({
    conversationId,
    historyCount: messages.length,
    onNewMessages: handleNewMessages,
  });

  // Initialize widget token on mount
  //const { token: widgetToken, loading: tokenLoading, error: tokenError } = useWidgetToken();

  // Restore conversation history on mount only. We intentionally omit conversationId
  // and restoreMessages from the dependency array — this effect should run exactly
  // once so we replay persisted history without re-fetching on every re-render.
  const conversationIdRef = useRef(conversationId);
  const restoreMessagesRef = useRef(restoreMessages);
  useEffect(() => {
    const id = conversationIdRef.current;
    if (!id) return;
    getConversation(id)
      .then((data) => {
        if (data.history?.length > 0) {
          restoreMessagesRef.current(data.history);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    dismissTeaser();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsLoginOpen(false);
  };

  const handleOpenLogin = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  const stopLiveMode = useCallback((silent = false) => {
    liveIntentionalStopRef.current = true;

    if (liveWsOpenTimeoutRef.current != null) {
      window.clearTimeout(liveWsOpenTimeoutRef.current);
      liveWsOpenTimeoutRef.current = null;
    }
    liveWsOpenedRef.current = false;

    const ws = liveSocketRef.current;
    liveSocketRef.current = null;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      ws.close();
    }

    const recognition = speechRecognitionRef.current;
    speechRecognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    }

    // Clean up AudioWorkletNode and related audio infrastructure
    if (liveWorkletNodeRef.current) {
      try {
        liveWorkletNodeRef.current.disconnect();
        // Close the worklet port and send final flush message
        try {
          liveWorkletNodeRef.current.port.postMessage({ type: 'flush' });
          liveWorkletNodeRef.current.port.close();
        } catch {}
      } catch {}
      liveWorkletNodeRef.current = null;
    }
    if (liveInputGainRef.current) {
      try { liveInputGainRef.current.disconnect(); } catch {}
      liveInputGainRef.current = null;
    }
    if (liveInputSourceRef.current) {
      liveInputSourceRef.current.disconnect();
      liveInputSourceRef.current = null;
    }
    if (liveInputCtxRef.current) {
      liveInputCtxRef.current.close().catch(() => {});
      liveInputCtxRef.current = null;
    }

    if (liveMicStreamRef.current) {
      liveMicStreamRef.current.getTracks().forEach((track) => track.stop());
      liveMicStreamRef.current = null;
    }

    if (liveOutputCtxRef.current) {
      liveOutputCtxRef.current.close().catch(() => {});
      liveOutputCtxRef.current = null;
    }

    liveOutputNextStartRef.current = 0;
    liveTurnTextRef.current = '';
    liveTurnHadAudioRef.current = false;
    liveUserMessageAddedRef.current = false;
    liveUserTextRef.current = '';
    liveTransportRef.current = null;
    setIsLiveMode(false);
    setIsLiveConnecting(false);
    setLiveStatusText(null);

    if (!silent) {
      addBotMessage('Live-Chat wurde beendet. Du kannst wie gewohnt weiterschreiben.');
    }
  }, [addBotMessage]);

  const enqueueOutputAudio = useCallback(async (audioBase64: string, mimeType?: string) => {
    if (!audioBase64) return;
    const bytes = base64ToBytes(audioBase64);
    const pcm = pcm16BytesToFloat32(bytes);
    if (!pcm.length) return;

    if (!liveOutputCtxRef.current) {
      liveOutputCtxRef.current = new AudioContext();
      liveOutputNextStartRef.current = liveOutputCtxRef.current.currentTime;
    }

    const outputCtx = liveOutputCtxRef.current;
    const sampleRate = parseSampleRate(mimeType);
    const buffer = outputCtx.createBuffer(1, pcm.length, sampleRate);
    buffer.getChannelData(0).set(pcm);

    const source = outputCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outputCtx.destination);

    // If we are using browser STT fallback, stop the recognition while we play
    // audio to avoid the playback being picked up as user input. Restart
    // recognition when playback finishes.
    try {
      if (liveTransportRef.current === 'browser-stt') {
        const recognition = speechRecognitionRef.current;
        if (recognition) {
          try { recognition.onend = null; } catch {}
          try { recognition.stop(); } catch {}
        }
      }
    } catch {}

    const startAt = Math.max(outputCtx.currentTime, liveOutputNextStartRef.current);
    source.start(startAt);
    source.onended = () => {
      liveOutputNextStartRef.current = Math.max(liveOutputNextStartRef.current, outputCtx.currentTime);
      liveTurnHadAudioRef.current = false;
      if (liveTransportRef.current === 'browser-stt') {
        try {
          restartBrowserSpeechRecognition();
        } catch {}
      }
    };

    liveOutputNextStartRef.current = startAt + buffer.duration;
    liveTurnHadAudioRef.current = true;
  }, []);

  const startBrowserSpeechFallback = useCallback(() => {
    const RecognitionCtor = (window as unknown as {
      SpeechRecognition?: new () => MinimalSpeechRecognition;
      webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
    }).SpeechRecognition
      || (window as unknown as {
        SpeechRecognition?: new () => MinimalSpeechRecognition;
        webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
      }).webkitSpeechRecognition;

    if (!RecognitionCtor) {
      addBotMessage('Live-Chat ist in diesem Browser nicht verfügbar. Bitte nutze den normalen Textchat.');
      stopLiveMode(true);
      return;
    }

    const recognition = new RecognitionCtor();
    speechRecognitionRef.current = recognition;
    liveTransportRef.current = 'browser-stt';
    setIsLiveMode(true);
    setIsLiveConnecting(false);
    setLiveStatusText('Live aktiv (Browser-Spracheingabe). Sprich einfach los.');

    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = String(result?.[0]?.transcript || '').trim();
        if (!transcript) continue;
        stopSpeaking();
        // Fill the input for the user to review/edit before sending
        setBrowserSttPrefill(transcript);
        setLiveStatusText(`Erkannt: "${transcript}" — bitte prüfen und senden.`);
      }
    };

    recognition.onerror = () => {
      if (liveIntentionalStopRef.current) return;
      addBotMessage('Spracherkennung ist fehlgeschlagen. Du bist wieder im normalen Textmodus.');
      stopLiveMode(true);
    };

    recognition.onend = () => {
      if (liveIntentionalStopRef.current) return;
      if (liveTransportRef.current !== 'browser-stt') return;
      restartBrowserSpeechRecognition();
    };

    try {
      recognition.start();
      addBotMessage('Live-Chat läuft jetzt mit Browser-Spracherkennung, da die Live-WebSocket-Verbindung nicht verfügbar ist.');
    } catch {
      addBotMessage('Spracherkennung konnte nicht gestartet werden. Bitte nutze den normalen Textchat.');
      stopLiveMode(true);
    }
  }, [addBotMessage, restartBrowserSpeechRecognition, sendMessage, stopLiveMode]);

  const startLiveMode = useCallback(async () => {
    if (isLiveMode || isLiveConnecting) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      addBotMessage('Live-Chat wird von diesem Browser nicht unterstützt. Bitte nutze den normalen Textchat.');
      return;
    }

    setIsLiveConnecting(true);
    setLiveStatusText('Bitte Mikrofon im Browser freigeben...');
    liveIntentionalStopRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveMicStreamRef.current = stream;
      setLiveStatusText('Verbinde Live-Stream...');

      const ws = new WebSocket(getLiveWebSocketUrl());
      liveSocketRef.current = ws;

      const activateBrowserFallback = () => {
        if (liveIntentionalStopRef.current) return;
        if (liveTransportRef.current === 'browser-stt') return;

        if (liveWsOpenTimeoutRef.current != null) {
          window.clearTimeout(liveWsOpenTimeoutRef.current);
          liveWsOpenTimeoutRef.current = null;
        }

        if (liveSocketRef.current) {
          try {
            liveSocketRef.current.close();
          } catch {
            // Ignore close race conditions.
          }
          liveSocketRef.current = null;
        }

        // Clean up AudioWorkletNode instead of deprecated ScriptProcessorNode
        if (liveWorkletNodeRef.current) {
          try {
            liveWorkletNodeRef.current.disconnect();
            try {
              liveWorkletNodeRef.current.port.postMessage({ type: 'flush' });
              liveWorkletNodeRef.current.port.close();
            } catch {}
          } catch {}
          liveWorkletNodeRef.current = null;
        }
        if (liveInputSourceRef.current) {
          liveInputSourceRef.current.disconnect();
          liveInputSourceRef.current = null;
        }
        if (liveInputCtxRef.current) {
          liveInputCtxRef.current.close().catch(() => {});
          liveInputCtxRef.current = null;
        }

        if (liveMicStreamRef.current) {
          liveMicStreamRef.current.getTracks().forEach((track) => track.stop());
          liveMicStreamRef.current = null;
        }

        setIsLiveConnecting(false);
        startBrowserSpeechFallback();
      };

      liveWsOpenTimeoutRef.current = window.setTimeout(() => {
        if (!liveWsOpenedRef.current) {
          activateBrowserFallback();
        }
      }, 3000);

      ws.onopen = async () => {
        if (liveIntentionalStopRef.current) return;
        liveWsOpenedRef.current = true;
        if (liveWsOpenTimeoutRef.current != null) {
          window.clearTimeout(liveWsOpenTimeoutRef.current);
          liveWsOpenTimeoutRef.current = null;
        }
        liveTransportRef.current = 'websocket';
        setIsLiveMode(true);
        setIsLiveConnecting(false);
        setLiveStatusText(null);

        try {
          // Initialize 16kHz AudioContext for input capture
          // This ensures the worklet receives audio at the expected sample rate
          const inputCtx = new AudioContext({ sampleRate: 16000 });
          liveInputCtxRef.current = inputCtx;
          
          const sourceNode = inputCtx.createMediaStreamSource(stream);
          liveInputSourceRef.current = sourceNode;

          // Load the AudioWorklet module from public/input-processor.js
          // The worklet handles smooth continuous chunking at 125ms intervals
          await inputCtx.audioWorklet.addModule(`${BASE_URL}input-processor.js`);
          const workletNode = new AudioWorkletNode(inputCtx, 'InputProcessor');
          liveWorkletNodeRef.current = workletNode;

          // Set up message handler to receive audio chunks from the worklet
          // Each message contains PCM 16-bit audio data ready to send via WebSocket
          workletNode.port.onmessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'audio' && message.data) {
              if (!liveSocketRef.current || liveSocketRef.current.readyState !== WebSocket.OPEN) {
                return;
              }
              // Send audio chunk immediately to WebSocket (worklet dictates pace at ~125ms)
              // No additional buffering or time-based intervals needed
              const audioBase64 = uint8ArrayToBase64(message.data);
              const payload = {
                type: 'input_audio',
                audio: audioBase64,
                sampleRate: message.targetSampleRate, // 16kHz expected
                samplesCount: message.samplesCount,
                timestamp: message.timestamp,
              };
              liveSocketRef.current.send(JSON.stringify(payload));
            } else if (message.type === 'warning') {
              console.warn('AudioWorklet warning:', message.message);
            }
          };

          // Connect microphone → worklet → muted gain node
          // This keeps the audio graph alive without audible playback (no echo/feedback)
          sourceNode.connect(workletNode);
          
          const silentGain = inputCtx.createGain();
          silentGain.gain.value = 0;
          liveInputGainRef.current = silentGain;
          workletNode.connect(silentGain);
          silentGain.connect(inputCtx.destination);
        } catch (err) {
          console.error('Failed to initialize AudioWorklet:', err);
          addBotMessage('AudioWorklet-Initialisierung fehlgeschlagen. Aktiviere Browser-Spracherkennung.');
          activateBrowserFallback();
        }
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        let payload: LiveServerEvent;
        try {
          payload = JSON.parse(event.data) as LiveServerEvent;
        } catch {
          return;
        }

        if (payload.type === 'input_transcription' && payload.text) {
          liveUserTextRef.current = payload.text;
          return;
        }

        if (payload.type === 'output_transcription' && payload.text) {
          if (payload.thought) return;
          liveTurnTextRef.current += `${payload.text}`;
          return;
        }

        if (payload.type === 'output_text' && payload.text) {
          if (payload.thought) return;
          liveTurnTextRef.current += `${payload.text}`;
          return;
        }

        if (payload.type === 'output_audio' && payload.audio) {
          enqueueOutputAudio(payload.audio, payload.mime_type).catch(() => {});
          return;
        }

        if (payload.type === 'turn_complete') {
          if (!liveUserMessageAddedRef.current) {
            const finalUserText = liveUserTextRef.current.trim();
            if (finalUserText) {
              addUserMessage(finalUserText);
            }
            liveUserMessageAddedRef.current = true;
          }
          const finalText = liveTurnTextRef.current.trim();
          if (finalText) {
            addBotMessage(finalText);
          }
          liveTurnTextRef.current = '';
          liveTurnHadAudioRef.current = false;
          liveUserMessageAddedRef.current = false;
          liveUserTextRef.current = '';
          return;
        }

        if (payload.type === 'error') {
          addBotMessage(payload.message || 'Live-Chat ist fehlgeschlagen. Bitte nutze den normalen Textchat.');
          stopLiveMode(true);
        }
      };

      ws.onerror = (event: Event) => {
        console.error('WebSocket error:', event);
        console.error('WebSocket URL:', getLiveWebSocketUrl());
        console.error('WebSocket ready state:', ws.readyState);
        if (!liveWsOpenedRef.current) {
          activateBrowserFallback();
          return;
        }
        addBotMessage('Live-Chat wurde unterbrochen. Du bist wieder im normalen Textmodus.');
        stopLiveMode(true);
      };

      ws.onclose = (event: CloseEvent) => {
        console.log('WebSocket closed:', { code: event.code, reason: event.reason });
        if (liveWsOpenTimeoutRef.current != null) {
          window.clearTimeout(liveWsOpenTimeoutRef.current);
          liveWsOpenTimeoutRef.current = null;
        }
        if (!liveIntentionalStopRef.current) {
          if (!liveWsOpenedRef.current) {
            activateBrowserFallback();
            return;
          }
          addBotMessage('Live-Chat wurde unterbrochen. Du bist wieder im normalen Textmodus.');
          stopLiveMode(true);
        }
      };
    } catch {
      setIsLiveConnecting(false);
      setIsLiveMode(false);
      setLiveStatusText(null);
      addBotMessage('Mikrofonfreigabe wurde abgelehnt. Du bist wieder im normalen Textmodus.');
    }
  }, [addBotMessage, enqueueOutputAudio, isLiveConnecting, isLiveMode, startBrowserSpeechFallback, stopLiveMode]);

  const toggleLiveMode = useCallback(() => {
    if (isLiveMode || isLiveConnecting) {
      stopLiveMode();
      return;
    }
    startLiveMode().catch(() => {
      addBotMessage('Live-Chat konnte nicht gestartet werden. Du kannst normal weiterschreiben.');
      stopLiveMode(true);
    });
  }, [addBotMessage, isLiveConnecting, isLiveMode, startLiveMode, stopLiveMode]);

  useEffect(() => {
    return () => {
      stopLiveMode(true);
    };
  }, [stopLiveMode]);

  useEffect(() => {
    if (!isLiveMode || liveTransportRef.current !== 'browser-stt') return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'bot') return;
    if (lastAutoSpokenBotMessageIdRef.current === lastMessage.id) return;
    lastAutoSpokenBotMessageIdRef.current = lastMessage.id;
    speakText(lastMessage.text, { onEnd: restartBrowserSpeechRecognition });
  }, [isLiveMode, messages, restartBrowserSpeechRecognition]);

  const handleRefresh = async () => {
    if (conversationId) {
      await deleteConversation(conversationId);
    }
    clearConversation();
    clearMessages();
  };

  const handleSend = (text: string) => sendMessage(text);
  const handleRespinLastAnswer = useCallback(() => {
    if (isThinking || messages.length < 2) return;

    const lastMessage = messages[messages.length - 1];
    const previousMessage = messages[messages.length - 2];

    if (lastMessage.role !== 'bot' || previousMessage.role !== 'user') return;

    sendMessage(previousMessage.text);
  }, [messages, isThinking, sendMessage]);
  const quickReplies: QuickReply[] = isEntryComplete && entryContext.audiencePath
    ? getPromptPack(config.pageContext, entryContext.audiencePath)
    : getDefaultPromptPack(config.pageContext);
  const posClass = `pos-${config.position}`;
  const copy = UI_COPY[language];
  const initialGreeting = <InitialGreeting mode={config.mode} language={language} />;

  return (
    <>
      {!isOpen && isTeaserVisible && (
        <ChatTeaser
          title={config.teaser.title}
          text={config.teaser.text}
          position={config.position}
          onClose={dismissTeaser}
          onOpen={handleOpen}
        />
      )}
      {!isOpen && <ChatToggle onClick={handleOpen} position={config.position} language={language} />}
      {isOpen && (
        <div className={`chat-container ${config.mode === 'landscape' ? 'landscape-widget' : ''} ${posClass}`}>
          {config.mode === 'landscape' ? (
            <div className="chat-layout">
              <div className="chat-main">
                <ChatHeader onRefresh={handleRefresh} onClose={handleClose} onLoginClick={handleOpenLogin} language={language} onLanguageChange={setLanguage} />
                <ChatBody
                  messages={messages}
                  isThinking={isThinking}
                  thinkingText={thinkingText}
                  initialGreeting={initialGreeting}
                  quickReplies={quickReplies}
                  contextualQuickReplies={activeQuickReplies}
                  inputRequest={activeInputRequest}
                  onQuickReply={handleQuickReply}
                  onSubmitInputRequest={handleSend}
                  conversationId={conversationId}
                  onRespinLastAnswer={handleRespinLastAnswer}
                  disableRespin={isThinking}
                />
                <ChatFooter
                  onSend={handleSend}
                  disabled={isThinking}
                  isGenerating={isThinking}
                  onCancelGeneration={cancelResponseGeneration}
                  placeholder={copy.inputPlaceholder}
                  language={language}
                  prefillInput={browserSttPrefill}
                />
              </div>
              {children}
            </div>
          ) : (
            <>
              <ChatHeader onRefresh={handleRefresh} onClose={handleClose} onLoginClick={handleOpenLogin} language={language} onLanguageChange={setLanguage} />
              <ChatBody
                messages={messages}
                isThinking={isThinking}
                thinkingText={thinkingText}
                initialGreeting={initialGreeting}
                quickReplies={quickReplies}
                contextualQuickReplies={activeQuickReplies}
                inputRequest={activeInputRequest}
                onQuickReply={handleQuickReply}
                onSubmitInputRequest={handleSend}
                conversationId={conversationId}
                onRespinLastAnswer={handleRespinLastAnswer}
                disableRespin={isThinking}
              />
              <ChatFooter
                onSend={handleSend}
                disabled={isThinking || isLiveMode || isLiveConnecting}
                isGenerating={isThinking}
                onCancelGeneration={cancelResponseGeneration}
                placeholder={
                  isLiveMode
                    ? language === 'de' ? 'Woody hört dir zu...' : 'Woody is listening...'
                    : copy.inputPlaceholder
                }
                showLiveButton
                isLiveMode={isLiveMode}
                onToggleLiveMode={toggleLiveMode}
                liveStatusText={liveStatusText}
                language={language}
                prefillInput={browserSttPrefill}
              />
            </>
          )}
        </div>
      )}
      {isOpen && isLoginOpen && <LoginModal onClose={handleCloseLogin} />}
    </>
  );
};
