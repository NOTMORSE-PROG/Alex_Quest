/**
 * Dynamic Feedback Generator.
 *
 * Generates natural-language descriptions and reflections based on actual
 * assessment results. NOT canned messages — references the specific words,
 * phonemes, and scores from the student's speech.
 */

import type { AssessmentResult, Reflection } from "@/types/assessment";

// ── Template Variation ──────────────────────────────���────────────────

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

// ── Description Generator ──────────────────────────────���─────────────

/**
 * Generate a natural-language description of what happened.
 * References actual words, sounds, and errors.
 * storyHint is shown instead of missing-word reveals on early attempts (hintLevel < 2).
 */
export function generateDescription(
  result: AssessmentResult,
  expected: string,
  spoken: string,
  storyHint?: string
): string {
  const { overallScore, wordResults, contentScore, pronunciationScore } = result;

  // Perfect or near-perfect
  if (overallScore >= 95) {
    return pick([
      `You said "${spoken}" — perfect! Every word was clear and correct.`,
      `Excellent! You pronounced "${expected}" perfectly!`,
      `"${spoken}" — spot on! Great pronunciation!`,
    ]);
  }

  if (overallScore >= 80) {
    const weakWords = wordResults.filter(
      (w) => w.status === "mispronounced" && w.qualityScore < 80
    );
    if (weakWords.length > 0) {
      const weakWord = weakWords[0];
      return `You got the right answer! The word "${weakWord.word}" could be a bit clearer, but you passed!`;
    }
    return pick([
      `You said "${spoken}" — great job! Just a small room for improvement.`,
      `Nice work! Your pronunciation of "${expected}" was solid!`,
    ]);
  }

  // Didn't pass — build detailed description
  const parts: string[] = [];
  parts.push(`You said "${spoken}".`);

  // Content errors
  const missingWords = wordResults.filter((w) => w.status === "missing");
  const extraWords = wordResults.filter((w) => w.status === "extra");
  const mispronounced = wordResults.filter(
    (w) => w.status === "mispronounced"
  );

  if (contentScore < 60) {
    if (result.hintLevel >= 2) {
      // 3rd+ attempt: full reveal of what was missing/extra
      if (missingWords.length > 0) {
        const missing = missingWords.map((w) => `"${w.word}"`).join(", ");
        parts.push(`You missed: ${missing}.`);
      }
      if (extraWords.length > 0) {
        const extra = extraWords.map((w) => `"${w.word}"`).join(", ");
        parts.push(`Extra words: ${extra}.`);
      }
    } else {
      // 1st or 2nd attempt: no word reveals — nudge toward the story instead
      parts.push(storyHint ?? "Your answer wasn't quite right — try again!");
    }
  }

  // Pronunciation errors
  if (pronunciationScore < 70 && mispronounced.length > 0) {
    const word = mispronounced[0];
    const badPhonemes = word.phonemes.filter(
      (p) => p.status === "substitution" && p.soundMostLike
    );
    if (badPhonemes.length > 0) {
      const bp = badPhonemes[0];
      parts.push(
        `In "${word.word}", the ${bp.phoneme} sound came out more like ${bp.soundMostLike}.`
      );
    } else {
      parts.push(`The word "${word.word}" needs clearer pronunciation.`);
    }
  }

  return parts.join(" ");
}

// ── Reflection Generator ─────────────────────────────────────────────

/**
 * Generate personalized reflection with strengths, improvement areas,
 * practice exercise, and encouragement.
 */
export function generateReflection(
  result: AssessmentResult,
  attemptCount: number,
  storyHint?: string
): Reflection {
  return {
    strengths: generateStrengths(result),
    areasToImprove: generateAreasToImprove(result, storyHint),
    practiceExercise: generatePracticeExercise(result),
    encouragement: generateEncouragement(result, attemptCount),
  };
}

// ── Strengths ──────────────────────────────────────────────────���─────

function generateStrengths(result: AssessmentResult): string[] {
  const strengths: string[] = [];
  const { wordResults, contentScore, pronunciationScore } = result;

  // Always find at least one positive thing
  const correctWords = wordResults.filter(
    (w) => w.status === "correct" && w.qualityScore >= 80
  );

  if (contentScore >= 90) {
    strengths.push("You said all the right words!");
  } else if (contentScore >= 60) {
    strengths.push("You got most of the words right!");
  }

  if (pronunciationScore >= 85) {
    strengths.push("Your pronunciation was very clear!");
  }

  if (correctWords.length > 0) {
    const examples = correctWords
      .slice(0, 2)
      .map((w) => `"${w.word}"`)
      .join(" and ");
    strengths.push(`You pronounced ${examples} well!`);
  }

  // Find well-pronounced phonemes
  const goodPhonemes = wordResults
    .flatMap((w) => w.phonemes)
    .filter((p) => p.status === "correct" && p.qualityScore >= 85);
  if (goodPhonemes.length >= 3 && strengths.length < 2) {
    const uniqueSounds = [...new Set(goodPhonemes.map((p) => p.phoneme))].slice(0, 3);
    strengths.push(`Your ${uniqueSounds.join(", ")} sounds were clear!`);
  }

  // Guarantee at least one strength
  if (strengths.length === 0) {
    strengths.push(
      pick([
        "You tried — that takes courage!",
        "You're making an effort, and that's what matters!",
        "Good try! Every attempt makes you better!",
      ])
    );
  }

  return strengths.slice(0, 3);
}

// ── Areas to Improve ─────────────────────────────────────────────────

function generateAreasToImprove(result: AssessmentResult, storyHint?: string): string[] {
  const areas: string[] = [];
  const { problemSounds, wordResults, contentScore } = result;

  // Content issues first — gate target-word reveal to hintLevel >= 2 (3rd+ attempt)
  const missingWords = wordResults.filter((w) => w.status === "missing");
  if (missingWords.length > 0 && contentScore < 80) {
    if (result.hintLevel >= 2) {
      areas.push(`Make sure to include "${missingWords[0].word}" in your answer`);
    } else {
      areas.push(storyHint ? `Think about the story — ${storyHint}` : "Try to say the complete sentence clearly");
    }
  }

  // Pronunciation issues — specific phoneme tips
  for (const ps of problemSounds.slice(0, 2)) {
    if (ps.soundMostLike && ps.soundMostLike !== "—") {
      areas.push(
        `Practice the ${ps.phoneme} sound in "${ps.word}" — ${ps.tip}`
      );
    } else {
      areas.push(`Practice the ${ps.phoneme} sound — ${ps.tip}`);
    }
  }

  // General pronunciation tip if no specific phonemes identified
  if (areas.length === 0 && result.pronunciationScore < 80) {
    areas.push("Try speaking more slowly and clearly");
  }

  return areas.slice(0, 3);
}

// ── Practice Exercise ────────────────────────────────────────────────

function generatePracticeExercise(result: AssessmentResult): string {
  const { problemSounds, wordResults, contentScore } = result;

  // If content was wrong, suggest full sentence practice
  // Only mention "Listen to the correct answer" once the Listen button is available (hintLevel >= 2)
  if (contentScore < 60) {
    return result.hintLevel >= 2
      ? "Listen to the correct answer, then try saying the whole sentence slowly"
      : "Try saying the whole sentence again, slowly and clearly";
  }

  // If specific phoneme problem, isolate the word
  if (problemSounds.length > 0) {
    const ps = problemSounds[0];
    return `Try saying just the word "${ps.word}" three times slowly: "${ps.word}... ${ps.word}... ${ps.word}..."`;
  }

  // Pronunciation issues — find weakest word
  const weakWords = wordResults
    .filter((w) => w.status === "mispronounced")
    .sort((a, b) => a.qualityScore - b.qualityScore);

  if (weakWords.length > 0) {
    const word = weakWords[0].word;
    return `Focus on the word "${word}" — say it slowly and clearly a few times`;
  }

  return "Try the whole sentence again, speaking slowly and clearly";
}

// ── Encouragement ────────────────────────────────────────────────────

function generateEncouragement(
  result: AssessmentResult,
  attemptCount: number
): string {
  const { overallScore, passed } = result;

  if (passed) {
    return pick([
      "You did it! Keep up the great work!",
      "Fantastic job! You're getting really good at this!",
      "Well done! You should be proud!",
    ]);
  }

  // Progress-aware encouragement
  if (attemptCount >= 3) {
    return pick([
      "Don't give up — you're so close! Listen to the answer one more time.",
      "You're learning with every try. One more attempt!",
    ]);
  }

  if (attemptCount >= 1) {
    if (overallScore >= 60) {
      return pick([
        `You scored ${overallScore}% — almost there! You need 80% to pass.`,
        `Getting closer! ${80 - overallScore} more points and you've got it!`,
        "You're improving! Try one more time!",
      ]);
    }
    return pick([
      "Keep practicing! Listen carefully and try again.",
      "Every try makes you better. You've got this!",
    ]);
  }

  // First attempt
  if (overallScore >= 60) {
    return `Good first try! You scored ${overallScore}% — need 80% to pass. You're close!`;
  }
  return pick([
    "No worries! Take your time and try again.",
    "Learning takes practice. Think carefully and give it another go!",
  ]);
}
