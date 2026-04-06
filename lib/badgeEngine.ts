import type { BadgeCondition, EarnedBadge } from "@/types/badges";
import type { GameState, ChapterId } from "@/store/gameStore";
import { badges } from "@/lib/badgesData";
import { chapters } from "@/lib/chaptersData";

const CHAPTER_IDS: ChapterId[] = [1, 2, 3, 4, 5];

/**
 * Pure function: given current game state and already-earned badges,
 * returns array of badge IDs that are newly earned.
 */
export function evaluateBadges(
  state: GameState,
  earnedBadges: EarnedBadge[]
): string[] {
  const alreadyEarned = new Set(earnedBadges.map((b) => b.id));
  const newlyEarned: string[] = [];

  for (const badge of badges) {
    if (alreadyEarned.has(badge.id)) continue;
    if (badge.conditions.every((c) => checkCondition(c, state))) {
      newlyEarned.push(badge.id);
    }
  }

  return newlyEarned;
}

function checkCondition(c: BadgeCondition, state: GameState): boolean {
  const { chapterProgress: progress } = state;

  switch (c.type) {
    case "chapters_completed": {
      const count = CHAPTER_IDS.filter((id) => progress[id].completed).length;
      return count >= (c.value ?? 1);
    }

    case "chapter_completed":
      return progress[c.chapterId as ChapterId]?.completed ?? false;

    case "all_chapters_completed":
      return CHAPTER_IDS.every((id) => progress[id].completed);

    case "pronunciation_avg": {
      for (const chId of CHAPTER_IDS) {
        if (!progress[chId].completed) continue;
        const scores = Object.entries(state.questionScores)
          .filter(([key]) => key.startsWith(`${chId}-`))
          .map(([, r]) => r.pronunciationScore);
        if (scores.length === 0) continue;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= (c.value ?? 90)) return true;
      }
      return false;
    }

    case "question_score":
      return Object.values(state.questionScores).some(
        (r) => r.overallScore >= (c.value ?? 90)
      );

    case "streak":
      return state.streak >= (c.value ?? 1);

    case "first_try_chapter": {
      for (const chId of CHAPTER_IDS) {
        if (!progress[chId].completed) continue;
        const chapter = chapters.find((c) => c.id === chId);
        const keys = Object.keys(state.attemptCounts).filter((k) =>
          k.startsWith(`${chId}-`)
        );
        if (!chapter || keys.length < chapter.questions.length) continue;
        if (keys.every((k) => state.attemptCounts[k] === 1)) return true;
      }
      return false;
    }

    case "problem_phonemes_zero":
      return (
        CHAPTER_IDS.some((id) => progress[id].completed) &&
        state.problemPhonemes.length === 0
      );

    default:
      return false;
  }
}
