import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  TeacherAssessmentRecord,
  CriterionKey,
  BandScore,
  AssessmentTopic,
} from "@/types/teacherAssessment";
import { calculateWeightedScore } from "@/lib/teacherRubricData";

interface TeacherState {
  assessments: TeacherAssessmentRecord[];

  saveAssessment: (
    topic: AssessmentTopic,
    scores: Record<CriterionKey, BandScore>,
    studentName?: string
  ) => void;
  deleteAssessment: (id: string) => void;
  clearAllAssessments: () => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set) => ({
      assessments: [],

      saveAssessment: (topic, scores, studentName) =>
        set((state) => ({
          assessments: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              topic,
              date: Date.now(),
              scores,
              weightedOverall: calculateWeightedScore(scores),
              studentName: studentName || undefined,
            },
            ...state.assessments,
          ],
        })),

      deleteAssessment: (id) =>
        set((state) => ({
          assessments: state.assessments.filter((a) => a.id !== id),
        })),

      clearAllAssessments: () => set({ assessments: [] }),
    }),
    {
      name: "alexs-quest-teacher",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
