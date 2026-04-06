/**
 * Needleman-Wunsch global alignment algorithm for phoneme sequences.
 *
 * Aligns expected phoneme sequence against actual phoneme sequence,
 * using articulatory similarity scoring to detect substitutions,
 * insertions, and deletions at the phoneme level.
 *
 * Time: O(m × n) where m, n are sequence lengths.
 * For typical English words (3-15 phonemes), this runs in <1ms.
 */

import type { AlignmentPair, AlignmentResult } from "@/types/assessment";
import { phonemeSimilarity, stripStress } from "./phonemeData";
import { ASSESSMENT_CONFIG } from "./config";

// ── Main Alignment Function ──────────────────────────────────────────

/**
 * Align two phoneme sequences using Needleman-Wunsch with articulatory similarity.
 *
 * @param expected - Expected phoneme sequence (from CMU dictionary of expected answer)
 * @param actual - Actual phoneme sequence (from CMU dictionary of recognized words)
 * @param gapPenalty - Penalty for insertions/deletions (default from config)
 * @returns Alignment result with per-position details and normalized score
 */
export function alignPhonemes(
  expected: string[],
  actual: string[],
  gapPenalty: number = ASSESSMENT_CONFIG.gapPenalty
): AlignmentResult {
  const m = expected.length;
  const n = actual.length;

  // Handle edge cases
  if (m === 0 && n === 0) {
    return { score: 1.0, pairs: [], totalCost: 0 };
  }
  if (m === 0) {
    return {
      score: 0,
      pairs: actual.map((p) => ({
        expected: null,
        actual: p,
        similarity: 0,
        status: "insertion" as const,
      })),
      totalCost: n * Math.abs(gapPenalty),
    };
  }
  if (n === 0) {
    return {
      score: 0,
      pairs: expected.map((p) => ({
        expected: p,
        actual: null,
        similarity: 0,
        status: "deletion" as const,
      })),
      totalCost: m * Math.abs(gapPenalty),
    };
  }

  // ── Build scoring matrix ───────────────────────────────────────
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1);
    dp[i][0] = i * gapPenalty;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j * gapPenalty;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const sim = phonemeSimilarity(expected[i - 1], actual[j - 1]);
      // Score match/mismatch as similarity (0-1), not just 0 or 1
      const matchScore = dp[i - 1][j - 1] + sim;
      const deleteScore = dp[i - 1][j] + gapPenalty;
      const insertScore = dp[i][j - 1] + gapPenalty;
      dp[i][j] = Math.max(matchScore, deleteScore, insertScore);
    }
  }

  // ── Backtrack to find alignment ────────────────────────────────
  const pairs: AlignmentPair[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const sim = phonemeSimilarity(expected[i - 1], actual[j - 1]);
      const matchScore = dp[i - 1][j - 1] + sim;

      if (Math.abs(dp[i][j] - matchScore) < 1e-9) {
        // Match or substitution
        const baseExpected = stripStress(expected[i - 1]);
        const baseActual = stripStress(actual[j - 1]);
        pairs.unshift({
          expected: expected[i - 1],
          actual: actual[j - 1],
          similarity: sim,
          status: baseExpected === baseActual ? "match" : "substitution",
        });
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && Math.abs(dp[i][j] - (dp[i - 1][j] + gapPenalty)) < 1e-9) {
      // Deletion (expected phoneme missing from actual)
      pairs.unshift({
        expected: expected[i - 1],
        actual: null,
        similarity: 0,
        status: "deletion",
      });
      i--;
    } else {
      // Insertion (extra phoneme in actual)
      pairs.unshift({
        expected: null,
        actual: actual[j - 1],
        similarity: 0,
        status: "insertion",
      });
      j--;
    }
  }

  // ── Compute normalized score ───────────────────────────────────
  // Maximum possible score = max(m, n) * 1.0 (all perfect matches)
  const maxPossible = Math.max(m, n);
  const totalSimilarity = pairs.reduce((sum, p) => sum + p.similarity, 0);
  const normalizedScore =
    maxPossible > 0
      ? Math.max(0, Math.min(1, totalSimilarity / maxPossible))
      : 1.0;

  return {
    score: normalizedScore,
    pairs,
    totalCost: dp[m][n],
  };
}

// ── Word-Level Alignment ─────────────────────────────────────────────

/**
 * Align two words by looking up their phonemes and running alignment.
 * Returns the alignment result or null if either word isn't in the dictionary.
 *
 * @param expectedPhonemes - Phoneme sequence for the expected word
 * @param actualPhonemes - Phoneme sequence for the recognized word
 */
export function alignWords(
  expectedPhonemes: string[],
  actualPhonemes: string[]
): AlignmentResult {
  return alignPhonemes(expectedPhonemes, actualPhonemes);
}

// ── Sentence-Level Alignment ─────────────────────────────────────────

/**
 * Align two full phoneme sequences (from entire sentences).
 * Use this for overall pronunciation comparison.
 */
export function alignSentencePhonemes(
  expectedPhonemes: string[],
  actualPhonemes: string[]
): AlignmentResult {
  return alignPhonemes(expectedPhonemes, actualPhonemes);
}

// ── Stress Comparison ────────────────────────────────────────────────

/**
 * Compare stress patterns on aligned vowels.
 * Returns a penalty (0 = perfect, negative = stress errors).
 *
 * @param pairs - Aligned phoneme pairs from alignPhonemes
 * @returns Object with stress accuracy and penalty details
 */
export function compareStress(pairs: AlignmentPair[]): {
  stressCorrect: boolean;
  stressPenalty: number;
  errors: { expected: string; actual: string; position: number }[];
} {
  const errors: { expected: string; actual: string; position: number }[] = [];
  let penalty = 0;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (pair.status !== "match" && pair.status !== "substitution") continue;
    if (!pair.expected || !pair.actual) continue;

    const expectedStress = pair.expected.match(/([012])$/);
    const actualStress = pair.actual.match(/([012])$/);

    if (expectedStress && actualStress) {
      const exp = parseInt(expectedStress[1], 10);
      const act = parseInt(actualStress[1], 10);

      if (exp !== act) {
        // Primary stress error is more severe
        const severity = exp === 1 ? 10 : 5;
        penalty -= severity;
        errors.push({
          expected: pair.expected,
          actual: pair.actual,
          position: i,
        });
      }
    }
  }

  return {
    stressCorrect: errors.length === 0,
    stressPenalty: penalty,
    errors,
  };
}
