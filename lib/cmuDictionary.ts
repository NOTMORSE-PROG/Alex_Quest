/**
 * CMU Pronouncing Dictionary loader.
 * Provides O(1) word → phoneme sequence lookup from the bundled dictionary.
 *
 * Usage:
 *   await loadDictionary();
 *   const phonemes = lookupWord("hello"); // [["HH","AH0","L","OW1"], ["HH","EH0","L","OW1"]]
 */

import { stripStress } from "./phonemeData";

// ── Dictionary State ─────────────────────────────────────────────────

let dictionary: Map<string, string[][]> | null = null;
let loadPromise: Promise<void> | null = null;

// ── Public API ───────────────────────────────────────────────────────

/**
 * Load the CMU dictionary from bundled JSON asset.
 * Call once when entering a chapter. Subsequent calls are no-ops.
 */
export async function loadDictionary(): Promise<void> {
  if (dictionary) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // Use require for bundled JSON (works in React Native / Metro)
      const raw = require("@/assets/data/cmu-dict.json") as Record<
        string,
        string[][]
      >;
      dictionary = new Map(Object.entries(raw));
    } catch (e) {
      console.error("[cmuDictionary] Failed to load:", e);
      dictionary = new Map(); // Empty fallback — scoring will degrade gracefully
    }
  })();

  return loadPromise;
}

/**
 * Check if the dictionary has been loaded.
 */
export function isLoaded(): boolean {
  return dictionary !== null && dictionary.size > 0;
}

/**
 * Look up a word's phoneme sequences.
 * Returns array of pronunciation variants, or null if not found.
 *
 * Example: lookupWord("hello") → [["HH","AH0","L","OW1"], ["HH","EH0","L","OW1"]]
 */
export function lookupWord(word: string): string[][] | null {
  if (!dictionary) return null;
  const normalized = word.toLowerCase().replace(/[^a-z'-]/g, "");
  return dictionary.get(normalized) ?? null;
}

/**
 * Look up phonemes for each word in a sentence.
 * Returns array of { word, phonemes } pairs.
 * Words not in the dictionary get an empty phonemes array.
 */
export function lookupSentence(
  sentence: string
): { word: string; phonemes: string[]; found: boolean }[] {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  return words.map((word) => {
    const variants = lookupWord(word);
    return {
      word,
      // Use first (most common) pronunciation variant
      phonemes: variants ? variants[0] : [],
      found: variants !== null,
    };
  });
}

/**
 * Get a flat phoneme sequence for a sentence (first pronunciation variant for each word).
 * Useful for alignment comparison.
 */
export function sentenceToPhonemes(sentence: string): string[] {
  const lookup = lookupSentence(sentence);
  return lookup.flatMap((entry) => entry.phonemes);
}

/**
 * Get phonemes with stress stripped (for base comparison).
 */
export function sentenceToPhonemesNoStress(sentence: string): string[] {
  return sentenceToPhonemes(sentence).map(stripStress);
}

/**
 * Get the total number of words in the dictionary.
 */
export function dictionarySize(): number {
  return dictionary?.size ?? 0;
}
