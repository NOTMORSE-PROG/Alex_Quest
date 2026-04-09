/**
 * Global singleton background music player.
 * Keeps ONE AudioPlayer instance for the entire app lifetime so that:
 *  - mute/unmute works instantly on the active player
 *  - switching screens doesn't create duplicate players
 *
 * Usage: call useMusicPlayer() anywhere; call playTrack() to start a track.
 * Mount <MusicPlayerProvider /> once in _layout.tsx.
 */
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAudioPlayer } from "expo-audio";
import { useGameStore } from "@/store/gameStore";

export type MusicTrack = "home" | "map" | "quest";

const MUSIC_ASSETS: Record<MusicTrack, number> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  home: require("../assets/music/bg_home.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  map: require("../assets/music/bg_map.ogg"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  quest: require("../assets/music/bg_quest.ogg"),
};

interface MusicContextValue {
  playTrack: (track: MusicTrack) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
}

const MusicContext = createContext<MusicContextValue>({
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
});

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(undefined);
  const currentTrack = useRef<MusicTrack | null>(null);
  const muted = useGameStore((s) => s.muted);

  // React to mute toggle immediately
  useEffect(() => {
    try {
      if (muted) {
        player.pause();
      } else if (currentTrack.current) {
        player.play();
      }
    } catch { /* non-critical */ }
  }, [muted, player]);

  const playTrack = useCallback((track: MusicTrack) => {
    if (currentTrack.current === track) return; // already playing this track
    try {
      player.replace(MUSIC_ASSETS[track]);
      player.loop = true;
      player.volume = 0.3;
      currentTrack.current = track;
      if (!muted) player.play();
    } catch { /* non-critical */ }
  }, [player, muted]);

  const pauseTrack = useCallback(() => {
    try { player.pause(); } catch { /* non-critical */ }
  }, [player]);

  const resumeTrack = useCallback(() => {
    if (muted) return;
    try { player.play(); } catch { /* non-critical */ }
  }, [player, muted]);

  return (
    <MusicContext.Provider value={{ playTrack, pauseTrack, resumeTrack }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  return useContext(MusicContext);
}
