/**
 * Global singleton background music player.
 * Keeps ONE Audio.Sound instance for the entire app lifetime so that:
 *  - mute/unmute works instantly on the active player
 *  - switching screens doesn't create duplicate players
 *
 * Uses expo-av (Audio.Sound) exclusively — NOT expo-audio — to avoid the
 * dual-library AudioManager conflict that suppresses the microphone on
 * Huawei/OEM devices. PronounceRight (the working reference project) uses
 * only expo-av for all audio operations.
 *
 * Usage: call useMusicPlayer() anywhere; call playTrack() to start a track.
 * Mount <MusicPlayerProvider /> once in _layout.tsx.
 */
import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Audio } from "expo-av";
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
  const soundRef = useRef<Audio.Sound | null>(null);
  const currentTrack = useRef<MusicTrack | null>(null);
  const muted = useGameStore((s) => s.muted);

  // React to mute toggle immediately
  useEffect(() => {
    if (!soundRef.current) return;
    try {
      if (muted) {
        soundRef.current.pauseAsync();
      } else if (currentTrack.current) {
        soundRef.current.playAsync();
      }
    } catch { /* non-critical */ }
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const playTrack = useCallback(async (track: MusicTrack) => {
    if (currentTrack.current === track) return; // already playing this track
    try {
      // Unload previous track
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        MUSIC_ASSETS[track],
        { isLooping: true, volume: 0.3, shouldPlay: !muted }
      );
      soundRef.current = sound;
      currentTrack.current = track;
    } catch { /* non-critical */ }
  }, [muted]);

  const pauseTrack = useCallback(() => {
    soundRef.current?.pauseAsync().catch(() => {});
  }, []);

  const resumeTrack = useCallback(() => {
    if (muted) return;
    soundRef.current?.playAsync().catch(() => {});
  }, [muted]);

  return (
    <MusicContext.Provider value={{ playTrack, pauseTrack, resumeTrack }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  return useContext(MusicContext);
}
