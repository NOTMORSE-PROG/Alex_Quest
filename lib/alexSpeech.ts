/**
 * Centralised TTS helper – every line Alex "says" goes through here
 * so we can control voice, rate, and language in one place.
 *
 * expo-speech picks voices by identifier; identifiers differ per OS.
 * We request a male en-US voice at runtime and cache the result.
 */

import * as Speech from "expo-speech";
import { useGameStore } from "@/store/gameStore";

let _cachedVoice: string | undefined;
let _voiceResolved = false;

/**
 * Resolve a male en-US voice id once, then cache it.
 * Falls back to the system default if none is found.
 */
async function resolveMaleVoice(): Promise<string | undefined> {
  if (_voiceResolved) return _cachedVoice;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // Prefer an en-US male voice
    const male = voices.find(
      (v) =>
        v.language.startsWith("en") &&
        /male/i.test(v.name ?? "") &&
        !/female/i.test(v.name ?? "")
    );
    // Android often exposes "en-us-x-sfg#male_*" style ids;
    // iOS uses com.apple.voice.compact.en-US.* names.
    // If no explicit "male" label, try common male voice names.
    const fallback =
      male ??
      voices.find(
        (v) =>
          v.language.startsWith("en") &&
          /daniel|james|tom|aaron|guy|david/i.test(v.identifier ?? "")
      );
    _cachedVoice = fallback?.identifier;
  } catch {
    // getAvailableVoicesAsync can throw on some devices – just use default
  }
  _voiceResolved = true;
  return _cachedVoice;
}

// Kick off voice resolution early so it's ready by the time we speak.
resolveMaleVoice();

export interface AlexSpeakOptions {
  rate?: number;
  onDone?: () => void;
}

/**
 * Speak a line as Alex (male en-US voice).
 * Silently no-ops when the user has muted sound.
 */
export function alexSpeak(text: string, opts: AlexSpeakOptions = {}) {
  if (useGameStore.getState().muted) {
    console.log("[alexSpeak] muted — skipping TTS");
    return;
  }
  const { rate = 0.85, onDone } = opts;
  const voice = _cachedVoice; // best-effort; if not resolved yet, falls back to default
  console.log(`[alexSpeak] speaking: "${text.slice(0, 40)}…" voice=${voice ?? "default"} rate=${rate}`);
  Speech.speak(text, {
    language: "en-US",
    rate,
    ...(voice ? { voice } : {}),
    onDone: () => {
      console.log("[alexSpeak] done");
      onDone?.();
    },
    onError: (err: unknown) => {
      console.warn("[alexSpeak] TTS error:", err);
    },
  });
}

/** Re-export stop so callers don't need to import expo-speech separately. */
export const alexStop = Speech.stop;
