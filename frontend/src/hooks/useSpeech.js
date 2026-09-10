import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Browser speech support detection. Evaluated once at module load.
 */
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

export const speechSupport = {
  recognition: Boolean(SpeechRecognitionAPI),
  synthesis: Boolean(synth),
};

/** Map a SpeechRecognition error code onto something a human can act on. */
function describeRecognitionError(code) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was blocked. Allow microphone permission in your browser's address bar, then try again.";
    case "no-speech":
      return "We didn't hear anything. Check that the right microphone is selected and speak a little louder.";
    case "audio-capture":
      return "No microphone was found. Connect a microphone and try again.";
    case "network":
      return "Speech recognition needs a network connection and it looks like yours dropped.";
    case "aborted":
      return null; // Expected when we stop it ourselves — not user-facing.
    default:
      return "Speech recognition stopped unexpectedly. You can type your answer instead.";
  }
}

/**
 * Wraps the Web Speech API (recognition + synthesis) with a lifecycle that
 * actually cleans up.
 *
 * Deliberate design decisions, each fixing a real bug in the original implementation:
 *  - Callbacks are read through refs, so recognition handlers never close over
 *    stale state (the classic "un-mute does nothing" bug).
 *  - Restart-after-silence is gated on an explicit `shouldListenRef` flag rather
 *    than on `onend` firing, so stopping can never race a restart into life and
 *    leave an orphaned recogniser holding the mic.
 *  - `onerror` surfaces a human-readable message instead of swallowing it, so a
 *    denied mic permission is visible rather than looking like a frozen UI.
 *  - Every timer is tracked and cleared on unmount, so nothing speaks or restarts
 *    after the component is gone.
 */
export function useSpeech({ lang = "en-US" } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [micError, setMicError] = useState(null);

  const recognitionRef = useRef(null);
  // True while the user wants to be recording. The single source of truth for
  // whether `onend` should restart the recogniser.
  const shouldListenRef = useRef(false);
  // Finalised text so far. Kept in a ref so auto-restarts don't lose it and so
  // the result handler never reads a stale value.
  const finalTranscriptRef = useRef("");
  const mountedRef = useRef(true);
  const timersRef = useRef(new Set());
  const speakEndCallbackRef = useRef(null);
  const utteranceRef = useRef(null);

  /** setTimeout that is automatically cancelled on unmount. */
  const safeTimeout = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      if (mountedRef.current) fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  // ---------------------------------------------------------------- recognition

  const buildRecognition = useCallback(() => {
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalChunk += text;
        else interim += text;
      }
      if (finalChunk) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalChunk}`
          .replace(/\s+/g, " ")
          .trim();
        if (mountedRef.current) setTranscript(finalTranscriptRef.current);
      }
      if (mountedRef.current) setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      const message = describeRecognitionError(event.error);
      // 'no-speech' is routine during a pause — keep listening, stay quiet.
      if (event.error === "no-speech") return;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldListenRef.current = false;
        if (mountedRef.current) setIsListening(false);
      }
      if (message && mountedRef.current) setMicError(message);
    };

    recognition.onend = () => {
      // Chrome ends the session after a few seconds of silence. Restart only if
      // the user still wants to be recording and we're still mounted.
      if (shouldListenRef.current && mountedRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // Already starting — the next onend will retry.
          return;
        }
      }
      if (mountedRef.current) {
        setIsListening(false);
        setInterimTranscript("");
      }
    };

    return recognition;
  }, [lang]);

  const startListening = useCallback(
    ({ reset = false } = {}) => {
      if (!speechSupport.recognition) {
        setMicError(
          "Your browser doesn't support speech recognition. Chrome or Edge work best — you can type your answer instead."
        );
        return false;
      }
      if (shouldListenRef.current) return true;

      setMicError(null);
      if (reset) {
        finalTranscriptRef.current = "";
        setTranscript("");
      }
      setInterimTranscript("");

      // Never record while the AI is talking, or the mic transcribes the AI.
      if (synth?.speaking) synth.cancel();

      if (!recognitionRef.current) {
        recognitionRef.current = buildRecognition();
      }

      shouldListenRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
        return true;
      } catch (err) {
        // InvalidStateError => already running, which is fine.
        if (err?.name === "InvalidStateError") {
          setIsListening(true);
          return true;
        }
        shouldListenRef.current = false;
        setIsListening(false);
        setMicError("Could not start the microphone. Check that no other tab is using it.");
        return false;
      }
    },
    [buildRecognition]
  );

  const stopListening = useCallback(() => {
    // Flip the flag *before* stopping so `onend` cannot restart it.
    shouldListenRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* not running — nothing to stop */
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  /** Replace the transcript, e.g. when the user edits it by hand. */
  const setTranscriptManually = useCallback((value) => {
    finalTranscriptRef.current = value ?? "";
    setTranscript(value ?? "");
  }, []);

  // ----------------------------------------------------------------- synthesis

  const cancelSpeech = useCallback(() => {
    speakEndCallbackRef.current = null;
    utteranceRef.current = null;
    try {
      synth?.cancel();
    } catch {
      /* no-op */
    }
    if (mountedRef.current) setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text, { onEnd, rate = 1, pitch = 1 } = {}) => {
      const content = (text || "").trim();
      if (!content) {
        onEnd?.();
        return;
      }
      if (!speechSupport.synthesis) {
        // No TTS: don't strand the caller waiting for an onEnd that never comes.
        onEnd?.();
        return;
      }

      // Cancel anything queued so questions never overlap.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = synth.getVoices() || [];
      const preferred =
        voices.find((v) => /Google (UK|US) English/i.test(v.name)) ||
        voices.find((v) => v.lang === lang && !/eSpeak/i.test(v.name)) ||
        voices.find((v) => v.lang?.startsWith("en"));
      if (preferred) utterance.voice = preferred;

      speakEndCallbackRef.current = onEnd || null;
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        if (mountedRef.current) setIsSpeaking(true);
      };
      const finish = () => {
        if (utteranceRef.current !== utterance) return; // superseded
        utteranceRef.current = null;
        if (mountedRef.current) setIsSpeaking(false);
        const cb = speakEndCallbackRef.current;
        speakEndCallbackRef.current = null;
        cb?.();
      };
      utterance.onend = finish;
      utterance.onerror = (event) => {
        // 'interrupted'/'canceled' happen when we deliberately cancel — silent.
        if (event.error && !["interrupted", "canceled"].includes(event.error)) {
          console.warn("[useSpeech] Speech synthesis error:", event.error);
        }
        finish();
      };

      // Chrome pauses long utterances after ~15s. Nudging it keeps speech alive.
      const keepAlive = setInterval(() => {
        if (!synth.speaking) {
          clearInterval(keepAlive);
          timersRef.current.delete(keepAlive);
          return;
        }
        synth.pause();
        synth.resume();
      }, 10000);
      timersRef.current.add(keepAlive);

      // Voices can be empty on first call; a tick later they're populated.
      if (!voices.length) {
        safeTimeout(() => synth.speak(utterance), 120);
      } else {
        synth.speak(utterance);
      }
    },
    [lang, safeTimeout]
  );

  // ------------------------------------------------------------------- cleanup

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      shouldListenRef.current = false;
      speakEndCallbackRef.current = null;
      utteranceRef.current = null;

      // Release the microphone. `abort()` is immediate; `stop()` can linger.
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.abort();
        } catch {
          /* already dead */
        }
        recognitionRef.current = null;
      }

      try {
        synth?.cancel();
      } catch {
        /* no-op */
      }

      timersRef.current.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      });
      timersRef.current.clear();
    };
  }, []);

  // Stop everything if the user tabs away mid-question.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        try {
          synth?.cancel();
        } catch {
          /* no-op */
        }
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, []);

  return {
    supported: speechSupport,
    // recognition
    isListening,
    transcript,
    interimTranscript,
    liveTranscript: `${transcript}${interimTranscript ? ` ${interimTranscript}` : ""}`.trim(),
    micError,
    clearMicError: () => setMicError(null),
    startListening,
    stopListening,
    resetTranscript,
    setTranscriptManually,
    // synthesis
    isSpeaking,
    speak,
    cancelSpeech,
  };
}

export default useSpeech;
