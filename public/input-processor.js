/**
 * InputProcessor - AudioWorklet for Gemini Live API audio streaming
 *
 * Captures microphone audio, converts to 16-bit PCM mono at 16kHz,
 * buffers for smooth chunking, and sends to main thread via port.postMessage()
 *
 * Usage in main thread:
 *   const audioContext = new AudioContext({ sampleRate: 16000 });
 *   await audioContext.audioWorklet.addModule('input-processor.js');
 *   const processor = new AudioWorkletNode(audioContext, 'InputProcessor');
 */

class InputProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);

    // Configuration
    this.TARGET_CHUNK_SIZE = 2000; // samples (125ms @ 16kHz)
    this.EXPECTED_SAMPLE_RATE = 16000;

    // Buffer for accumulating samples
    this.sampleBuffer = new Float32Array(this.TARGET_CHUNK_SIZE);
    this.bufferIndex = 0;

    // State tracking
    this.sampleRateWarningLogged = false;

    // Port for communication with main thread
    this.port.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  /**
   * Handle messages from main thread
   * Allows control commands (pause, resume, etc.)
   */
  handleMessage(data) {
    if (data.type === 'flush') {
      // Flush remaining samples if any
      this.flushBuffer();
    }
  }

  /**
   * Main processing method called for each audio frame
   * Browser calls this with ~128 samples per frame
   */
  process(inputs, outputs, parameters) {
    // inputs[0] = input bus (microphone/source)
    // inputs[0][0] = left channel (or mono)
    // inputs[0][1] = right channel (if stereo)

    const input = inputs[0];
    if (!input || input.length === 0) {
      return true; // Continue processing
    }

    // Log sample rate mismatch warning (once)
    if (
      !this.sampleRateWarningLogged &&
      this.sampleRate !== this.EXPECTED_SAMPLE_RATE
    ) {
      this.port.postMessage({
        type: 'warning',
        message: `Sample rate mismatch: expected ${this.EXPECTED_SAMPLE_RATE}Hz, got ${this.sampleRate}Hz`,
      });
      this.sampleRateWarningLogged = true;
    }

    // Convert input to mono
    const monoSamples = this.convertToMono(input);

    // Accumulate samples into buffer
    for (let i = 0; i < monoSamples.length; i++) {
      this.sampleBuffer[this.bufferIndex++] = monoSamples[i];

      // When buffer reaches target size, send chunk
      if (this.bufferIndex >= this.TARGET_CHUNK_SIZE) {
        this.sendChunk();
        this.bufferIndex = 0;
      }
    }

    // Return true to keep processing, false to stop
    return true;
  }

  /**
   * Convert stereo input to mono by averaging channels
   * If input is already mono, pass through directly
   *
   * @param {Float32Array[]} input - Array of channel Float32Arrays
   * @returns {Float32Array} - Mono samples
   */
  convertToMono(input) {
    if (input.length === 1) {
      // Already mono
      return input[0];
    }

    if (input.length >= 2) {
      // Stereo: average left and right channels
      const left = input[0];
      const right = input[1];
      const mono = new Float32Array(left.length);

      for (let i = 0; i < left.length; i++) {
        mono[i] = (left[i] + right[i]) / 2;
      }

      return mono;
    }

    // Fallback (shouldn't happen)
    return new Float32Array(0);
  }

  /**
   * Convert Float32 audio samples to PCM 16-bit signed integers
   * Float32 range: -1.0 to 1.0
   * PCM 16-bit range: -32768 to 32767
   *
   * @param {Float32Array} float32Array - Normalized audio samples
   * @returns {Uint8Array} - PCM 16-bit samples packed as bytes
   */
  floatTo16BitPCM(float32Array) {
    // 2 bytes per sample (16-bit = 2 bytes)
    const pcm16 = new Int16Array(float32Array.length);

    // Convert each sample
    for (let i = 0; i < float32Array.length; i++) {
      const sample = float32Array[i];

      // Clamp to valid range
      const clamped = Math.max(-1, Math.min(1, sample));

      // Scale to 16-bit range
      pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }

    // Pack Int16Array as Uint8Array (little-endian)
    return new Uint8Array(pcm16.buffer);
  }

  /**
   * Send accumulated buffer as a chunk to main thread
   * Emits complete 2000-sample (125ms @ 16kHz) chunks
   */
  sendChunk() {
    // Convert buffer to PCM 16-bit
    const pcmData = this.floatTo16BitPCM(this.sampleBuffer);

    // Send message with audio data and metadata
    this.port.postMessage(
      {
        type: 'audio',
        data: pcmData,
        sampleRate: this.sampleRate, // Actual context sample rate
        targetSampleRate: this.EXPECTED_SAMPLE_RATE, // Expected 16kHz
        timestamp: Date.now(),
        samplesCount: this.TARGET_CHUNK_SIZE,
      },
      [pcmData.buffer] // Transfer ownership for efficiency
    );
  }

  /**
   * Flush remaining samples in buffer
   * Called when stream ends or on explicit 'flush' message
   */
  flushBuffer() {
    if (this.bufferIndex > 0) {
      // Send partial chunk
      const partialBuffer = this.sampleBuffer.slice(0, this.bufferIndex);
      const pcmData = this.floatTo16BitPCM(partialBuffer);

      this.port.postMessage({
        type: 'audio',
        data: pcmData,
        sampleRate: this.sampleRate,
        targetSampleRate: this.EXPECTED_SAMPLE_RATE,
        timestamp: Date.now(),
        samplesCount: this.bufferIndex,
        isFinalChunk: true,
      });

      this.bufferIndex = 0;
    }
  }
}

// Register worklet processor with name "InputProcessor"
// This name is required when calling:
// audioContext.audioWorklet.addModule('input-processor.js')
// new AudioWorkletNode(audioContext, 'InputProcessor')
registerProcessor('InputProcessor', InputProcessor);
