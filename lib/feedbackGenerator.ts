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

// ── Strengths ────────────────────────────────────────────────────────

function generateStrengths(result: AssessmentResult): string[] {
  const strengths: string[] = [];
  const { wordResults, contentScore, pronunciationScore } = result;

  const correctWords = wordResults.filter(
    (w) => w.status === "correct" && w.qualityScore >= 80
  );

  // Content score tier
  if (contentScore >= 90) {
    strengths.push(pick([
      "You said all the right words!",
      "Every word was exactly right — great job!",
      "You nailed the whole sentence!",
      "Perfect word choice — you got them all!",
    ]));
  } else if (contentScore >= 70) {
    strengths.push(pick([
      "You got most of the words right!",
      "Almost the full sentence — really close!",
      "Most of your words were spot on!",
      "You said the majority of the sentence correctly!",
    ]));
  } else if (contentScore >= 50) {
    strengths.push(pick([
      "You got some of the words right!",
      "A few of your words matched — keep going!",
      "You're on the right track with some words!",
    ]));
  }

  // Pronunciation quality
  if (pronunciationScore >= 90) {
    strengths.push(pick([
      "Your pronunciation was excellent!",
      "Your sounds were super clear!",
      "You spoke very clearly — great pronunciation!",
      "Your mouth movements were spot on!",
    ]));
  } else if (pronunciationScore >= 75) {
    strengths.push(pick([
      "Your pronunciation was pretty clear!",
      "Most of your sounds came out really well!",
      "Nice and clear speech overall!",
    ]));
  }

  // Specific correct words highlight
  if (correctWords.length >= 2) {
    const examples = correctWords.slice(0, 2).map((w) => `"${w.word}"`).join(" and ");
    strengths.push(pick([
      `You pronounced ${examples} really well!`,
      `Great job on ${examples}!`,
      `${examples} sounded clear and correct!`,
      `You nailed the words ${examples}!`,
    ]));
  } else if (correctWords.length === 1) {
    const w = correctWords[0].word;
    strengths.push(pick([
      `You pronounced "${w}" really well!`,
      `"${w}" sounded great!`,
      `Nice work on the word "${w}"!`,
    ]));
  }

  // Well-pronounced phonemes
  const goodPhonemes = wordResults
    .flatMap((w) => w.phonemes)
    .filter((p) => p.status === "correct" && p.qualityScore >= 85);
  if (goodPhonemes.length >= 3 && strengths.length < 2) {
    const uniqueSounds = [...new Set(goodPhonemes.map((p) => p.phoneme))].slice(0, 3);
    strengths.push(pick([
      `Your ${uniqueSounds.join(", ")} sounds were really clear!`,
      `The ${uniqueSounds.join(", ")} sounds came out great!`,
      `Nice work on the ${uniqueSounds.join(", ")} sounds!`,
    ]));
  }

  // Fallback — always guarantee at least one strength
  if (strengths.length === 0) {
    strengths.push(pick([
      "You tried — that takes courage!",
      "You're making an effort, and that's what matters!",
      "Good try! Every attempt makes you better!",
      "Brave attempt! Keep going!",
      "You showed up and tried — that's the first step!",
      "It's not easy, but you're doing it! Keep going!",
      "Practice makes perfect — you're on your way!",
    ]));
  }

  return strengths.slice(0, 3);
}

// ── Areas to Improve ─────────────────────────────────────────────────

function generateAreasToImprove(result: AssessmentResult, storyHint?: string): string[] {
  const areas: string[] = [];
  const { problemSounds, wordResults, contentScore } = result;

  // Content issues — gate target-word reveal to hintLevel >= 2 (3rd+ attempt)
  const missingWords = wordResults.filter((w) => w.status === "missing");
  if (missingWords.length > 0 && contentScore < 80) {
    if (result.hintLevel >= 2) {
      const mw = missingWords[0].word;
      areas.push(pick([
        `Make sure to include "${mw}" in your answer`,
        `Don't forget to say "${mw}"`,
        `Try adding the word "${mw}" to your sentence`,
        `"${mw}" was missing — try to work it in!`,
      ]));
    } else {
      areas.push(storyHint
        ? pick([
            `Think about the story — ${storyHint}`,
            `Use the story as a hint — ${storyHint}`,
          ])
        : pick([
            "Try to say the complete sentence clearly",
            "Make sure you say every part of the sentence",
            "Try including all the words in your answer",
            "Think through the full sentence before you speak",
          ])
      );
    }
  }

  // Pronunciation issues — specific phoneme tips
  for (const ps of problemSounds.slice(0, 2)) {
    const displayWord = ps.actualWord ?? ps.word;
    if (ps.soundMostLike && ps.soundMostLike !== "—") {
      areas.push(pick([
        `Practice the /${ps.phoneme}/ sound in "${displayWord}" — ${ps.tip}`,
        `The /${ps.phoneme}/ in "${displayWord}" needs work — ${ps.tip}`,
        `Work on the /${ps.phoneme}/ sound: ${ps.tip}`,
        `In "${displayWord}", focus on the /${ps.phoneme}/ — ${ps.tip}`,
      ]));
    } else {
      areas.push(pick([
        `Practice the /${ps.phoneme}/ sound — ${ps.tip}`,
        `Work on your /${ps.phoneme}/ — ${ps.tip}`,
        `The /${ps.phoneme}/ sound needs attention — ${ps.tip}`,
      ]));
    }
  }

  // General pronunciation tip when no specific phonemes flagged
  if (areas.length === 0 && result.pronunciationScore < 80) {
    areas.push(pick([
      "Try speaking more slowly and clearly",
      "Slow down a little and focus on each sound",
      "Say each word carefully — don't rush",
      "Take a breath and say each word one at a time",
      "Try exaggerating your mouth movements a bit more",
    ]));
  }

  return areas.slice(0, 3);
}

// ── Practice Exercise ────────────────────────────────────────────────

function generatePracticeExercise(result: AssessmentResult): string {
  const { problemSounds, wordResults, contentScore } = result;

  // Content was wrong — suggest sentence-level practice
  if (contentScore < 60) {
    if (result.hintLevel >= 2) {
      return pick([
        "Listen to the correct answer, then try saying the whole sentence slowly",
        "Play the correct version, then repeat it word by word",
        "Listen once, then say the sentence back slowly and clearly",
        "Try echoing the correct answer — listen, then repeat it out loud",
      ]);
    }
    return pick([
      "Try saying the whole sentence again, slowly and clearly",
      "Take your time and say every word of the sentence",
      "Say it again — go slow and think about each word",
      "Try once more, one word at a time",
      "Breathe, then say the full sentence slowly",
    ]);
  }

  // Specific phoneme problem — isolate the word
  if (problemSounds.length > 0) {
    const ps = problemSounds[0];
    const pw = ps.actualWord ?? ps.word;
    return pick([
      `Try saying just the word "${pw}" three times slowly: "${pw}… ${pw}… ${pw}…"`,
      `Repeat the word "${pw}" out loud three times, nice and slow`,
      `Say "${pw}" by itself a few times — really focus on each sound`,
      `Isolate the word "${pw}" and say it clearly three times`,
      `Practice just "${pw}" — say it slowly, then a little faster each time`,
    ]);
  }

  // Weak mispronounced word — drill it
  const weakWords = wordResults
    .filter((w) => w.status === "mispronounced")
    .sort((a, b) => a.qualityScore - b.qualityScore);

  if (weakWords.length > 0) {
    const word = weakWords[0].actualWord ?? weakWords[0].word;
    return pick([
      `Focus on the word "${word}" — say it slowly and clearly a few times`,
      `Practice "${word}" by itself before saying the full sentence`,
      `Say "${word}" slowly — stretch out each sound, then try the full sentence`,
      `Repeat "${word}" three times, then say the whole sentence`,
      `Zoom in on "${word}" — say it carefully, then add it back to the sentence`,
    ]);
  }

  return pick([
    "Try the whole sentence again, speaking slowly and clearly",
    "One more time — take it slow and say every word clearly",
    "Give it another go — slow and steady!",
    "Try once more, and focus on each word as you say it",
  ]);
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
      "Well done! You should be proud of yourself!",
      "Amazing! You crushed it!",
      "You passed! That hard work is paying off!",
      "Brilliant! Keep that energy going!",
      "Yes! You nailed it — great effort!",
    ]);
  }

  // Progress-aware encouragement
  if (attemptCount >= 3) {
    return pick([
      "Don't give up — you're so close! Listen to the answer one more time.",
      "You're learning with every try. One more attempt!",
      "You've got this — persistence is how champions learn!",
      "So close! Give it one more shot — you can do it!",
      "Every attempt is making you stronger. Try again!",
    ]);
  }

  if (attemptCount >= 1) {
    if (overallScore >= 60) {
      return pick([
        `You scored ${overallScore}% — almost there! You need 80% to pass.`,
        `Getting closer! Just ${80 - overallScore} more points and you've got it!`,
        "You're improving! Try one more time!",
        `${overallScore}% — so close to passing! One more try!`,
        "You're nearly there — keep pushing!",
      ]);
    }
    return pick([
      "Keep practicing! Listen carefully and try again.",
      "Every try makes you better. You've got this!",
      "Don't stop now — you're learning with every attempt!",
      "Stay with it — practice is how you get great at this!",
    ]);
  }

  // First attempt
  if (overallScore >= 60) {
    return pick([
      `Good first try! You scored ${overallScore}% — need 80% to pass. You're close!`,
      `Nice start! ${overallScore}% on your first go — just a little more!`,
      `Great first attempt! A bit more practice and you'll pass!`,
    ]);
  }
  return pick([
    "No worries! Take your time and try again.",
    "Learning takes practice. Think carefully and give it another go!",
    "That's okay! Every first try teaches you something.",
    "Keep going — you'll get there with practice!",
    "Don't worry, just try again — you're still learning!",
  ]);
}
