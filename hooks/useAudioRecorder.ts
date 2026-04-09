/**
 * Audio recorder hook for capturing audio for Whisper processing.
 * Uses expo-av (same as PronounceRight reference implementation).
 * 16kHz mono — Whisper's native sample rate, avoids resampling artifacts.
 */

import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";

const TAG = "[useAudioRecorder]";

// ── Recording Options (proven by PronounceRight) ──────────────────────
// 16kHz mono is critical — default 44.1kHz stereo causes garbage Whisper transcripts

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  ios: {
    extension: ".wav",
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

// ── Types ─────────────────────────────────────────────────────────────

export type RecorderState = "idle" | "recording" | "stopped";

export interface AudioRecorderHook {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useAudioRecorder(): AudioRecorderHook {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    console.log(`${TAG} startRecording called`);
    try {
      setError(null);

      // Unload any previous recording instance
      if (recordingRef.current) {
        console.log(`${TAG} cleaning up previous recording instance`);
        try { await recordingRef.current.stopAndUnloadAsync(); } catch { /* ignore */ }
        recordingRef.current = null;
      }

      // Request expo-av's own mic permission. Some Android ROMs (Oppo ColorOS,
      // MIUI, Vivo FunTouch) do NOT propagate grants between native modules, so
      // even though the chapter screen asked expo-speech-recognition for
      // permission, expo-av may still see "denied" here.
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        console.warn(`${TAG} Audio.requestPermissionsAsync denied`);
        setError("Microphone permission denied. Please enable mic access in your phone Settings.");
        setState("idle");
        return;
      }

      // Switch the audio session into recording mode. Required on iOS, and
      // fixes silent 0-byte recordings on Oppo/Vivo Android devices where the
      // session otherwise stays in playback-only mode.
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Try the tuned 16kHz mono profile first; fall back to HIGH_QUALITY
      // preset if the device's encoder rejects it (some budget Android chips).
      let recording: Audio.Recording;
      try {
        ({ recording } = await Audio.Recording.createAsync(RECORDING_OPTIONS));
        console.log(`${TAG} recording started (16kHz mono profile)`);
      } catch (primaryErr) {
        console.error(`${TAG} createAsync failed with primary profile:`, primaryErr);
        console.log(`${TAG} retrying with HIGH_QUALITY preset`);
        ({ recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        ));
        console.log(`${TAG} recording started (HIGH_QUALITY fallback)`);
      }
      recordingRef.current = recording;
      setState("recording");
    } catch (e) {
      console.error(`${TAG} startRecording failed:`, e);
      setError(e instanceof Error ? e.message : "Failed to start recording");
      setState("idle");
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    console.log(`${TAG} stopRecording called, hasRecording=${!!recordingRef.current}`);
    const recording = recordingRef.current;
    if (!recording) {
      console.warn(`${TAG} stopRecording: no active recording`);
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setState("stopped");
      console.log(`${TAG} stopped, uri=${uri}`);
      return uri ?? null;
    } catch (e) {
      console.error(`${TAG} stopRecording failed:`, e);
      setError(e instanceof Error ? e.message : "Failed to stop recording");
      recordingRef.current = null;
      setState("idle");
      return null;
    }
  }, []);

  return { state, startRecording, stopRecording, error };
}

// ── Utility ───────────────────────────────────────────────────────────

export async function cleanupAudioFile(uri: string): Promise<void> {
  try {
    const { deleteAsync } = await import("expo-file-system/legacy");
    await deleteAsync(uri, { idempotent: true });
  } catch {
    // Non-critical
  }
}
