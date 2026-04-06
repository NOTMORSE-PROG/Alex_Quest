export type AssessmentTopic =
  | "Study"
  | "Hometown"
  | "Home"
  | "Art"
  | "Bicycles"
  | "Birthdays"
  | "Childhood"
  | "Clothes"
  | "Computers"
  | "Daily routine"
  | "Dictionaries"
  | "Evenings"
  | "Family & Friends"
  | "Flowers"
  | "Food"
  | "Going Out"
  | "Happiness"
  | "Hobbies"
  | "Internet"
  | "Leisure time"
  | "Music"
  | "Neighbours & Neighbourhood"
  | "Newspapers"
  | "Pets"
  | "Reading"
  | "Shopping"
  | "Sport"
  | "TV"
  | "Transport"
  | "Weather";

export type BandScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type CriterionKey =
  | "grammaticalRange"
  | "pronunciation"
  | "fluencyCoherence"
  | "lexicalResource";

export interface CriterionDefinition {
  key: CriterionKey;
  label: string;
  weight: number;
}

export interface BandDescriptor {
  band: BandScore;
  description: string;
}

export interface TeacherAssessmentRecord {
  id: string;
  topic: AssessmentTopic;
  date: number;
  scores: Record<CriterionKey, BandScore>;
  weightedOverall: number;
  studentName?: string;
}
