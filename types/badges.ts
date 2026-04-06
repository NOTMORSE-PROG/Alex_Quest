export type BadgeCategory = "progress" | "mastery" | "streak" | "special";

export type BadgeConditionType =
  | "chapters_completed"
  | "chapter_completed"
  | "all_chapters_completed"
  | "pronunciation_avg"
  | "question_score"
  | "streak"
  | "first_try_chapter"
  | "problem_phonemes_zero";

export interface BadgeCondition {
  /** Which piece of state to evaluate */
  type: BadgeConditionType;
  /** Numeric threshold (e.g., streak >= 3, stars >= 10) */
  value?: number;
  /** Optional scope — which chapter this applies to */
  chapterId?: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  /** Kid-friendly description */
  description: string;
  emoji: string;
  category: BadgeCategory;
  /** All conditions must be true (AND logic) */
  conditions: BadgeCondition[];
  /** Display ordering within category */
  sortOrder: number;
  /** Hidden until earned */
  secret?: boolean;
}

export interface EarnedBadge {
  id: string;
  earnedAt: number;
}
