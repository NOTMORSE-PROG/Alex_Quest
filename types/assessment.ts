/**
 * Assessment type definitions for the phoneme-level speech assessment engine.
 * Used across the assessment pipeline: scoring → feedback → UI display.
 */

// ── Phoneme-Level Types ──────────────────────────────────────────────

export interface PhonemeResult {
  /** IPA symbol for display (e.g., "θ", "ɛ", "oʊ") */
  phoneme: string;
  /** ARPAbet symbol for internal use (e.g., "TH", "EH", "OW") */
  arpabet: string;
  /** Quality score 0-100 */
  qualityScore: number;
  /** What happened with this phoneme */
  status: "correct" | "substitution" | "missing" | "extra";
  /** IPA of what the student actually produced (if substitution) */
  soundMostLike?: string;
  /** Pronunciation tip for this phoneme */
  tip?: string;
}

export interface SyllableResult {
  /** Display text */
  syllable: string;
  /** Quality score 0-100 */
  qualityScore: number;
  /** Expected stress level (0=none, 1=primary, 2=secondary) */
  expectedStress: number;
  /** Phonemes within this syllable */
  phonemes: PhonemeResult[];
}

export interface WordResult {
  /** The word text */
  word: string;
  /** Quality score 0-100 (average of phoneme scores or confidence-based) */
  qualityScore: number;
  /** What happened with this word */
  status: "correct" | "mispronounced" | "missing" | "extra";
  /** Phoneme-level breakdown */
  phonemes: PhonemeResult[];
  /** Whether stress was placed on the correct syllable */
  stressCorrect?: boolean;
  /** Whisper's per-word confidence for this word (0-1) */
  whisperConfidence?: number;
}

// ── Problem Sound ────────────────────────────────────────────────────

export interface ProblemSound {
  /** IPA symbol of the expected phoneme */
  phoneme: string;
  /** IPA symbol of what they actually said */
  soundMostLike: string;
  /** How to fix it (kid-friendly language) */
  tip: string;
  /** Which word this occurred in */
  word: string;
}

// ── Reflection ───────────────────────────────────────────────────────

export interface Reflection {
  /** What the student did well (always at least one positive) */
  strengths: string[];
  /** Specific, actionable improvement items (max 2-3) */
  areasToImprove: string[];
  /** A mini drill to try right now */
  practiceExercise: string;
  /** Progress-aware encouragement message */
  encouragement: string;
}

// ── Main Assessment Result ───────────────────────────────────────────

export interface AssessmentResult {
  // ── Scores (0-100) ──
  overallScore: number;
  contentScore: number;
  pronunciationScore: number;
  fluencyScore: number;

  /** Whether the student passed (overallScore >= 80) */
  passed: boolean;

  // ── Phoneme Breakdown ──
  wordResults: WordResult[];

  // ── Feedback for UI ──
  contentFeedback: string;
  pronunciationFeedback: string;
  problemSounds: ProblemSound[];

  // ── Dynamic Feedback (generated, not canned) ──
  /** Natural-language summary of what happened */
  description: string;
  /** Personalized reflection with strengths, improvement items, exercises */
  reflection: Reflection;

  // ── Hint Escalation ──
  /** Current hint level based on attempt count */
  hintLevel: 0 | 1 | 2 | 3;

  // ── Metadata ──
  /** Which assessment engine produced this result */
  source: "whisper" | "fallback-local" | "simple";
  /** Timestamp of assessment */
  timestamp: number;
  /** What Whisper actually heard the student say (for display in feedback) */
  spokenText?: string;
}

// ── Whisper Result Type ──────────────────────────────────────────────

export interface WhisperSegment {
  /** Recognized word */
  word: string;
  /** Confidence score 0-1 */
  confidence: number;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
}

export interface WhisperResult {
  /** Full transcript text */
  text: string;
  /** Per-word segments with confidence and timing */
  segments: WhisperSegment[];
}

// ── Alignment Types ──────────────────────────────────────────────────

export interface AlignmentPair {
  /** Expected phoneme (null if insertion — student added extra) */
  expected: string | null;
  /** Actual phoneme (null if deletion — student missed this) */
  actual: string | null;
  /** Similarity score 0-1 from articulatory matrix */
  similarity: number;
  /** Classification of this alignment position */
  status: "match" | "substitution" | "insertion" | "deletion";
}

export interface AlignmentResult {
  /** Normalized alignment score 0-1 */
  score: number;
  /** Per-position alignment details */
  pairs: AlignmentPair[];
  /** Raw cost from dynamic programming */
  totalCost: number;
}

// ── Config Types ─────────────────────────────────────────────────────

export interface AssessmentConfig {
  /** Overall score needed to pass (default: 80) */
  passThreshold: number;
  /** Weight for content score (default: 0.5) */
  contentWeight: number;
  /** Weight for pronunciation score (default: 0.4) */
  pronunciationWeight: number;
  /** Weight for fluency score (default: 0.1) */
  fluencyWeight: number;
  /** Gap penalty for Needleman-Wunsch (default: -0.5) */
  gapPenalty: number;
  /** Max hint level before revealing answer (default: 3) */
  maxHintLevel: number;
}
