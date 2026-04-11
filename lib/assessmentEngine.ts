/**
 * Assessment Engine — the core scorer for the offline phoneme-level assessment.
 *
 * Orchestrates: content checking → pronunciation scoring → fluency analysis
 * Primary path uses Whisper results (per-word confidence + timestamps).
 * Fallback path uses expo-speech-recognition transcript + overall confidence.
 */

import type {
  AssessmentResult,
  WhisperResult,
  WhisperSegment,
  WordResult,
  PhonemeResult,
  ProblemSound,
} from "@/types/assessment";
import { lookupWord } from "./cmuDictionary";
import { alignWords } from "./phonemeAlignment";
import {
  toIPA,
  getTip,
} from "./phonemeData";
import {
  ASSESSMENT_CONFIG,
  confidenceToPronunciationScore,
} from "./config";
import { generateDescription, generateReflection } from "./feedbackGenerator";

// ── Text Normalization ───────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?'";:\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toWords(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}


// ── Word Matching ────────────────────────────────────────────────────

interface WordMatch {
  expectedWord: string;
  actualWord: string | null; // null = missing
  isMatch: boolean;
  whisperConfidence: number;
}

/**
 * Match expected words against recognized words.
 * Uses greedy left-to-right matching with tolerance for minor order shifts.
 */
function matchWords(
  expectedWords: string[],
  segments: WhisperSegment[]
): WordMatch[] {
  const actualWords = segments.map((s) => normalize(s.word));
  const actualUsed = new Array(actualWords.length).fill(false);

  return expectedWords.map((expWord) => {
    const normExp = normalize(expWord);

    // Find best matching actual word (prefer exact match, then closest position)
    let bestIdx = -1;
    for (let i = 0; i < actualWords.length; i++) {
      if (actualUsed[i]) continue;
      if (actualWords[i] === normExp) {
        bestIdx = i;
        break;
      }
    }

    if (bestIdx >= 0) {
      actualUsed[bestIdx] = true;
      return {
        expectedWord: expWord,
        actualWord: segments[bestIdx].word,
        isMatch: true,
        whisperConfidence: segments[bestIdx].confidence,
      };
    }

    // No exact match — find closest by position (for word substitutions)
    for (let i = 0; i < actualWords.length; i++) {
      if (!actualUsed[i]) {
        actualUsed[i] = true;
        return {
          expectedWord: expWord,
          actualWord: segments[i].word,
          isMatch: false,
          whisperConfidence: segments[i].confidence,
        };
      }
    }

    // Word completely missing
    return {
      expectedWord: expWord,
      actualWord: null,
      isMatch: false,
      whisperConfidence: 0,
    };
  });
}

// ── Score a Single Word ──────────────────────────────────────────────

function scoreWord(match: WordMatch): WordResult {
  const { expectedWord, actualWord, isMatch, whisperConfidence } = match;

  // Missing word
  if (!actualWord) {
    const expectedPhonemes = lookupWord(expectedWord)?.[0] ?? [];
    return {
      word: expectedWord,
      qualityScore: 0,
      status: "missing",
      phonemes: expectedPhonemes.map((p) => ({
        phoneme: toIPA(p),
        arpabet: p,
        qualityScore: 0,
        status: "missing",
        tip: getTip(p),
      })),
      whisperConfidence: 0,
    };
  }

  // Words match — use confidence as pronunciation proxy
  if (isMatch) {
    const pronScore = confidenceToPronunciationScore(whisperConfidence);
    const expectedPhonemes = lookupWord(expectedWord)?.[0] ?? [];

    return {
      word: expectedWord,
      qualityScore: pronScore,
      status: pronScore >= 70 ? "correct" : "mispronounced",
      phonemes: expectedPhonemes.map((p) => ({
        phoneme: toIPA(p),
        arpabet: p,
        qualityScore: pronScore, // Distribute confidence across phonemes
        status: pronScore >= 70 ? "correct" : "substitution",
      })),
      whisperConfidence,
    };
  }

  // Words differ — run phoneme alignment to find specific differences
  const expectedPhonemes = lookupWord(expectedWord)?.[0] ?? [];
  const actualPhonemes = lookupWord(actualWord)?.[0] ?? [];

  if (expectedPhonemes.length === 0 || actualPhonemes.length === 0) {
    // Dictionary miss — fall back to word-level scoring
    return {
      word: expectedWord,
      qualityScore: 20,
      status: "mispronounced",
      phonemes: [],
      whisperConfidence,
    };
  }

  const alignment = alignWords(expectedPhonemes, actualPhonemes);

  const phonemeResults: PhonemeResult[] = alignment.pairs.map((pair) => {
    if (pair.status === "match") {
      return {
        phoneme: toIPA(pair.expected!),
        arpabet: pair.expected!,
        qualityScore: 100,
        status: "correct",
      };
    }
    if (pair.status === "substitution") {
      const score = Math.round(pair.similarity * 100);
      return {
        phoneme: toIPA(pair.expected!),
        arpabet: pair.expected!,
        qualityScore: score,
        status: "substitution",
        soundMostLike: toIPA(pair.actual!),
        tip: getTip(pair.expected!),
      };
    }
    if (pair.status === "deletion") {
      return {
        phoneme: toIPA(pair.expected!),
        arpabet: pair.expected!,
        qualityScore: 0,
        status: "missing",
        tip: getTip(pair.expected!),
      };
    }
    // Insertion
    return {
      phoneme: toIPA(pair.actual!),
      arpabet: pair.actual!,
      qualityScore: 0,
      status: "extra",
    };
  });

  const avgScore =
    phonemeResults.length > 0
      ? phonemeResults.reduce((s, p) => s + p.qualityScore, 0) /
        phonemeResults.length
      : 0;

  return {
    word: expectedWord,
    qualityScore: Math.round(avgScore),
    status: avgScore >= 70 ? "correct" : "mispronounced",
    phonemes: phonemeResults,
    whisperConfidence,
  };
}

// ── Fuzzy Word Helpers ───────────────────────────────────────────────

function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i, ...Array(n).fill(0)];
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Returns true when two normalized words are close enough to count as a match.
 * Covers common inflections (-s/-es/-ing/-ed) and 1-char edit distance for
 * words of length ≥ 4 (short stop words like "a"/"an" are kept strict).
 */
function wordsClose(a: string, b: string): boolean {
  if (a === b) return true;
  // Require both words to be ≥ 2 chars before applying suffix rules.
  // Without this guard, single-char words like "I" (length 1) incorrectly
  // match "is" via the "i" + "s" suffix path, inflating content scores.
  if (a.length >= 2 && b.length >= 2) {
    for (const suffix of ["s", "es", "ing", "ed"]) {
      if (a + suffix === b || b + suffix === a) return true;
    }
  }
  if (a.length >= 4 && b.length >= 4) return editDistance(a, b) <= 1;
  return false;
}

// ── Content Score ────────────────────────────────────────────────────

function computeContentScore(
  expectedWords: string[],
  spokenWords: string[],
  acceptableAnswers?: string[]
): { score: number; feedback: string } {
  const normExpected = expectedWords.map(normalize);
  const normSpoken = spokenWords.map(normalize);

  // Check exact match first
  if (normExpected.join(" ") === normSpoken.join(" ")) {
    return { score: 100, feedback: "You said exactly the right answer!" };
  }

  // Check acceptable alternatives
  if (acceptableAnswers) {
    for (const alt of acceptableAnswers) {
      const normAlt = toWords(alt);
      if (normAlt.join(" ") === normSpoken.join(" ")) {
        return { score: 100, feedback: "You said exactly the right answer!" };
      }
    }
  }

  // Word overlap scoring (fuzzy — covers inflections and 1-char mishears)
  const matched = normSpoken.filter((w) => normExpected.some((e) => wordsClose(w, e)));
  const overlap =
    normExpected.length > 0 ? matched.length / normExpected.length : 0;
  let score = Math.round(overlap * 100);

  // Also try each acceptable alternative with fuzzy matching — take the best score
  if (acceptableAnswers) {
    for (const alt of acceptableAnswers) {
      const altWords = toWords(alt);
      const altMatched = normSpoken.filter((w) => altWords.some((e) => wordsClose(w, e)));
      const altScore =
        altWords.length > 0 ? Math.round((altMatched.length / altWords.length) * 100) : 0;
      if (altScore > score) score = altScore;
    }
  }

  if (score >= 90) return { score, feedback: "Almost perfect — just a tiny difference!" };
  if (score >= 70) return { score, feedback: "You got most of the words right!" };
  if (score >= 50) return { score, feedback: "You got some of the words. Listen and try again!" };
  return { score, feedback: "That wasn't quite right. Listen to the correct answer and try again." };
}

// ── Fluency Score ────────────────────────────────────────────────────

function computeFluencyScore(
  expectedWordCount: number,
  segments: WhisperSegment[]
): number {
  if (segments.length === 0) return 0;

  // Word count ratio — penalize too many or too few words
  const ratio = segments.length / Math.max(expectedWordCount, 1);
  const countScore = ratio >= 0.8 && ratio <= 1.3 ? 100 : Math.max(0, 100 - Math.abs(1 - ratio) * 80);

  // Pause analysis — long gaps between words indicate hesitation
  let pausePenalty = 0;
  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].start - segments[i - 1].end;
    if (gap > 1.5) pausePenalty += 15; // Very long pause
    else if (gap > 0.8) pausePenalty += 8; // Noticeable pause
    else if (gap > 0.5) pausePenalty += 3; // Slight hesitation
  }

  // Average confidence as fluency indicator
  const avgConf =
    segments.reduce((sum, s) => sum + s.confidence, 0) / segments.length;
  const confScore = avgConf * 100;

  return Math.round(
    Math.max(0, Math.min(100, (countScore * 0.4 + confScore * 0.4 + (100 - pausePenalty) * 0.2)))
  );
}

// ── Extract Problem Sounds ───────────────────────────────────────────

function extractProblemSounds(wordResults: WordResult[]): ProblemSound[] {
  const problems: ProblemSound[] = [];
  const seen = new Set<string>();

  for (const wr of wordResults) {
    for (const pr of wr.phonemes) {
      if (
        (pr.status === "substitution" || pr.status === "missing") &&
        pr.qualityScore < 60 &&
        !seen.has(pr.arpabet)
      ) {
        seen.add(pr.arpabet);
        problems.push({
          phoneme: pr.phoneme,
          soundMostLike: pr.soundMostLike ?? "—",
          tip: pr.tip ?? getTip(pr.arpabet),
          word: wr.word,
        });
      }
    }
  }

  return problems.slice(0, 3); // Max 3 problem sounds (don't overwhelm kids)
}

// ── Pass Threshold ───────────────────────────────────────────────────

/**
 * Minimum content score required to pass, adjusted for sentence length.
 * The flat 80% rule is degenerate for short sentences: 4 words × 80% = 3.2,
 * so ALL 4 words must match. We allow 1 miss for sentences of 3-5 words.
 * Sentences of 6+ words use the standard 80%.
 *
 * Results: 3w→67%, 4w→75%, 5w→80%, 6+w→80%
 */
function contentPassThreshold(wordCount: number): number {
  if (wordCount <= 2) return 100;
  if (wordCount <= 5) return Math.ceil(((wordCount - 1) / wordCount) * 100);
  return 80;
}

// ── Main Assessment Function (Whisper) ───────────────────────────────

/**
 * Assess a student's spoken answer using Whisper results.
 * This is the primary assessment path with per-word confidence.
 */
export function assessAnswer(
  whisperResult: WhisperResult,
  expected: string,
  acceptableAnswers?: string[],
  questionType?: string,
  attemptCount: number = 0,
  storyHint?: string
): AssessmentResult {
  const expectedWords = toWords(expected);
  const spokenWords = toWords(whisperResult.text);

  // ── Yes/No shortcut for identify questions ──
  if (questionType === "identify") {
    return assessYesNo(whisperResult.text, expected, attemptCount);
  }

  // ── Guard: single hallucinated word with near-zero content match ──
  // Whisper occasionally returns a one-word phrase for near-silent audio
  // (e.g., "Yeah", "Hmm"). These pass the hallucination-keyword filter but
  // produce a meaningless score. Treat as no-speech: return a clearly-failed
  // result with contentScore 0 so the caller can show the no-speech banner.
  if (spokenWords.length <= 1) {
    const { score: contentScore } = computeContentScore(expectedWords, spokenWords, acceptableAnswers);
    if (contentScore < 30) {
      return buildSimpleResult(false, whisperResult.text, expected);
    }
  }

  // ── Match words ──
  const matches = matchWords(expectedWords, whisperResult.segments);

  // ── Score each word ──
  const wordResults = matches.map(scoreWord);

  // ── Add extra words (said but not expected) ──
  const usedActual = new Set(matches.filter((m) => m.actualWord).map((m) => normalize(m.actualWord!)));
  for (const seg of whisperResult.segments) {
    if (!usedActual.has(normalize(seg.word))) {
      wordResults.push({
        word: seg.word,
        qualityScore: 0,
        status: "extra",
        phonemes: [],
        whisperConfidence: seg.confidence,
      });
    }
  }

  // ── Compute sub-scores ──
  const { score: contentScore, feedback: contentFeedback } =
    computeContentScore(expectedWords, spokenWords, acceptableAnswers);

  const pronunciationScores = wordResults
    .filter((w) => w.status !== "extra")
    .map((w) => w.qualityScore);
  const pronunciationScore =
    pronunciationScores.length > 0
      ? Math.round(
          pronunciationScores.reduce((a, b) => a + b, 0) /
            pronunciationScores.length
        )
      : 0;

  const fluencyScore = computeFluencyScore(
    expectedWords.length,
    whisperResult.segments
  );

  // ── Overall score ──
  // overallScore is used for display/stats/badges — NOT for gating progression.
  // passed is determined by contentScore only: if the student said the right
  // words they advance, regardless of pronunciation quality.
  const { contentWeight, pronunciationWeight, fluencyWeight } = ASSESSMENT_CONFIG;
  const rawOverall = Math.round(
    contentScore * contentWeight +
      pronunciationScore * pronunciationWeight +
      fluencyScore * fluencyWeight
  );
  const passed = contentScore >= contentPassThreshold(expectedWords.length);
  // Cap the displayed score when content is clearly wrong so kids/parents
  // don't see a misleadingly high number from pronunciation partial credit.
  const overallScore = contentScore < 50 ? Math.min(rawOverall, contentScore) : rawOverall;

  // ── Problem sounds ──
  const problemSounds = extractProblemSounds(wordResults);

  // ── Pronunciation feedback ──
  const pronunciationFeedback =
    pronunciationScore >= 90
      ? "Your pronunciation was excellent!"
      : pronunciationScore >= 75
        ? "Good pronunciation! A few sounds could be clearer."
        : pronunciationScore >= 60
          ? "Some sounds need practice. Check the tips below!"
          : "Let's work on pronunciation. Listen to the correct version and try again.";

  // ── Hint level ──
  const hintLevel = Math.min(attemptCount, 3) as 0 | 1 | 2 | 3;

  // ── Build result ──
  const result: AssessmentResult = {
    overallScore,
    contentScore,
    pronunciationScore,
    fluencyScore,
    passed,
    wordResults,
    contentFeedback,
    pronunciationFeedback,
    problemSounds,
    description: "", // Filled by feedback generator
    reflection: {
      strengths: [],
      areasToImprove: [],
      practiceExercise: "",
      encouragement: "",
    },
    hintLevel,
    source: "whisper",
    timestamp: Date.now(),
    spokenText: whisperResult.text.trim(),
  };

  // Generate dynamic feedback
  result.description = generateDescription(result, expected, whisperResult.text, storyHint);
  result.reflection = generateReflection(result, attemptCount, storyHint);

  return result;
}

// ── Yes/No Assessment ────────────────────────────────────────────────

function assessYesNo(
  spoken: string,
  expected: string,
  attemptCount: number
): AssessmentResult {
  const normSpoken = normalize(spoken);
  const normExpected = normalize(expected);
  const isYes = normExpected.startsWith("yes");
  const correct = isYes
    ? normSpoken === "yes" || normSpoken.startsWith("yes")
    : normSpoken === "no" || normSpoken.startsWith("no");

  const score = correct ? 100 : 0;
  const result: AssessmentResult = {
    overallScore: score,
    contentScore: score,
    pronunciationScore: score,
    fluencyScore: score,
    passed: correct,
    wordResults: [
      {
        word: expected,
        qualityScore: score,
        status: correct ? "correct" : "mispronounced",
        phonemes: [],
      },
    ],
    contentFeedback: correct
      ? "That's right!"
      : `The answer is "${expected}". Try again!`,
    pronunciationFeedback: "",
    problemSounds: [],
    description: correct
      ? `You said "${normSpoken}" — correct!`
      : `You said "${normSpoken}", but the answer is "${expected}".`,
    reflection: {
      strengths: correct ? ["You answered correctly!"] : ["Good try — keep listening!"],
      areasToImprove: correct ? [] : [`The correct answer is "${expected}"`],
      practiceExercise: correct ? "" : `Say "${expected}" clearly`,
      encouragement: correct ? "Great!" : "Listen carefully and try again!",
    },
    hintLevel: Math.min(attemptCount, 3) as 0 | 1 | 2 | 3,
    source: "whisper",
    timestamp: Date.now(),
  };

  return result;
}

// ── Fallback Assessment (expo-speech-recognition) ────────────────────

/**
 * Fallback assessment when Whisper is not available.
 * Uses expo-speech-recognition transcript + overall confidence.
 * Less detailed but still functional.
 */
export function assessAnswerFallback(
  transcript: string,
  confidence: number,
  expected: string,
  acceptableAnswers?: string[],
  questionType?: string,
  attemptCount: number = 0,
  storyHint?: string
): AssessmentResult {
  const expectedWords = toWords(expected);
  const spokenWords = toWords(transcript);

  if (questionType === "identify") {
    return assessYesNo(transcript, expected, attemptCount);
  }

  // Content score
  const { score: contentScore, feedback: contentFeedback } =
    computeContentScore(expectedWords, spokenWords, acceptableAnswers);

  // Pronunciation score from overall confidence
  const pronunciationScore = confidenceToPronunciationScore(confidence);

  // Simple fluency from word count ratio
  const ratio = spokenWords.length / Math.max(expectedWords.length, 1);
  const fluencyScore = Math.round(
    Math.max(0, Math.min(100, 100 - Math.abs(1 - ratio) * 50)) *
      confidence
  );

  // Word results without phoneme detail (no per-word data in fallback)
  const wordResults: WordResult[] = expectedWords.map((word) => {
    const spoken = spokenWords.includes(normalize(word));
    return {
      word,
      qualityScore: spoken
        ? confidenceToPronunciationScore(confidence)
        : 0,
      status: spoken ? "correct" : "missing",
      phonemes: [], // No phoneme detail in fallback
    };
  });

  const { contentWeight, pronunciationWeight, fluencyWeight } = ASSESSMENT_CONFIG;
  const overallScore = Math.round(
    contentScore * contentWeight +
      pronunciationScore * pronunciationWeight +
      fluencyScore * fluencyWeight
  );

  const hintLevel = Math.min(attemptCount, 3) as 0 | 1 | 2 | 3;

  const result: AssessmentResult = {
    overallScore,
    contentScore,
    pronunciationScore,
    fluencyScore,
    // Content gates progression — student passes if they said the right words.
    passed: contentScore >= contentPassThreshold(expectedWords.length),
    wordResults,
    contentFeedback,
    pronunciationFeedback:
      pronunciationScore >= 80
        ? "Good pronunciation!"
        : "Try to speak more clearly.",
    problemSounds: [],
    description: "",
    reflection: {
      strengths: [],
      areasToImprove: [],
      practiceExercise: "",
      encouragement: "",
    },
    hintLevel,
    source: "fallback-local",
    timestamp: Date.now(),
    spokenText: transcript.trim(),
  };

  result.description = generateDescription(result, expected, transcript, storyHint);
  result.reflection = generateReflection(result, attemptCount, storyHint);

  return result;
}


/**
 * Build a minimal AssessmentResult for identify (YES/NO) questions.
 * No phoneme breakdown — just pass/fail with a simple message.
 */
export function buildSimpleResult(
  passed: boolean,
  transcript: string,
  expected: string
): AssessmentResult {
  return {
    overallScore: passed ? 100 : 0,
    contentScore: passed ? 100 : 0,
    pronunciationScore: passed ? 100 : 0,
    fluencyScore: 100,
    passed,
    wordResults: [],
    contentFeedback: passed ? "Correct!" : `Expected "${expected}"`,
    pronunciationFeedback: "",
    problemSounds: [],
    description: passed
      ? "Great! You got it right."
      : `You said "${transcript || "nothing"}" — the answer was "${expected}".`,
    reflection: {
      strengths: passed ? ["You answered correctly!"] : [],
      areasToImprove: passed ? [] : ["Listen carefully and try again."],
      practiceExercise: "",
      encouragement: passed ? "Keep it up!" : "You'll get it next time!",
    },
    hintLevel: 0,
    source: "simple",
    timestamp: Date.now(),
  };
}
