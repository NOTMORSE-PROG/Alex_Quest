/**
 * Client-side grammar answer checking.
 * Uses fuzzy matching to handle minor speech recognition variations.
 */

// Normalize: lowercase, strip punctuation, collapse spaces
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?'";:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Calculate similarity ratio between two strings (0–1)
function similarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export interface CheckResult {
  isCorrect: boolean;
  confidence: number; // 0–1
  normalizedInput: string;
  normalizedExpected: string;
}

/**
 * Check whether a spoken/typed answer matches the expected answer.
 * Threshold: 0.70 similarity for spoken (speech errors), 0.85 for typed.
 */
export function checkAnswer(
  input: string,
  expected: string,
  mode: "speak" | "type" = "speak"
): CheckResult {
  const normInput = normalize(input);
  const normExpected = normalize(expected);
  const score = similarity(normInput, normExpected);
  const threshold = mode === "speak" ? 0.70 : 0.85;

  // Also try contains-check for single-word answers
  const singleWordMatch =
    normExpected.split(" ").length === 1 && normInput.includes(normExpected);

  return {
    isCorrect: score >= threshold || singleWordMatch,
    confidence: Math.round(score * 100) / 100,
    normalizedInput: normInput,
    normalizedExpected: normExpected,
  };
}

/**
 * Check a multiple-choice or fill-blank answer (exact match, case-insensitive).
 */
export function checkExact(input: string, expected: string): boolean {
  return normalize(input) === normalize(expected);
}

/**
 * Check yes/no answer.
 */
export function checkYesNo(input: string, expected: "Yes" | "No"): boolean {
  const norm = normalize(input);
  if (expected === "Yes") return norm === "yes" || norm.startsWith("yes");
  return norm === "no" || norm.startsWith("no");
}

/**
 * Calculate star rating based on XP earned vs total possible.
 */
export function calculateStars(earnedXP: number, totalXP: number): number {
  const ratio = earnedXP / totalXP;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio > 0) return 1;
  return 0;
}
