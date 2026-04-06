import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AssessmentResult } from "@/types/assessment";
import type { EarnedBadge } from "@/types/badges";
import { evaluateBadges } from "@/lib/badgeEngine";
import { chapters } from "@/lib/chaptersData";
import type { VocabEntry } from "@/lib/chaptersData";

// Debounce AsyncStorage writes — batch rapid updates (e.g. per-question score saves)
// into a single write every 3 seconds instead of one write per state change.
let _persistTimer: ReturnType<typeof setTimeout> | null = null;
let _pendingKey: string | null = null;
let _pendingValue: string | null = null;

const debouncedStorage = {
  getItem: (name: string) => AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => {
    _pendingKey = name;
    _pendingValue = value;
    if (_persistTimer) clearTimeout(_persistTimer);
    _persistTimer = setTimeout(() => {
      AsyncStorage.setItem(name, value);
      _persistTimer = null;
    }, 3000);
  },
  removeItem: (name: string) => AsyncStorage.removeItem(name),
};

/**
 * Call this when the app is backgrounded to flush any pending debounced write
 * immediately, preventing data loss on force-quit.
 */
export function flushPendingStorage() {
  if (_persistTimer && _pendingKey && _pendingValue) {
    clearTimeout(_persistTimer);
    _persistTimer = null;
    AsyncStorage.setItem(_pendingKey, _pendingValue);
  }
}

export type ChapterId = 1 | 2 | 3 | 4 | 5;

export interface ChapterProgress {
  completed: boolean;
  /** Problem phonemes captured at chapter completion — used for Sound Master badge */
  problemPhonemes?: string[];
}

export interface GameState {
  // Progress
  currentChapter: ChapterId;
  chapterProgress: Record<ChapterId, ChapterProgress>;
  streak: number;
  lastPlayedDate: string | null;

  // Tutorial/Onboarding
  tutorialCompleted: boolean;
  introWatched: boolean;
  questStarted: boolean;
  vocabSeenToday: boolean;

  // Active gameplay
  activeQuestionIndex: number;
  activeChapterId: ChapterId | null;

  // Assessment tracking
  questionScores: Record<string, AssessmentResult>;
  problemPhonemes: string[];
  attemptCounts: Record<string, number>;

  // Recording paths (chapterId-questionId → file path for playback)
  recordingPaths: Record<string, string>;

  // Word of the Day history: "YYYY-MM-DD" → best score (0-100)
  wotdHistory: Record<string, number>;

  // Badges
  earnedBadges: EarnedBadge[];
  pendingBadgeNotifications: string[];

  // Actions
  setCurrentChapter: (id: ChapterId) => void;
  completeChapter: (id: ChapterId) => void;
  completeTutorial: () => void;
  watchIntro: () => void;
  startQuest: () => void;
  markVocabSeen: () => void;
  setActiveQuestion: (index: number, chapterId: ChapterId) => void;
  saveQuestionScore: (chapterId: number, questionId: number, result: AssessmentResult) => void;
  clearSessionScores: () => void;
  incrementAttemptCount: (chapterId: number, questionId: number) => number;
  decrementAttemptCount: (chapterId: number, questionId: number) => void;
  saveRecordingPath: (chapterId: number, questionId: number, path: string) => void;
  saveWotdScore: (dateKey: string, score: number) => void;
  updateStreak: () => void;
  dismissBadgeNotification: () => void;
  /** @internal — called by other actions after state mutations */
  _evaluateAndAwardBadges: () => void;
  resetGame: () => void;
}

const defaultChapterProgress: Record<ChapterId, ChapterProgress> = {
  1: { completed: false },
  2: { completed: false },
  3: { completed: false },
  4: { completed: false },
  5: { completed: false },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentChapter: 1,
      chapterProgress: { ...defaultChapterProgress },
      streak: 0,
      lastPlayedDate: null,
      tutorialCompleted: false,
      introWatched: false,
      questStarted: false,
      vocabSeenToday: false,
      activeQuestionIndex: 0,
      activeChapterId: null,
      questionScores: {},
      problemPhonemes: [],
      attemptCounts: {},
      recordingPaths: {},
      wotdHistory: {},
      earnedBadges: [],
      pendingBadgeNotifications: [],

      setCurrentChapter: (id) => set({ currentChapter: id }),

      completeChapter: (id) => {
        set((state) => ({
          chapterProgress: {
            ...state.chapterProgress,
            [id]: {
              completed: true,
              // Snapshot problem phonemes at chapter completion for badge evaluation
              problemPhonemes: [...state.problemPhonemes],
            },
          },
          currentChapter:
            id < 5 ? ((id + 1) as ChapterId) : state.currentChapter,
          // Reset problem phonemes for the next chapter session
          problemPhonemes: [],
        }));
        get()._evaluateAndAwardBadges();
      },

      completeTutorial: () => set({ tutorialCompleted: true }),

      watchIntro: () => set({ introWatched: true }),

      startQuest: () => set({ questStarted: true }),

      markVocabSeen: () => set({ vocabSeenToday: true }),

      setActiveQuestion: (index, chapterId) =>
        set({ activeQuestionIndex: index, activeChapterId: chapterId }),

      saveQuestionScore: (chapterId, questionId, result) => {
        set((state) => {
          const key = `${chapterId}-${questionId}`;
          const newScores = { ...state.questionScores, [key]: result };

          // Extract problem phonemes (scored < 60 in substitution/missing)
          const newProblems = new Set(state.problemPhonemes);
          for (const wr of result.wordResults) {
            for (const pr of wr.phonemes) {
              if (
                (pr.status === "substitution" || pr.status === "missing") &&
                pr.qualityScore < 60
              ) {
                newProblems.add(pr.arpabet);
              }
            }
          }

          return {
            questionScores: newScores,
            problemPhonemes: [...newProblems],
          };
        });
        get()._evaluateAndAwardBadges();
      },

      // Kept for explicit reset (e.g. dev tools / debug). Not called on chapter start.
      clearSessionScores: () =>
        set({ questionScores: {}, problemPhonemes: [], attemptCounts: {} }),

      saveRecordingPath: (chapterId, questionId, path) =>
        set((state) => ({
          recordingPaths: {
            ...state.recordingPaths,
            [`${chapterId}-${questionId}`]: path,
          },
        })),

      incrementAttemptCount: (chapterId, questionId) => {
        const key = `${chapterId}-${questionId}`;
        let newCount = 0;
        set((state) => {
          newCount = (state.attemptCounts[key] ?? 0) + 1;
          return {
            attemptCounts: { ...state.attemptCounts, [key]: newCount },
          };
        });
        return newCount;
      },

      decrementAttemptCount: (chapterId, questionId) => {
        const key = `${chapterId}-${questionId}`;
        set((state) => {
          const current = state.attemptCounts[key] ?? 0;
          if (current <= 0) return {};
          return {
            attemptCounts: { ...state.attemptCounts, [key]: current - 1 },
          };
        });
      },

      saveWotdScore: (dateKey, score) =>
        set((state) => {
          const existing = state.wotdHistory[dateKey];
          if (existing !== undefined && existing >= score) return {};
          return { wotdHistory: { ...state.wotdHistory, [dateKey]: score } };
        }),

      updateStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => {
          if (state.lastPlayedDate === today) return {};
          const yesterday = new Date(Date.now() - 86_400_000)
            .toISOString()
            .split("T")[0];
          const newStreak =
            state.lastPlayedDate === yesterday ? state.streak + 1 : 1;
          return {
            streak: newStreak,
            lastPlayedDate: today,
            // Reset daily flags when the date rolls over
            vocabSeenToday: false,
          };
        });
        get()._evaluateAndAwardBadges();
      },

      dismissBadgeNotification: () =>
        set((state) => ({
          pendingBadgeNotifications: state.pendingBadgeNotifications.slice(1),
        })),

      _evaluateAndAwardBadges: () => {
        const state = get();
        const newIds = evaluateBadges(state, state.earnedBadges);
        if (newIds.length === 0) return;
        const now = Date.now();
        set({
          earnedBadges: [
            ...state.earnedBadges,
            ...newIds.map((id) => ({ id, earnedAt: now })),
          ],
          pendingBadgeNotifications: [
            ...state.pendingBadgeNotifications,
            ...newIds,
          ],
        });
      },

      resetGame: () =>
        set({
          currentChapter: 1,
          chapterProgress: { ...defaultChapterProgress },
          streak: 0,
          lastPlayedDate: null,
          tutorialCompleted: false,
          introWatched: false,
          questStarted: false,
          vocabSeenToday: false,
          activeQuestionIndex: 0,
          activeChapterId: null,
          questionScores: {},
          problemPhonemes: [],
          attemptCounts: {},
          recordingPaths: {},
          wotdHistory: {},
          earnedBadges: [],
          pendingBadgeNotifications: [],
        }),
    }),
    {
      name: "alexs-quest-save",
      version: 7,
      storage: createJSONStorage(() => debouncedStorage),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          state.introWatched = false;
        }
        if (version < 3) {
          delete state.hearts;
          delete state.totalXP;
          state.activeChapterId = null;
          if (state.chapterProgress && typeof state.chapterProgress === "object") {
            const cp = state.chapterProgress as Record<string, Record<string, unknown>>;
            for (const ch of Object.values(cp)) {
              delete ch.xpEarned;
            }
          }
        }
        if (version < 4) {
          state.earnedBadges = [];
          state.pendingBadgeNotifications = [];
        }
        if (version < 5) {
          state.wotdHistory = {};
        }
        if (version < 6) {
          delete state.wrongAttempts;
          if (state.chapterProgress && typeof state.chapterProgress === "object") {
            const cp = state.chapterProgress as Record<string, Record<string, unknown>>;
            for (const ch of Object.values(cp)) {
              delete ch.stars;
            }
          }
        }
        if (version < 7) {
          // Add problemPhonemes snapshot field to existing chapter progress entries
          if (state.chapterProgress && typeof state.chapterProgress === "object") {
            const cp = state.chapterProgress as Record<string, Record<string, unknown>>;
            for (const ch of Object.values(cp)) {
              if (ch.problemPhonemes === undefined) {
                ch.problemPhonemes = [];
              }
            }
          }
          // vocabSeenToday default
          if (state.vocabSeenToday === undefined) {
            state.vocabSeenToday = false;
          }
        }
        return state as unknown as GameState;
      },
    }
  )
);

// Derived selectors
export const isChapterUnlocked = (
  id: ChapterId,
  progress: Record<ChapterId, ChapterProgress>
): boolean => {
  if (id === 1) return true;
  return progress[(id - 1) as ChapterId].completed;
};

export interface UnlockedVocabEntry extends VocabEntry {
  chapterId: number;
  chapterTitle: string;
  chapterEmoji: string;
}

/** Returns only vocab words from the current chapter and all completed chapters. */
export const getUnlockedVocab = (
  currentChapter: ChapterId,
  chapterProgress: Record<ChapterId, ChapterProgress>
): UnlockedVocabEntry[] =>
  chapters
    .filter(
      (ch) =>
        ch.id === currentChapter ||
        chapterProgress[ch.id as ChapterId]?.completed
    )
    .flatMap((ch) =>
      ch.vocabulary.map((v) => ({
        ...v,
        chapterId: ch.id,
        chapterTitle: ch.title,
        chapterEmoji: ch.animalEmoji,
      }))
    );
