import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChapterId = 1 | 2 | 3 | 4 | 5;

export interface ChapterProgress {
  completed: boolean;
  stars: number; // 0–3
  xpEarned: number;
}

export interface GameState {
  // Progress
  currentChapter: ChapterId;
  chapterProgress: Record<ChapterId, ChapterProgress>;
  totalXP: number;
  streak: number;
  hearts: number; // max 5
  lastPlayedDate: string | null;

  // Tutorial/Onboarding
  tutorialCompleted: boolean;
  questStarted: boolean;
  vocabSeenToday: boolean;

  // Active gameplay
  activeQuestionIndex: number;
  wrongAttempts: number;

  // Actions
  setCurrentChapter: (id: ChapterId) => void;
  completeChapter: (id: ChapterId, stars: number, xp: number) => void;
  addXP: (amount: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  completeTutorial: () => void;
  startQuest: () => void;
  markVocabSeen: () => void;
  setActiveQuestion: (index: number) => void;
  incrementWrongAttempts: () => void;
  resetWrongAttempts: () => void;
  resetGame: () => void;
}

const defaultChapterProgress: Record<ChapterId, ChapterProgress> = {
  1: { completed: false, stars: 0, xpEarned: 0 },
  2: { completed: false, stars: 0, xpEarned: 0 },
  3: { completed: false, stars: 0, xpEarned: 0 },
  4: { completed: false, stars: 0, xpEarned: 0 },
  5: { completed: false, stars: 0, xpEarned: 0 },
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      currentChapter: 1,
      chapterProgress: { ...defaultChapterProgress },
      totalXP: 0,
      streak: 0,
      hearts: 5,
      lastPlayedDate: null,
      tutorialCompleted: false,
      questStarted: false,
      vocabSeenToday: false,
      activeQuestionIndex: 0,
      wrongAttempts: 0,

      setCurrentChapter: (id) => set({ currentChapter: id }),

      completeChapter: (id, stars, xp) =>
        set((state) => ({
          chapterProgress: {
            ...state.chapterProgress,
            [id]: { completed: true, stars, xpEarned: xp },
          },
          totalXP: state.totalXP + xp,
          currentChapter:
            id < 5 ? ((id + 1) as ChapterId) : state.currentChapter,
        })),

      addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),

      loseHeart: () =>
        set((state) => ({ hearts: Math.max(0, state.hearts - 1) })),

      refillHearts: () => set({ hearts: 5 }),

      completeTutorial: () => set({ tutorialCompleted: true }),

      startQuest: () => set({ questStarted: true }),

      markVocabSeen: () => set({ vocabSeenToday: true }),

      setActiveQuestion: (index) => set({ activeQuestionIndex: index }),

      incrementWrongAttempts: () =>
        set((state) => ({ wrongAttempts: state.wrongAttempts + 1 })),

      resetWrongAttempts: () => set({ wrongAttempts: 0 }),

      resetGame: () =>
        set({
          currentChapter: 1,
          chapterProgress: { ...defaultChapterProgress },
          totalXP: 0,
          streak: 0,
          hearts: 5,
          tutorialCompleted: false,
          questStarted: false,
          vocabSeenToday: false,
          activeQuestionIndex: 0,
          wrongAttempts: 0,
        }),
    }),
    {
      name: "alexs-quest-save",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
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
