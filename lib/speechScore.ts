/**
 * Speech scoring utilities.
 * Wraps Web Speech API results and provides confidence scoring.
 */

/**
 * Score how closely a spoken answer matches the expected answer.
 * Uses word-overlap similarity. Returns 0–1.
 */
export function scoreAnswer(spoken: string, expected: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  const spokenWords = normalize(spoken).split(/\s+/).filter(Boolean);
  const expectedWords = normalize(expected).split(/\s+/).filter(Boolean);
  if (expectedWords.length === 0) return 0;
  const matchCount = spokenWords.filter((w) => expectedWords.includes(w)).length;
  return matchCount / expectedWords.length;
}

export interface SpeechResult {
  transcript: string;
  confidence: number; // 0–1 from Web Speech API
  isFinal: boolean;
}

/**
 * Parse Web Speech API SpeechRecognitionResultList into our format.
 */
export function parseSpeechResults(
  results: SpeechRecognitionResultList
): SpeechResult | null {
  if (!results || results.length === 0) return null;
  const last = results[results.length - 1];
  const best = last[0];
  return {
    transcript: best.transcript.trim(),
    confidence: best.confidence ?? 0.8,
    isFinal: last.isFinal,
  };
}

/**
 * Determine if a speech confidence score is acceptable.
 * Below 0.5 we consider the recognition unreliable.
 */
export function isConfidentEnough(confidence: number): boolean {
  return confidence >= 0.5;
}

/**
 * Get a friendly label for a confidence score.
 */
export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "Excellent!";
  if (confidence >= 0.70) return "Good job!";
  if (confidence >= 0.55) return "Almost!";
  return "Try again";
}

/**
 * Get color class for confidence bar.
 */
export function confidenceColor(confidence: number): string {
  if (confidence >= 0.85) return "bg-success";
  if (confidence >= 0.70) return "bg-gold";
  if (confidence >= 0.55) return "bg-warning";
  return "bg-danger";
}
