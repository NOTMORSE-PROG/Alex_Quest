import { useCallback } from "react";
import { Audio } from "expo-av";
import { useGameStore } from "@/store/gameStore";

export type SFX = "correct" | "wrong" | "tap" | "levelUp" | "confetti" | "click" | "vocab" | "great" | "goodjob" | "awesome";

// ── SFX Assets ────────────────────────────────────────────────────────────────
// CC0 — Kenney Interface Sounds & Music Jingles (kenney.nl)
const SFX_ASSETS: Partial<Record<SFX, number>> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  correct: require("../assets/sfx/correct.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  wrong: require("../assets/sfx/wrong.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  tap: require("../assets/sfx/tap.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  click: require("../assets/sfx/click.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  vocab: require("../assets/sfx/vocab.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  levelUp: require("../assets/sfx/levelup.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  confetti: require("../assets/sfx/confetti.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  great: require("../assets/sfx/great.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  goodjob: require("../assets/sfx/goodjob.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  awesome: require("../assets/sfx/awesome.ogg"),
};

const COMPLIMENTS: SFX[] = ["great", "goodjob", "awesome"];

export function useAudio() {
  const muted = useGameStore((s) => s.muted);

  const playSFX = useCallback(async (sfx: SFX) => {
    if (muted) return;
    const asset = SFX_ASSETS[sfx];
    if (!asset) return;
    try {
      const { sound } = await Audio.Sound.createAsync(asset);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // SFX is non-critical — silently fail
    }
  }, [muted]);

  /** Plays a random compliment sting (great / goodjob / awesome) */
  const playCompliment = useCallback(() => {
    const pick = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    playSFX(pick);
  }, [playSFX]);

  const playPronunciation = useCallback(async (uri: string) => {
    if (muted) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // non-critical — silently fail
    }
  }, [muted]);

  return { playSFX, playCompliment, playPronunciation };
}
