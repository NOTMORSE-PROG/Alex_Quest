/**
 * Assessment engine configuration.
 * Adjust thresholds and weights to calibrate scoring.
 */

import type { AssessmentConfig } from "@/types/assessment";

export const ASSESSMENT_CONFIG: AssessmentConfig = {
  /** Score >= 80 to pass */
  passThreshold: 80,

  /** Content (right answer?) is weighted most heavily */
  contentWeight: 0.5,

  /** Pronunciation quality is second most important */
  pronunciationWeight: 0.4,

  /** Fluency (pacing, naturalness) is a smaller factor */
  fluencyWeight: 0.1,

  /** Needleman-Wunsch gap penalty for missing/extra phonemes */
  gapPenalty: -0.5,

  /** After this many wrong attempts, reveal the answer */
  maxHintLevel: 3,
};

/**
 * Whisper confidence → pronunciation score mapping curve.
 * Shifted up ~8 points for child speech — Whisper typically outputs 0.70-0.85
 * for clear child speech, so we need higher scores in that range to avoid
 * unfairly penalizing good pronunciation attempts.
 */
export function confidenceToPronunciationScore(confidence: number): number {
  if (confidence >= 0.95) return 95 + (confidence - 0.95) * 100; // 95-100
  if (confidence >= 0.90) return 90 + (confidence - 0.90) * 100; // 90-95
  if (confidence >= 0.85) return 83 + (confidence - 0.85) * 140; // 83-90
  if (confidence >= 0.75) return 72 + (confidence - 0.75) * 110; // 72-83
  if (confidence >= 0.65) return 62 + (confidence - 0.65) * 100; // 62-72
  if (confidence >= 0.55) return 50 + (confidence - 0.55) * 120; // 50-62
  return Math.max(20, confidence * 90);                            // 20-49
}

/**
 * Score tier labels for UI display.
 */
export function getScoreTier(score: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (score >= 90)
    return { label: "Amazing!", emoji: "🌟", color: "#58CC02" };
  if (score >= 80)
    return { label: "Great job!", emoji: "✨", color: "#58CC02" };
  if (score >= 70)
    return { label: "Almost there!", emoji: "💪", color: "#FF9600" };
  if (score >= 60)
    return { label: "Keep trying!", emoji: "📚", color: "#FF9600" };
  return { label: "Let's practice!", emoji: "🎯", color: "#FF4B4B" };
}

/**
 * Auto-stop recording after this many seconds of silence.
 */
export const RECORDING_TIMEOUT_MS = 15_000;

/**
 * How long to show feedback on correct answer before auto-advancing.
 */
export const CORRECT_FEEDBACK_DURATION_MS = 3_000;
