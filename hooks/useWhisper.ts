/**
 * On-device Whisper speech-to-text hook.
 *
 * Model loading priority:
 *   1. Bundled asset at assets/models/ggml-base.en-q5_1.bin (offline, preferred)
 *   2. Download from HuggingFace on first run (requires internet, cached after)
 *   3. If neither works → isReady stays false, assessment uses fallback path
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import type { WhisperResult, WhisperSegment } from "@/types/assessment";

// whisper.rn doesn't expose a root "." export — import directly from compiled output
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { initWhisper } = require("whisper.rn/lib/commonjs/index") as {
  initWhisper: (options: { filePath: string }) => Promise<WhisperContext>;
};

// Inline types (avoids broken module path resolution for whisper.rn)
// NOTE: ctx.transcribe() returns { stop, promise }, NOT a direct Promise.
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

const TAG = "[useWhisper]";

// Known Whisper hallucination strings (from PronounceRight reference impl)
const HALLUCINATIONS = new Set([
  "thank you", "thank you.", "thanks for watching", "thanks for watching.",
  "please subscribe", "please subscribe.", "like and subscribe",
  "see you next time", "bye bye", "the end", "subtitle by", "subtitles by",
  "translated by", "thank you for watching",
  "gunshot", "gunshots", "silence", "applause", "music", "laughter",
  "coughing", "breathing", "footsteps", "clapping", "whistling",
  "snoring", "screaming",
]);

// ── Model Configuration ───────────────────────────────────────────────

const MODEL_FILENAME = "ggml-base.en-q5_1.bin";
const MODEL_DIR = `${FileSystem.documentDirectory}whisper-models/`;
const MODEL_PATH = `${MODEL_DIR}${MODEL_FILENAME}`;
const MODEL_DOWNLOAD_URL =
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en-q5_1.bin";

// ── Types ─────────────────────────────────────────────────────────────

export interface WhisperState {
  isReady: boolean;
  isLoading: boolean;
  downloadProgress: number;
  error: string | null;
  transcribe: (audioUri: string) => Promise<WhisperResult | null>;
  isTranscribing: boolean;
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useWhisper(): WhisperState {
  const contextRef = useRef<WhisperContext | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      setError(null);
      console.log(`${TAG} init started`);

      try {
        // Ensure model directory exists
        const dirInfo = await FileSystem.getInfoAsync(MODEL_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(MODEL_DIR, { intermediates: true });
        }

        // Check if model already cached on disk
        let modelPath = MODEL_PATH;
        const modelInfo = await FileSystem.getInfoAsync(MODEL_PATH);

        if (!modelInfo.exists) {
          // Try bundled asset first (works offline)
          let bundledCopied = false;
          try {
            const { Asset } = await import("expo-asset");
            // If the model is placed at assets/models/ggml-base.en-q5_1.bin
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const asset = Asset.fromModule(require("@/assets/models/ggml-base.en-q5_1.bin"));
            await asset.downloadAsync();
            if (asset.localUri) {
              await FileSystem.copyAsync({ from: asset.localUri, to: MODEL_PATH });
              bundledCopied = true;
              console.log(`${TAG} bundled model copied to: ${MODEL_PATH}`);
            }
          } catch {
            console.log(`${TAG} no bundled model found, will try download`);
          }

          if (!bundledCopied) {
            // Fallback: download from HuggingFace
            console.log(`${TAG} downloading model from HuggingFace...`);
            const downloadResumable = FileSystem.createDownloadResumable(
              MODEL_DOWNLOAD_URL,
              MODEL_PATH,
              {},
              (progress) => {
                if (!cancelled) {
                  const pct = progress.totalBytesExpectedToWrite > 0
                    ? progress.totalBytesWritten / progress.totalBytesExpectedToWrite
                    : 0;
                  setDownloadProgress(pct);
                  if (Math.round(pct * 100) % 10 === 0) {
                    console.log(`${TAG} download progress: ${Math.round(pct * 100)}%`);
                  }
                }
              }
            );
            const result = await downloadResumable.downloadAsync();
            if (!result || cancelled) {
              console.warn(`${TAG} download cancelled or failed`);
              return;
            }
            modelPath = result.uri;
            console.log(`${TAG} model downloaded to: ${modelPath}`);
          }
        } else {
          console.log(`${TAG} model already cached at: ${MODEL_PATH}`);
        }

        if (cancelled) return;

        console.log(`${TAG} initializing Whisper context...`);
        const ctx = await initWhisper({ filePath: modelPath });

        if (cancelled) {
          await ctx.release();
          return;
        }

        contextRef.current = ctx;
        setIsReady(true);
        console.log(`${TAG} ready`);
      } catch (e) {
        if (!cancelled) {
          console.error(`${TAG} init failed:`, e);
          // Don't set error state — chapter page should still work via fallback
          // setError(e instanceof Error ? e.message : "Failed to initialize Whisper");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      contextRef.current?.release();
      contextRef.current = null;
    };
  }, []);

  const transcribe = useCallback(async (audioUri: string): Promise<WhisperResult | null> => {
    const ctx = contextRef.current;
    if (!ctx) {
      console.warn(`${TAG} transcribe called but context not ready`);
      return null;
    }

    setIsTranscribing(true);
    console.log(`${TAG} transcribe started for uri=${audioUri}`);

    try {
      // whisper.rn transcribe returns { stop, promise }, NOT a direct Promise
      const { promise } = ctx.transcribe(audioUri, {
        language: "en",
        maxLen: 1,
        tdrzEnable: false,
        temperature: 0,
        temperatureInc: 0,
        beamSize: 1,
        noSpeechThold: 0.4,
        logprobThold: -0.7,
        suppressNonSpeechTokens: true,
        tokenTimestamps: true,
      });
      const result = await promise;

      if (!result?.result) {
        console.warn(`${TAG} transcribe returned empty result`);
        return null;
      }

      const text = result.result.trim();
      console.log(`${TAG} transcribe result: "${text}"`);

      // Check for Whisper special tokens like [BLANK_AUDIO]
      if (/^\[[\w\s]+\]$/.test(text)) {
        console.warn(`${TAG} detected Whisper special token: "${text}"`);
        return null;
      }

      // Check for known hallucinations
      const cleaned = text.toLowerCase().replace(/[^a-z\s']/g, "").trim();
      if (HALLUCINATIONS.has(cleaned)) {
        console.warn(`${TAG} detected hallucination: "${text}"`);
        return null;
      }

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

      // Fallback segments if none parsed
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
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return { isReady, isLoading, downloadProgress, error, transcribe, isTranscribing };
}
