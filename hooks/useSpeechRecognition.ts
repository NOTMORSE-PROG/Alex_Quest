import { useState, useRef, useCallback } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

export type SpeechState = "idle" | "recording" | "processing" | "done" | "error";

export interface UseSpeechRecognitionReturn {
  state: SpeechState;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  reset: () => void;
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isRecordingRef = useRef(false);

  useSpeechRecognitionEvent("start", () => {
    setState("recording");
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const result = event.results[0];
    if (!result) return;
    if (event.isFinal) {
      setTranscript(result.transcript);
      setConfidence(result.confidence >= 0 ? result.confidence : 0.8);
      setInterimTranscript("");
    } else {
      setInterimTranscript(result.transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setState("processing");
    setInterimTranscript("");
    setTimeout(() => setState("done"), 800);
    isRecordingRef.current = false;
  });

  useSpeechRecognitionEvent("error", (event) => {
    const messages: Record<string, string> = {
      "no-speech": "No speech detected. Try again.",
      "not-allowed": "Microphone permission denied.",
      "speech-timeout": "No speech detected. Try again.",
      "language-not-supported": "On-device English model not available on this device.",
    };
    setError(messages[event.error] ?? "Speech recognition error.");
    setState("error");
    isRecordingRef.current = false;
  });

  const startRecording = useCallback(async () => {
    try {
      setTranscript("");
      setInterimTranscript("");
      setError(null);
      isRecordingRef.current = true;
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, requiresOnDeviceRecognition: true });
    } catch {
      setError("Could not start speech recognition.");
      setState("error");
      isRecordingRef.current = false;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!isRecordingRef.current) return;
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const reset = useCallback(() => {
    try {
      if (isRecordingRef.current) {
        ExpoSpeechRecognitionModule.abort();
        isRecordingRef.current = false;
      }
    } catch {
      // ignore
    }
    setState("idle");
    setTranscript("");
    setInterimTranscript("");
    setConfidence(0);
    setError(null);
  }, []);

  return {
    state,
    transcript,
    interimTranscript,
    confidence,
    isSupported: true,
    startRecording,
    stopRecording,
    reset,
    error,
  };
}
