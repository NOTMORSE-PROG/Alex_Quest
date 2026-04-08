/**
 * On-device Whisper speech-to-text hook (Bench / Alex's Quest).
 *
 * Loader strategy — ported from PronounceRight (the sister project that already
 * works reliably). Both Whisper and Silero VAD models are bundled inside the APK
 * via Metro's `assetExts.push('bin')`. On first launch we copy them once from the
 * bundle into `documentDirectory/whisper-models/` and reuse on every subsequent
 * launch. There is intentionally NO HuggingFace download fallback — if the model
 * isn't in the APK that's a CI/build bug we want to surface, not paper over.
 *
 * The actual init runs once at app startup (module-level singleton) and is shared
 * across every component that calls `useWhisper()`. The hook just subscribes to
 * the singleton's state.
 */
import { useEffect, useState, useCallback } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WhisperResult, WhisperSegment } from "@/types/assessment";

// whisper.rn doesn't expose a clean root export in 0.5.5 — import from compiled output.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const whisperRn = require("whisper.rn/lib/commonjs/index") as {
  initWhisper: (options: { filePath: string }) => Promise<WhisperContext>;
  initWhisperVad?: (options: { filePath: string }) => Promise<WhisperVadContext>;
};

// Inline types — avoids broken module path resolution for whisper.rn
interface WhisperContext {
  transcribe(
    audioUri: string,
    options?: Record<string, unknown>
  ): {
    stop: () => Promise<void>;
    promise: Promise<{
      result: string;
      segments?: { text: string; t0: number; t1: number; avgProb?: number }[];
    }>;
  };
  release(): Promise<void>;
}

interface WhisperVadContext {
  detectSpeech(audioUri: string): Promise<{ t0: number; t1: number }[]>;
  release?: () => Promise<void>;
}

const TAG = "[useWhisper]";

// Known Whisper hallucination strings (from PronounceRight reference impl).
// NOTE: deliberately does NOT include "yes" / "no" — those are valid identify answers.
const HALLUCINATIONS = new Set([
  "thank you", "thank you.", "thanks for watching", "thanks for watching.",
  "please subscribe", "please subscribe.", "like and subscribe",
  "see you next time", "bye bye", "the end", "subtitle by", "subtitles by",
  "translated by", "thank you for watching",
  "gunshot", "gunshots", "silence", "applause", "music", "laughter",
  "coughing", "breathing", "footsteps", "clapping", "whistling",
  "snoring", "screaming",
]);

// ── Model assets — referenced at module top level so Metro can statically
// resolve them in Hermes release builds (same pattern as PronounceRight).
// Use relative paths, NOT the @/ alias — Metro may not resolve aliases
// correctly for binary assets in release/Hermes builds.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WHISPER_ASSET = require("../assets/models/ggml-base.en-q5_1.bin");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const VAD_ASSET = require("../assets/models/ggml-silero-v6.2.0.bin");

// ── Model Configuration ───────────────────────────────────────────────

const MODEL_DIR = `${FileSystem.documentDirectory}whisper-models/`;
const WHISPER_DEST = `${MODEL_DIR}ggml-base.en-q5_1.bin`;
const VAD_DEST = `${MODEL_DIR}ggml-silero-v6.2.0.bin`;

const DIAG_KEY = "whisper:lastError";

// ── Public state shape (kept compatible with the old hook API) ────────

export interface WhisperState {
  isReady: boolean;
  isLoading: boolean;
  /** @deprecated retained for API compatibility — always 0 (no network download). */
  downloadProgress: number;
  error: string | null;
  transcribe: (audioUri: string, opts?: TranscribeOptions) => Promise<WhisperResult | null>;
  isTranscribing: boolean;
  retry: () => void;
}

// ── Module-level singleton ────────────────────────────────────────────
//
// We share a single in-flight init across the whole app. The hook below just
// subscribes to changes via React state. This way mounting useWhisper in two
// places never re-runs initialization, and pre-warming from _layout.tsx is
// effectively free for any screen that mounts later.

interface SingletonState {
  status: "idle" | "loading" | "ready" | "error";
  whisperCtx: WhisperContext | null;
  vadCtx: WhisperVadContext | null;
  errorMessage: string | null;
}

let singleton: SingletonState = {
  status: "idle",
  whisperCtx: null,
  vadCtx: null,
  errorMessage: null,
};

let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function setSingleton(next: Partial<SingletonState>) {
  singleton = { ...singleton, ...next };
  notify();
}

/**
 * Copy a bundled model to a stable on-disk path. Idempotent (skips if already copied).
 *
 * Two strategies are tried in order:
 *  1. Metro asset registry via Asset.fromModule() — works in dev and when Metro
 *     correctly bundles the .bin file as a registered asset.
 *  2. Direct Android asset URI (file:///android_asset/models/<filename>) — works
 *     when the CI "Copy models into Android assets" step placed the file at
 *     android/app/src/main/assets/models/ before the Gradle build.
 */
async function ensureAssetCopied(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assetModule: any,
  filename: string,
  destPath: string
): Promise<string> {
  const info = await FileSystem.getInfoAsync(destPath);
  if (info.exists) return destPath;

  // Strategy 1: Metro-registered asset
  try {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    if (asset.localUri) {
      await FileSystem.copyAsync({ from: asset.localUri, to: destPath });
      console.log(`${TAG} copied ${filename} via Asset.fromModule`);
      return destPath;
    }
  } catch (e) {
    console.warn(`${TAG} Asset.fromModule failed for ${filename}:`, e);
  }

  // Strategy 2: Direct Android asset path (CI copies models here before Gradle build)
  const androidUri = `file:///android_asset/models/${filename}`;
  console.log(`${TAG} falling back to android asset URI for ${filename}`);
  await FileSystem.copyAsync({ from: androidUri, to: destPath });
  return destPath;
}

async function recordDiagnostic(stage: string, err: unknown) {
  try {
    const free = await FileSystem.getFreeDiskStorageAsync().catch(() => null);
    const payload = {
      stage,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      freeDiskBytes: free,
      ts: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DIAG_KEY, JSON.stringify(payload));
  } catch {
    /* diagnostics are best-effort */
  }
}

const TRANSCRIBE_DIAG_KEY = "whisper:lastTranscribe";

interface TranscribeDiagnostic {
  outcome: "ok" | "empty-result" | "special-token" | "hallucination";
  text: string;
  offsetMs: number;
}

async function recordLastTranscribe(diag: TranscribeDiagnostic) {
  try {
    await AsyncStorage.setItem(
      TRANSCRIBE_DIAG_KEY,
      JSON.stringify({ ...diag, ts: new Date().toISOString() })
    );
  } catch {
    /* best-effort */
  }
}

/**
 * Run the loader once. Subsequent calls return the existing in-flight promise
 * or resolve immediately if init has already finished. Safe to call from app
 * startup AND from individual screens — only one init will actually run.
 */
export function ensureWhisperReady(): Promise<void> {
  if (singleton.status === "ready") return Promise.resolve();
  if (inFlight) return inFlight;

  setSingleton({ status: "loading", errorMessage: null });

  inFlight = (async () => {
    let stage = "init";
    try {
      // Make sure the destination directory exists.
      stage = "mkdir";
      const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
      }

      // Extract both models from the APK bundle in parallel (first launch only).
      stage = "extract-assets";
      console.log(`${TAG} extracting bundled models…`);
      const [whisperPath, vadPath] = await Promise.all([
        ensureAssetCopied(WHISPER_ASSET, "ggml-base.en-q5_1.bin", WHISPER_DEST),
        ensureAssetCopied(VAD_ASSET, "ggml-silero-v6.2.0.bin", VAD_DEST).catch((e) => {
          // VAD is optional — log and continue without it.
          console.warn(`${TAG} VAD asset extract failed:`, e);
          return null;
        }),
      ]);

      // Initialize whisper + (optional) VAD contexts in parallel.
      stage = "init-context";
      console.log(`${TAG} initializing whisper context…`);
      const [whisperCtx, vadCtx] = await Promise.all([
        whisperRn.initWhisper({ filePath: whisperPath }),
        vadPath && whisperRn.initWhisperVad
          ? whisperRn.initWhisperVad({ filePath: vadPath }).catch((e) => {
              console.warn(`${TAG} VAD init failed (continuing without VAD):`, e);
              return null;
            })
          : Promise.resolve(null),
      ]);

      setSingleton({
        status: "ready",
        whisperCtx,
        vadCtx,
        errorMessage: null,
      });
      console.log(`${TAG} ready (vad=${vadCtx ? "yes" : "no"})`);
    } catch (e) {
      const message =
        e instanceof Error ? `${stage}: ${e.message}` : `${stage}: ${String(e)}`;
      console.error(`${TAG} init failed at stage=${stage}:`, e);
      void recordDiagnostic(stage, e);
      setSingleton({ status: "error", errorMessage: message });
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Re-run init from scratch (e.g. user tapped a retry button). */
export function retryWhisperInit(): void {
  if (singleton.status === "loading") return;
  setSingleton({ status: "idle", errorMessage: null });
  void ensureWhisperReady();
}

// ── Transcription helpers (used by the hook) ──────────────────────────

async function getSpeechOffsetMs(
  vadCtx: WhisperVadContext | null,
  uri: string
): Promise<number> {
  if (!vadCtx) return 0;
  try {
    const segs = await vadCtx.detectSpeech(uri);
    if (!segs || segs.length === 0) return 0;
    // Trim leading silence with 200ms padding (VAD t0 is in ms).
    return Math.max(0, segs[0].t0 - 200);
  } catch (e) {
    console.warn(`${TAG} VAD detectSpeech threw — proceeding without offset:`, e);
    return 0;
  }
}

export interface TranscribeOptions {
  /** Optional prompt to bias Whisper toward expected words (e.g. "yes no" for identify questions). */
  prompt?: string;
  /** Permissive mode — looser thresholds, useful for short single-syllable utterances. */
  permissive?: boolean;
}

async function transcribeImpl(
  audioUri: string,
  userOpts: TranscribeOptions = {}
): Promise<WhisperResult | null> {
  const ctx = singleton.whisperCtx;
  if (!ctx) {
    console.warn(`${TAG} transcribe called but context not ready`);
    return null;
  }

  const uri = audioUri.startsWith("file://") ? audioUri : `file://${audioUri}`;
  console.log(`${TAG} transcribe started uri=${uri} permissive=${!!userOpts.permissive}`);

  // VAD is a SOFT signal — we always run Whisper. VAD only contributes a
  // leading-silence offset when it's confident.
  const offsetMs = await getSpeechOffsetMs(singleton.vadCtx, uri);

  try {
    const opts: Record<string, unknown> = {
      language: "en",
      maxLen: 1,
      tdrzEnable: false,
      temperature: 0,
      temperatureInc: 0,
      beamSize: 5,
      // Permissive mode for short identify answers — looser thresholds so
      // single-syllable words like "no" / "yes" aren't classified as silence.
      noSpeechThold: userOpts.permissive ? 0.1 : 0.3,
      logprobThold: userOpts.permissive ? -1.0 : -0.7,
      suppressNonSpeechTokens: true,
    };
    if (offsetMs > 0) opts.offset = offsetMs;
    if (userOpts.prompt) opts.prompt = userOpts.prompt;

    const { promise } = ctx.transcribe(uri, opts);
    const result = await promise;

    if (!result?.result) {
      console.warn(`${TAG} transcribe returned empty result`);
      void recordLastTranscribe({ outcome: "empty-result", text: "", offsetMs });
      return null;
    }

    const text = result.result.trim();
    console.log(`${TAG} transcribe result: "${text}"`);

    if (/^\[[\w\s]+\]$/.test(text)) {
      console.warn(`${TAG} detected whisper special token: "${text}"`);
      void recordLastTranscribe({ outcome: "special-token", text, offsetMs });
      return null;
    }

    const cleaned = text.toLowerCase().replace(/[^a-z\s']/g, "").trim();
    if (HALLUCINATIONS.has(cleaned)) {
      console.warn(`${TAG} detected hallucination: "${text}"`);
      void recordLastTranscribe({ outcome: "hallucination", text, offsetMs });
      return null;
    }

    void recordLastTranscribe({ outcome: "ok", text, offsetMs });

    const segments: WhisperSegment[] = [];
    if (result.segments) {
      for (const seg of result.segments) {
        const words = seg.text.trim().split(/\s+/);
        const segDuration = seg.t1 - seg.t0;
        const wordDuration = segDuration / Math.max(words.length, 1);
        for (let i = 0; i < words.length; i++) {
          const word = words[i].replace(/[^a-zA-Z'-]/g, "");
          if (!word) continue;
          segments.push({
            word,
            confidence: seg.avgProb ?? 0.8,
            start: (seg.t0 + i * wordDuration) / 100,
            end: (seg.t0 + (i + 1) * wordDuration) / 100,
          });
        }
      }
    }

    if (segments.length === 0 && text) {
      const words = text.split(/\s+/).filter(Boolean);
      const wordDur = 8 / Math.max(words.length, 1);
      for (let i = 0; i < words.length; i++) {
        segments.push({
          word: words[i].replace(/[^a-zA-Z'-]/g, ""),
          confidence: 0.8,
          start: i * wordDur,
          end: (i + 1) * wordDur,
        });
      }
    }

    console.log(`${TAG} transcribe parsed ${segments.length} word segments`);
    return { text, segments };
  } catch (e) {
    console.error(`${TAG} transcribe threw:`, e);
    return null;
  }
}

// ── React hook ────────────────────────────────────────────────────────

export function useWhisper(): WhisperState {
  const [, force] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Subscribe to singleton state changes.
  useEffect(() => {
    const tick = () => force((n) => n + 1);
    listeners.add(tick);
    // Kick off init if nothing else has yet.
    void ensureWhisperReady();
    return () => {
      listeners.delete(tick);
    };
  }, []);

  const transcribe = useCallback(
    async (audioUri: string, opts?: TranscribeOptions): Promise<WhisperResult | null> => {
      setIsTranscribing(true);
      try {
        return await transcribeImpl(audioUri, opts);
      } finally {
        setIsTranscribing(false);
      }
    },
    []
  );

  const retry = useCallback(() => retryWhisperInit(), []);

  return {
    isReady: singleton.status === "ready",
    isLoading: singleton.status === "loading" || singleton.status === "idle",
    downloadProgress: 0,
    error: singleton.status === "error" ? singleton.errorMessage : null,
    transcribe,
    isTranscribing,
    retry,
  };
}
