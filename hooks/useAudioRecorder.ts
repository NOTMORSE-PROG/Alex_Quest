/**
 * Audio recorder hook for capturing audio for Whisper processing.
 *
 * KEY DESIGN DECISION — 44.1kHz instead of 16kHz:
 * Android's MediaRecorder only GUARANTEES 44.1kHz across all devices.
 * Requesting 16kHz (Whisper's native rate) works on most devices but silently
 * fails on many Oppo/Vivo/Xiaomi/budget chipsets — producing a valid file
 * container with no audio data inside.
 * whisper.rn's AudioUtils.java already resamples from any rate to 16kHz
 * (lines 191-193), so 44.1kHz input is handled transparently.
 *
 * FALLBACK CHAIN:
 *  1. m4a-44k-mono   — 44.1kHz mono  MPEG-4/AAC 128kbps  (primary, widest compat)
 *  2. m4a-44k-stereo — 44.1kHz stereo MPEG-4/AAC 128kbps  (if mono encoder rejected)
 *  3. high-quality   — expo-av HIGH_QUALITY preset (same as #2, final safety net)
 *
 * DYNAMIC PROFILE PERSISTENCE:
 * On successful recording the working profile is saved to AsyncStorage keyed
 * by device model. On the next session it's tried first, avoiding the overhead
 * of iterating through failing profiles every time the app is opened.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TAG = "[useAudioRecorder]";

// AsyncStorage key — stores a JSON map of { deviceKey: profileName }
const PROFILE_STORE_KEY = "@audio_recorder_profile_v2";

// Device-specific key so the map can cover any number of devices
const DEVICE_KEY = Platform.OS === "android"
  ? `android-${(Platform.constants as { Model?: string }).Model ?? "unknown"}`
  : `ios-${Platform.OS}`;

// ── Silence-detection constants ──────────────────────────────────────────────
const METER_INTERVAL_MS = 500;
/** dB threshold — readings below this count toward the silence window */
const SILENCE_THRESHOLD_DB = -35;
/** How many consecutive silent polls before flagging silenceDetected */
const SILENCE_WINDOW = 6; // 6 × 500ms = 3 seconds

// ── Recording Profiles ────────────────────────────────────────────────────────

/** Profile 1 — 44.1kHz mono M4A/AAC (primary, maximum device compatibility) */
const PROFILE_M4A_MONO: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    // iOS fully supports 16kHz — keep it for best Whisper accuracy on iOS
    extension: ".wav",
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

/** Profile 2 — 44.1kHz stereo M4A/AAC (if mono channel config is rejected) */
const PROFILE_M4A_STEREO: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

const ALL_PROFILES: { name: string; options: Audio.RecordingOptions }[] = [
  { name: "m4a-44k-mono", options: PROFILE_M4A_MONO },
  { name: "m4a-44k-stereo", options: PROFILE_M4A_STEREO },
  { name: "high-quality", options: Audio.RecordingOptionsPresets.HIGH_QUALITY },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type RecorderState = "idle" | "recording" | "stopped";

export interface AudioRecorderHook {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
  /** True when mic input has been silent for ≥3 seconds during recording */
  silenceDetected: boolean;
  /** Peak dB observed during current/last recording (-160 = silence) */
  peakDb: number;
  /** Which profile succeeded — used for diagnostics and markProfileFailed */
  profileUsed: string | null;
  /** Call when a recording produced a too-small/silent file — skips this
   *  profile for the rest of the session and clears it from persistence */
  markProfileFailed: () => void;
}

// ── Persistence helpers ───────────────────────────────────────────────────────

async function loadPreferredProfile(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[DEVICE_KEY] ?? null;
  } catch {
    return null;
  }
}

async function savePreferredProfile(name: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORE_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[DEVICE_KEY] = name;
    await AsyncStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(map));
  } catch { /* non-critical */ }
}

async function clearPreferredProfile(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_STORE_KEY);
    if (!raw) return;
    const map: Record<string, string> = JSON.parse(raw);
    delete map[DEVICE_KEY];
    await AsyncStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(map));
  } catch { /* non-critical */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAudioRecorder(): AudioRecorderHook {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const meterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [silenceDetected, setSilenceDetected] = useState(false);
  const [peakDb, setPeakDb] = useState(-160);

  // Use a ref for profileUsed so stopRecording never closes over a stale value
  const profileUsedRef = useRef<string | null>(null);
  const [profileUsed, setProfileUsed] = useState<string | null>(null);

  const silentPollsRef = useRef(0);
  const peakDbRef = useRef(-160);

  // Profiles that silently failed on this device — skip them in future attempts
  const failedProfilesRef = useRef<Set<string>>(new Set());
  // How many times we've cycled through ALL profiles — cap to prevent infinite loop
  const profileCycleCountRef = useRef(0);

  // Preferred profile loaded from AsyncStorage (set asynchronously on mount)
  const preferredProfileRef = useRef<string | null>(null);

  // Load persisted preferred profile once on mount
  useEffect(() => {
    loadPreferredProfile().then(name => {
      if (name) {
        preferredProfileRef.current = name;
        console.log(`${TAG} loaded preferred profile for ${DEVICE_KEY}: ${name}`);
      }
    });
  }, []);

  // ── Metering ────────────────────────────────────────────────────────────────

  const stopMetering = useCallback(() => {
    if (meterTimerRef.current) {
      clearInterval(meterTimerRef.current);
      meterTimerRef.current = null;
    }
  }, []);

  const startMetering = useCallback(
    (recording: Audio.Recording) => {
      stopMetering();
      silentPollsRef.current = 0;
      peakDbRef.current = -160;
      setSilenceDetected(false);
      setPeakDb(-160);

      meterTimerRef.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (!status.isRecording) return;

          const db = status.metering ?? -160;

          if (db > peakDbRef.current) {
            peakDbRef.current = db;
            setPeakDb(db);
          }

          if (db < SILENCE_THRESHOLD_DB) {
            silentPollsRef.current++;
            if (silentPollsRef.current >= SILENCE_WINDOW) {
              setSilenceDetected(true);
            }
          } else {
            silentPollsRef.current = 0;
            setSilenceDetected(false);
          }
        } catch { /* recording stopped between polls */ }
      }, METER_INTERVAL_MS);
    },
    [stopMetering]
  );

  // ── startRecording ───────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    console.log(`${TAG} startRecording called`);
    try {
      setError(null);
      setSilenceDetected(false);
      setPeakDb(-160);
      profileUsedRef.current = null;
      setProfileUsed(null);

      // Unload any previous recording instance
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch { /* ignore */ }
        recordingRef.current = null;
      }

      // Request expo-av's own mic permission.
      // On stricter Android ROMs (Oppo ColorOS, MIUI, Vivo FunTouch) a grant
      // to one native module does NOT propagate to expo-av.
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        console.warn(`${TAG} Audio.requestPermissionsAsync denied`);
        setError("Microphone permission denied. Please enable mic access in your phone Settings.");
        setState("idle");
        return;
      }

      // Switch audio session into recording mode.
      // shouldDuckAndroid: false — ducking causes Oppo ColorOS and Vivo
      // FunTouch audio frameworks to suppress mic input on some devices.
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // 200ms timing gap — expo-av issue #21782: some OEM devices need time for
      // the audio session to fully activate before MediaRecorder can attach to it.
      // Without this delay, createAsync silently produces an empty file.
      await new Promise(r => setTimeout(r, 200));

      // ── Build ordered profile list ───────────────────────────────────────
      // 1. Try the device's previously-working profile first (from AsyncStorage)
      // 2. Then try remaining profiles in priority order
      // 3. Skip profiles that already failed this session
      const preferred = preferredProfileRef.current;
      const failed = failedProfilesRef.current;

      let candidates = ALL_PROFILES.filter(p => !failed.has(p.name));
      if (candidates.length === 0) {
        profileCycleCountRef.current++;
        if (profileCycleCountRef.current >= 2) {
          throw new Error("Recording failed on all audio profiles. Please restart the app or check microphone permissions.");
        }
        candidates = [...ALL_PROFILES]; // reset for one more cycle
      }

      if (preferred && !failed.has(preferred)) {
        const preferredProfile = candidates.find(p => p.name === preferred);
        if (preferredProfile) {
          // Bubble the preferred profile to the front
          candidates = [
            preferredProfile,
            ...candidates.filter(p => p.name !== preferred),
          ];
        }
      }

      // ── Try each profile ─────────────────────────────────────────────────
      let recording: Audio.Recording | null = null;
      let usedProfile = "";

      for (const profile of candidates) {
        try {
          ({ recording } = await Audio.Recording.createAsync(profile.options));
          usedProfile = profile.name;
          console.log(`${TAG} recording started (${profile.name})`);
          break;
        } catch (err) {
          console.warn(`${TAG} createAsync failed with ${profile.name}:`, err);
          recording = null;
        }
      }

      if (!recording) {
        throw new Error("All recording profiles failed — mic may be in use by another app");
      }

      recordingRef.current = recording;
      profileUsedRef.current = usedProfile;
      setProfileUsed(usedProfile);
      setState("recording");
      startMetering(recording);
    } catch (e) {
      console.error(`${TAG} startRecording failed:`, e);
      setError(e instanceof Error ? e.message : "Failed to start recording");
      setState("idle");
    }
  }, [startMetering]);

  // ── stopRecording ────────────────────────────────────────────────────────────

  const stopRecording = useCallback(async (): Promise<string | null> => {
    stopMetering();
    const recording = recordingRef.current;
    console.log(`${TAG} stopRecording called, hasRecording=${!!recording}`);

    if (!recording) {
      console.warn(`${TAG} stopRecording: no active recording`);
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();

      // Reset audio session to playback mode so the next recording starts clean
      // and expo-audio players can resume without audio framework conflicts.
      // Without this, Android's AudioManager stays in recording mode and produces
      // empty files on the next createAsync() — especially on Huawei/OEM devices.
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const uri = recording.getURI();
      recordingRef.current = null;
      setState("stopped");

      // Log using the ref — always current, no stale-closure risk
      console.log(
        `${TAG} stopped uri=${uri} peakDb=${peakDbRef.current.toFixed(1)} profile=${profileUsedRef.current}`
      );

      // Persist this profile as the preferred one for this device
      if (profileUsedRef.current) {
        void savePreferredProfile(profileUsedRef.current);
      }

      return uri ?? null;
    } catch (e) {
      console.error(`${TAG} stopRecording failed:`, e);
      setError(e instanceof Error ? e.message : "Failed to stop recording");
      recordingRef.current = null;
      setState("idle");
      return null;
    }
  }, [stopMetering]);

  // ── markProfileFailed ────────────────────────────────────────────────────────

  const markProfileFailed = useCallback(() => {
    const profile = profileUsedRef.current;
    if (profile) {
      console.warn(`${TAG} marking "${profile}" as failed — will skip for rest of session`);
      failedProfilesRef.current.add(profile);
      // Also clear it from AsyncStorage so next session doesn't start with it
      preferredProfileRef.current = null;
      void clearPreferredProfile();
    }
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    error,
    silenceDetected,
    peakDb,
    profileUsed,
    markProfileFailed,
  };
}

// ── Utility ───────────────────────────────────────────────────────────────────

export async function cleanupAudioFile(uri: string): Promise<void> {
  try {
    const { deleteAsync } = await import("expo-file-system/legacy");
    await deleteAsync(uri, { idempotent: true });
  } catch { /* non-critical */ }
}
