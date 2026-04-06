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
 * Tuned for children's speech. Ship conservative, adjust with real data.
 */
export function confidenceToPronunciationScore(confidence: number): number {
  if (confidence >= 0.95) return 95 + (confidence - 0.95) * 100; // 95-100
  if (confidence >= 0.90) return 88 + (confidence - 0.90) * 140; // 88-95
  if (confidence >= 0.85) return 82 + (confidence - 0.85) * 120; // 82-88
  if (confidence >= 0.80) return 75 + (confidence - 0.80) * 140; // 75-82
  if (confidence >= 0.70) return 65 + (confidence - 0.70) * 100; // 65-75
  if (confidence >= 0.60) return 55 + (confidence - 0.60) * 100; // 55-65
  return Math.max(20, confidence * 90); // 20-54
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
