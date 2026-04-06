import { useAudioPlayer } from "expo-audio";

export type SFX = "correct" | "wrong" | "tap" | "levelUp" | "confetti" | "click" | "vocab";

// Map each SFX to its asset. Files live in assets/sfx/.
// Replace null values with require('../assets/sfx/correct.mp3') etc. when MP3s are available.
const SFX_ASSETS: Partial<Record<SFX, number>> = {};

export function useAudio() {
  const player = useAudioPlayer(undefined);

  const playSFX = (sfx: SFX) => {
    const asset = SFX_ASSETS[sfx];
    if (!asset) return; // silently no-op until MP3 assets are added
    try {
      player.replace(asset);
      player.play();
    } catch {
      // SFX is non-critical — silently fail
    }
  };

  const playPronunciation = (uri: string) => {
    try {
      player.replace({ uri });
      player.play();
    } catch {
      // non-critical — silently fail
    }
  };

  return { playSFX, playPronunciation };
}
