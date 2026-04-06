import type {
  AssessmentTopic,
  BandDescriptor,
  BandScore,
  CriterionDefinition,
  CriterionKey,
} from "@/types/teacherAssessment";

export const TEACHER_PIN = "0927";

export const ASSESSMENT_TOPICS: AssessmentTopic[] = [
  "Study",
  "Hometown",
  "Home",
  "Art",
  "Bicycles",
  "Birthdays",
  "Childhood",
  "Clothes",
  "Computers",
  "Daily routine",
  "Dictionaries",
  "Evenings",
  "Family & Friends",
  "Flowers",
  "Food",
  "Going Out",
  "Happiness",
  "Hobbies",
  "Internet",
  "Leisure time",
  "Music",
  "Neighbours & Neighbourhood",
  "Newspapers",
  "Pets",
  "Reading",
  "Shopping",
  "Sport",
  "TV",
  "Transport",
  "Weather",
];

export const CRITERIA: CriterionDefinition[] = [
  { key: "grammaticalRange", label: "Grammatical Range & Accuracy", weight: 0.4 },
  { key: "pronunciation", label: "Pronunciation", weight: 0.25 },
  { key: "fluencyCoherence", label: "Fluency & Coherence", weight: 0.2 },
  { key: "lexicalResource", label: "Lexical Resource", weight: 0.15 },
];

export const BAND_DESCRIPTORS: Record<CriterionKey, BandDescriptor[]> = {
  grammaticalRange: [
    { band: 9, description: "Uses a full range of structures with consistent accuracy; produces complete sentences at all times; demonstrates accurate subject\u2013verb agreement, tense, and word forms with minimal errors" },
    { band: 8, description: "Uses a wide range of structures; the majority of sentences are error-free; occasional errors in agreement, tense, or word forms may occur but do not affect clarity" },
    { band: 7, description: "Uses a mix of simple and complex structures; produces mostly complete sentences; some errors in sentence construction, agreement, tense, or word forms are evident but meaning remains clear" },
    { band: 6, description: "Produces a mix of structures with frequent grammatical errors; incomplete sentences may occur; errors in subject\u2013verb agreement, tense, and word forms are common but do not seriously hinder communication" },
    { band: 5, description: "Produces basic sentence forms; frequent grammatical errors; incomplete sentences are common; errors in agreement, tense, and word forms sometimes affect clarity" },
    { band: 4, description: "Limited control of grammar; frequent incomplete or incorrect sentence structures; errors often affect meaning" },
    { band: 3, description: "Very limited control of grammar; unable to consistently produce complete sentences; errors are frequent and affect communication" },
    { band: 2, description: "No control of grammatical structures; no evidence of complete sentence construction" },
    { band: 1, description: "No control of grammar; no meaningful sentence production" },
  ],
  pronunciation: [
    { band: 9, description: "Uses a full range of phonological features; speech is effortless to understand" },
    { band: 8, description: "Uses a wide range of pronunciation features; generally clear with minimal lapses" },
    { band: 7, description: "Generally clear pronunciation with some lapses in stress or intonation" },
    { band: 6, description: "Generally understandable; pronunciation problems are noticeable but meaning is clear" },
    { band: 5, description: "Pronunciation is sometimes unclear; listener effort is required at times" },
    { band: 4, description: "Frequently unclear; difficult to understand at times" },
    { band: 3, description: "Often unclear; difficult to understand" },
    { band: 2, description: "Mostly unintelligible" },
    { band: 1, description: "Unintelligible" },
  ],
  fluencyCoherence: [
    { band: 9, description: "Speaks fluently with only very occasional hesitation; ideas are fully coherent and well-developed" },
    { band: 8, description: "Fluent with minor hesitation; ideas are logically organized and relevant" },
    { band: 7, description: "Able to maintain speech with some hesitation; ideas are generally coherent" },
    { band: 6, description: "Able to maintain speech but with noticeable pauses; ideas are not always well connected" },
    { band: 5, description: "Speaks with frequent hesitation and repetition; difficulty organizing ideas" },
    { band: 4, description: "Frequent pauses and breakdowns; unable to sustain speech" },
    { band: 3, description: "Long pauses; unable to maintain speech beyond simple responses" },
    { band: 2, description: "Produces isolated words or memorized phrases only" },
    { band: 1, description: "No meaningful communication" },
  ],
  lexicalResource: [
    { band: 9, description: "Uses a wide range of vocabulary with precision and flexibility" },
    { band: 8, description: "Uses a wide range of vocabulary with occasional inaccuracies" },
    { band: 7, description: "Uses a good range of vocabulary with some inaccuracies or repetition" },
    { band: 6, description: "Uses adequate vocabulary but with limited flexibility and some errors" },
    { band: 5, description: "Uses limited vocabulary; frequent misuse affects communication" },
    { band: 4, description: "Uses basic vocabulary with frequent errors" },
    { band: 3, description: "Very limited vocabulary" },
    { band: 2, description: "Extremely limited vocabulary" },
    { band: 1, description: "No usable vocabulary" },
  ],
};

export function calculateWeightedScore(
  scores: Record<CriterionKey, BandScore>
): number {
  const weighted = CRITERIA.reduce(
    (sum, c) => sum + scores[c.key] * c.weight,
    0
  );
  return Math.round(weighted * 10) / 10;
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 8) return { label: "Excellent", color: "#58CC02" };
  if (score >= 7) return { label: "Very Good", color: "#4AADE8" };
  if (score >= 6) return { label: "Good", color: "#F5A623" };
  if (score >= 5) return { label: "Fair", color: "#FF9600" };
  return { label: "Needs Improvement", color: "#FF4B4B" };
}
