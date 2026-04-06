/**
 * Phoneme reference data for the offline pronunciation assessment engine.
 *
 * Contains:
 * - ARPAbet → IPA symbol mapping (39 phonemes)
 * - Articulatory feature-based similarity matrix
 * - Kid-friendly pronunciation tips for common problem sounds
 */

// ── ARPAbet → IPA Mapping ────────────────────────────────────────────

/** Maps CMU Dictionary ARPAbet symbols to IPA symbols for display. */
export const ARPABET_TO_IPA: Record<string, string> = {
  // Vowels (monophthongs)
  AA: "ɑ", // father, lot
  AE: "æ", // cat, map
  AH: "ʌ", // cup, cut (stressed) / ə (unstressed — schwa)
  AO: "ɔ", // thought, caught
  EH: "ɛ", // dress, met
  ER: "ɝ", // bird, fur
  IH: "ɪ", // kit, lip
  IY: "i", // fleece, feet
  UH: "ʊ", // foot, could
  UW: "u", // goose, food

  // Diphthongs
  AW: "aʊ", // mouth, house
  AY: "aɪ", // price, fly
  EY: "eɪ", // face, rate
  OW: "oʊ", // goat, code
  OY: "ɔɪ", // choice, boy

  // Stops (plosives)
  B: "b",
  D: "d",
  G: "ɡ",
  K: "k",
  P: "p",
  T: "t",

  // Fricatives
  DH: "ð", // this, bathe (voiced dental)
  F: "f",
  HH: "h",
  S: "s",
  SH: "ʃ", // ship, wish
  TH: "θ", // think, bath (voiceless dental)
  V: "v",
  Z: "z",
  ZH: "ʒ", // vision, pleasure

  // Affricates
  CH: "tʃ", // chat, teach
  JH: "dʒ", // judge, badge

  // Nasals
  M: "m",
  N: "n",
  NG: "ŋ", // sing, ring

  // Approximants (liquids + glides)
  L: "l",
  R: "ɹ",
  W: "w",
  Y: "j", // yes, yell
};

/** Reverse mapping: IPA → ARPAbet */
export const IPA_TO_ARPABET: Record<string, string> = Object.fromEntries(
  Object.entries(ARPABET_TO_IPA).map(([k, v]) => [v, k])
);

/**
 * Strip stress markers from an ARPAbet symbol.
 * "AE1" → "AE", "T" → "T"
 */
export function stripStress(phoneme: string): string {
  return phoneme.replace(/[012]$/, "");
}

/**
 * Extract stress level from an ARPAbet symbol.
 * "AE1" → 1, "AH0" → 0, "T" → -1 (consonant, no stress)
 */
export function getStress(phoneme: string): number {
  const match = phoneme.match(/([012])$/);
  return match ? parseInt(match[1], 10) : -1;
}

/**
 * Convert ARPAbet symbol to IPA for display.
 */
export function toIPA(arpabet: string): string {
  const base = stripStress(arpabet);
  return ARPABET_TO_IPA[base] ?? arpabet.toLowerCase();
}

// ── Articulatory Features ────────────────────────────────────────────

/** Place of articulation categories */
type Place =
  | "bilabial"
  | "labiodental"
  | "dental"
  | "alveolar"
  | "postalveolar"
  | "velar"
  | "glottal"
  | "palatal";

/** Manner of articulation categories */
type Manner =
  | "stop"
  | "fricative"
  | "affricate"
  | "nasal"
  | "approximant"
  | "vowel";

interface ConsonantFeatures {
  type: "consonant";
  place: Place;
  manner: Manner;
  voiced: boolean;
}

interface VowelFeatures {
  type: "vowel";
  height: "high" | "mid" | "low";
  backness: "front" | "central" | "back";
  rounded: boolean;
}

type PhonemeFeatures = ConsonantFeatures | VowelFeatures;

/**
 * Articulatory features for each ARPAbet phoneme.
 * Used to compute similarity between any two phonemes.
 */
const FEATURES: Record<string, PhonemeFeatures> = {
  // ── Stops ──
  P: { type: "consonant", place: "bilabial", manner: "stop", voiced: false },
  B: { type: "consonant", place: "bilabial", manner: "stop", voiced: true },
  T: { type: "consonant", place: "alveolar", manner: "stop", voiced: false },
  D: { type: "consonant", place: "alveolar", manner: "stop", voiced: true },
  K: { type: "consonant", place: "velar", manner: "stop", voiced: false },
  G: { type: "consonant", place: "velar", manner: "stop", voiced: true },

  // ── Fricatives ──
  F: {
    type: "consonant",
    place: "labiodental",
    manner: "fricative",
    voiced: false,
  },
  V: {
    type: "consonant",
    place: "labiodental",
    manner: "fricative",
    voiced: true,
  },
  TH: {
    type: "consonant",
    place: "dental",
    manner: "fricative",
    voiced: false,
  },
  DH: {
    type: "consonant",
    place: "dental",
    manner: "fricative",
    voiced: true,
  },
  S: {
    type: "consonant",
    place: "alveolar",
    manner: "fricative",
    voiced: false,
  },
  Z: {
    type: "consonant",
    place: "alveolar",
    manner: "fricative",
    voiced: true,
  },
  SH: {
    type: "consonant",
    place: "postalveolar",
    manner: "fricative",
    voiced: false,
  },
  ZH: {
    type: "consonant",
    place: "postalveolar",
    manner: "fricative",
    voiced: true,
  },
  HH: {
    type: "consonant",
    place: "glottal",
    manner: "fricative",
    voiced: false,
  },

  // ── Affricates ──
  CH: {
    type: "consonant",
    place: "postalveolar",
    manner: "affricate",
    voiced: false,
  },
  JH: {
    type: "consonant",
    place: "postalveolar",
    manner: "affricate",
    voiced: true,
  },

  // ── Nasals ──
  M: { type: "consonant", place: "bilabial", manner: "nasal", voiced: true },
  N: { type: "consonant", place: "alveolar", manner: "nasal", voiced: true },
  NG: { type: "consonant", place: "velar", manner: "nasal", voiced: true },

  // ── Approximants ──
  L: {
    type: "consonant",
    place: "alveolar",
    manner: "approximant",
    voiced: true,
  },
  R: {
    type: "consonant",
    place: "postalveolar",
    manner: "approximant",
    voiced: true,
  },
  W: { type: "consonant", place: "velar", manner: "approximant", voiced: true },
  Y: {
    type: "consonant",
    place: "palatal",
    manner: "approximant",
    voiced: true,
  },

  // ── Vowels ──
  IY: { type: "vowel", height: "high", backness: "front", rounded: false },
  IH: { type: "vowel", height: "high", backness: "front", rounded: false },
  EY: { type: "vowel", height: "mid", backness: "front", rounded: false },
  EH: { type: "vowel", height: "mid", backness: "front", rounded: false },
  AE: { type: "vowel", height: "low", backness: "front", rounded: false },
  AA: { type: "vowel", height: "low", backness: "back", rounded: false },
  AH: { type: "vowel", height: "mid", backness: "central", rounded: false },
  AO: { type: "vowel", height: "mid", backness: "back", rounded: true },
  OW: { type: "vowel", height: "mid", backness: "back", rounded: true },
  UH: { type: "vowel", height: "high", backness: "back", rounded: true },
  UW: { type: "vowel", height: "high", backness: "back", rounded: true },
  ER: { type: "vowel", height: "mid", backness: "central", rounded: false },
  AW: { type: "vowel", height: "low", backness: "central", rounded: false },
  AY: { type: "vowel", height: "low", backness: "central", rounded: false },
  OY: { type: "vowel", height: "mid", backness: "back", rounded: true },
};

// ── Similarity Computation ───────────────────────────────────────────

const PLACE_ORDER: Place[] = [
  "bilabial",
  "labiodental",
  "dental",
  "alveolar",
  "postalveolar",
  "palatal",
  "velar",
  "glottal",
];
const MANNER_ORDER: Manner[] = [
  "stop",
  "affricate",
  "fricative",
  "nasal",
  "approximant",
];
const HEIGHT_ORDER = ["high", "mid", "low"];
const BACKNESS_ORDER = ["front", "central", "back"];

function placeDistance(a: Place, b: Place): number {
  return Math.abs(PLACE_ORDER.indexOf(a) - PLACE_ORDER.indexOf(b));
}

function mannerDistance(a: Manner, b: Manner): number {
  return Math.abs(MANNER_ORDER.indexOf(a) - MANNER_ORDER.indexOf(b));
}

/**
 * Compute articulatory similarity between two ARPAbet phonemes.
 * Returns 0.0 (completely different) to 1.0 (identical).
 */
export function phonemeSimilarity(a: string, b: string): number {
  const baseA = stripStress(a);
  const baseB = stripStress(b);

  if (baseA === baseB) return 1.0;

  const featA = FEATURES[baseA];
  const featB = FEATURES[baseB];

  if (!featA || !featB) return 0.1; // Unknown phoneme

  // Different types (consonant vs vowel) — very dissimilar
  if (featA.type !== featB.type) return 0.1;

  if (featA.type === "consonant" && featB.type === "consonant") {
    const pDist = placeDistance(featA.place, featB.place);
    const mDist = mannerDistance(featA.manner, featB.manner);
    const vDist = featA.voiced === featB.voiced ? 0 : 1;

    // Max possible distance: place=7, manner=4, voicing=1 → total 12
    const totalDist = pDist * 1.5 + mDist * 2 + vDist * 1;
    const maxDist = 12;
    return Math.max(0.05, 1.0 - totalDist / maxDist);
  }

  // Both vowels
  if (featA.type === "vowel" && featB.type === "vowel") {
    const hDist = Math.abs(
      HEIGHT_ORDER.indexOf(featA.height) - HEIGHT_ORDER.indexOf(featB.height)
    );
    const bDist = Math.abs(
      BACKNESS_ORDER.indexOf(featA.backness) -
        BACKNESS_ORDER.indexOf(featB.backness)
    );
    const rDist = featA.rounded === featB.rounded ? 0 : 1;

    // Max: height=2, backness=2, rounding=1 → total 5
    const totalDist = hDist + bDist + rDist;
    return Math.max(0.15, 1.0 - totalDist / 5);
  }

  return 0.1;
}

// ── Pronunciation Tips ───────────────────────────────────────────────

/**
 * Kid-friendly pronunciation tips for common English phonemes.
 * Shown when a phoneme is mispronounced.
 */
export const PHONEME_TIPS: Record<string, string> = {
  // Dental fricatives (common ESL difficulty)
  TH: "Put your tongue between your teeth and blow air gently",
  DH: "Put your tongue between your teeth and use your voice — feel it buzz!",

  // Approximants (L/R confusion common in children)
  R: "Curl the tip of your tongue back without touching the roof of your mouth",
  L: "Touch the tip of your tongue to the bumpy ridge behind your top teeth",

  // Postalveolar fricatives/affricates
  SH: "Make your lips round like a little circle and push air out — like saying 'shh!'",
  ZH: "Like 'sh' but let your voice buzz at the same time",
  CH: "Put your tongue on the roof of your mouth, then let the air burst out — like a sneeze: 'achoo!'",
  JH: "Like 'ch' but with your voice buzzing — like the 'j' in 'jump'",

  // Velar nasal
  NG: "It's the sound at the end of 'sing' — the air goes through your nose, not your mouth",

  // Fricative pairs
  F: "Gently bite your bottom lip and blow air through",
  V: "Like 'f' but with your voice buzzing — touch your throat to feel it",
  S: "Put your tongue close to the roof of your mouth and blow air through — like a snake: 'ssss'",
  Z: "Like 's' but with your voice buzzing — like a bee: 'zzzz'",

  // Stops
  P: "Press your lips together and pop them open with a puff of air",
  B: "Like 'p' but with your voice — feel your throat vibrate",
  T: "Touch your tongue to the ridge behind your top teeth and let go quickly",
  D: "Like 't' but with your voice buzzing",
  K: "Push the back of your tongue against the roof of your mouth and release",
  G: "Like 'k' but with your voice — you can feel the buzz",

  // Nasals
  M: "Close your lips and hum — the sound comes through your nose",
  N: "Touch your tongue behind your top teeth and hum through your nose",

  // Glides
  W: "Round your lips like you're about to whistle, then open them",
  Y: "Raise the middle of your tongue close to the roof of your mouth — like starting to say 'yes'",

  // Glottal
  HH: "Open your mouth and breathe out — like fogging up a window",

  // Vowels (common confusions)
  IY: "Spread your lips wide like a big smile — 'ee' as in 'see'",
  IH: "Relax your lips a tiny bit from the 'ee' sound — like in 'sit'",
  EH: "Open your mouth a bit more — like in 'bed'",
  AE: "Open your mouth wide and push your tongue forward — like in 'cat'",
  AH: "Open your mouth and relax everything — like in 'cup'",
  UW: "Round your lips into a small circle — 'oo' as in 'food'",
  UH: "A short, relaxed 'oo' — like in 'book'",
  OW: "Start with your mouth open, then round your lips — like in 'go'",
  ER: "Curl your tongue back a little — like the sound in 'bird'",
  AA: "Open your mouth wide and say 'ah' — like at the doctor",
  AO: "Open your mouth and round your lips — like in 'law'",
};

/**
 * Get a pronunciation tip for an ARPAbet phoneme.
 * Returns a generic tip if no specific one exists.
 */
export function getTip(arpabet: string): string {
  const base = stripStress(arpabet);
  return (
    PHONEME_TIPS[base] ?? `Try to match the '${toIPA(arpabet)}' sound closely`
  );
}
