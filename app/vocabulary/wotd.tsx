import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";

import { MotiView } from "moti";
import { GameHeader } from "@/components/ui/GameHeader";
import { ScoreGauge } from "@/components/gameplay/ScoreGauge";
import { ScoreBars } from "@/components/gameplay/ScoreBars";
import { PhonemeBreakdown } from "@/components/gameplay/PhonemeBreakdown";
import { ProblemSounds } from "@/components/gameplay/ProblemSounds";
import { useWhisper } from "@/hooks/useWhisper";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { assessAnswer } from "@/lib/assessmentEngine";
import { getTodaysWord, getTodaysWordIndex, todayKey, WORD_OF_THE_DAY_BANK } from "@/lib/wordOfTheDay";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";
import type { AssessmentResult } from "@/types/assessment";

const ACCENT = colors.gold;

type RecordPhase = "idle" | "recording" | "assessing";

export default function WordOfTheDayPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const whisper = useWhisper();
  const recorder = useAudioRecorder();

  const { wotdHistory, saveWotdScore } = useGameStore();

  const todaysWord = getTodaysWord();
  const wordIndex = getTodaysWordIndex() + 1; // 1-based
  const dateKey = todayKey();
  const bestScore = wotdHistory[dateKey] ?? null;
  const practicedToday = bestScore !== null;

  const [phase, setPhase] = useState<RecordPhase>("idle");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [noSpeech, setNoSpeech] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = useCallback(() => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(todaysWord.word, {
      language: "en-US",
      rate: 0.85,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [speaking, todaysWord.word]);

  const handleMic = useCallback(async () => {
    if (phase === "idle") {
      setNoSpeech(false);
      try {
        // Audio mode setup + OEM timing delay is handled inside useAudioRecorder.startRecording()
        await recorder.startRecording();
        setPhase("recording");
      } catch {
        // permission denied or recorder unavailable — stay idle
      }
    } else if (phase === "recording") {
      const uri = await recorder.stopRecording();
      if (!uri) {
        setPhase("idle");
        return;
      }
      setPhase("assessing");

      // Guard: Whisper must be ready before attempting transcription
      if (!whisper.isReady) {
        console.warn("[wotd] whisper not ready — aborting");
        setNoSpeech(true);
        setPhase("idle");
        return;
      }

      // 15-second timeout to prevent hangs on slow devices
      const whisperResult = await Promise.race([
        whisper.transcribe(uri),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("wotd transcription timed out")), 15_000)
        ),
      ]).catch((err: unknown) => {
        console.warn("[wotd] transcription error:", err);
        return null;
      });

      if (!whisperResult) {
        setNoSpeech(true);
        setPhase("idle");
        return;
      }
      const assessment = assessAnswer(
        whisperResult,
        todaysWord.word,
        undefined,
        "speak",
        0
      );
      saveWotdScore(dateKey, assessment.overallScore);
      setResult(assessment);
      setPhase("idle");
    }
  }, [phase, recorder, whisper, todaysWord.word, saveWotdScore, dateKey]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setNoSpeech(false);
  }, []);

  const difficultyColor =
    todaysWord.difficulty === "beginner"
      ? colors.success
      : todaysWord.difficulty === "intermediate"
      ? colors.warning
      : colors.danger;

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bg]} />
      <GameHeader transparent />

      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Back</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>📖 Word of the Day</Text>
          <Text style={styles.pageCounter}>
            #{wordIndex} of {WORD_OF_THE_DAY_BANK.length}
          </Text>
        </View>

        {/* Main card */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350 }}
          style={styles.card}
        >
          {/* Word + TTS */}
          <View style={styles.wordRow}>
            <View style={styles.wordInfo}>
              <Text style={styles.wordText}>{todaysWord.word}</Text>
              <Text style={styles.ipaText}>{todaysWord.ipa}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.partOfSpeech}>{todaysWord.partOfSpeech}</Text>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: `${difficultyColor}20` },
                  ]}
                >
                  <Text
                    style={[styles.difficultyText, { color: difficultyColor }]}
                  >
                    {todaysWord.difficulty}
                  </Text>
                </View>
              </View>
            </View>
            <Pressable onPress={handleSpeak} style={styles.speakBtn}>
              <Text style={styles.speakBtnIcon}>{speaking ? "🔊" : "🔉"}</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Definition */}
          <Text style={styles.definition}>{todaysWord.definition}</Text>

          {/* Example */}
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>Example</Text>
            <Text style={styles.exampleText}>
              "{todaysWord.exampleSentence}"
            </Text>
          </View>

          {/* Pronunciation tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{todaysWord.pronunciationTip}</Text>
          </View>

          <View style={styles.divider} />

          {/* Practiced today badge */}
          {practicedToday && bestScore !== null && !result && (
            <View style={styles.practicedBadge}>
              <Text style={styles.practicedText}>
                ✅ Practiced today · Best: {bestScore}%
              </Text>
            </View>
          )}

          {/* Recording area */}
          {!result && (
            <View style={styles.recordingArea}>
              {noSpeech && (
                <Text style={styles.noSpeechText}>
                  No speech detected — try again.
                </Text>
              )}

              {!whisper.isReady && whisper.isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={ACCENT} />
                  <Text style={styles.loadingText}>
                    {whisper.downloadProgress > 0
                      ? `Downloading speech engine… ${Math.round(whisper.downloadProgress * 100)}%`
                      : "Loading speech engine…"}
                  </Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={handleMic}
                    disabled={phase === "assessing"}
                    style={[
                      styles.micBtn,
                      { backgroundColor: phase === "recording" ? colors.danger : ACCENT },
                    ]}
                  >
                    {phase === "assessing" ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.micIcon}>
                        {phase === "recording" ? "⏹" : "🎤"}
                      </Text>
                    )}
                  </Pressable>
                  <Text style={styles.micLabel}>
                    {phase === "recording"
                      ? "Tap to stop"
                      : phase === "assessing"
                      ? "Assessing…"
                      : practicedToday
                      ? "Try again"
                      : "Tap to record"}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Result */}
          {result && (
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.resultSection}
            >
              <View style={styles.gaugeRow}>
                <ScoreGauge score={result.overallScore} size={110} />
                <View style={styles.resultLabel}>
                  <Text style={styles.resultTitle}>
                    {result.overallScore >= 80
                      ? "Great job! 🌟"
                      : result.overallScore >= 60
                      ? "Almost there! 💪"
                      : "Keep practicing! 📚"}
                  </Text>
                  <Text style={styles.resultSub}>
                    Overall score
                  </Text>
                </View>
              </View>

              <ScoreBars
                contentScore={result.contentScore}
                pronunciationScore={result.pronunciationScore}
                fluencyScore={result.fluencyScore}
              />

              {result.wordResults.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Phonemes</Text>
                  <PhonemeBreakdown wordResults={result.wordResults} />
                </View>
              )}

              {result.problemSounds.length > 0 && (
                <View style={styles.section}>
                  <ProblemSounds problemSounds={result.problemSounds} />
                </View>
              )}

              <Pressable onPress={handleRetry} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>🔄 Try Again</Text>
              </Pressable>
            </MotiView>
          )}
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { backgroundColor: colors.navy },

  backBtn: { paddingHorizontal: 16, paddingVertical: 6 },
  backBtnText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.75)" },

  scroll: { paddingTop: 4, paddingHorizontal: 16 },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: "white",
  },
  pageCounter: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 14,
  },

  wordRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  wordInfo: { flex: 1, gap: 2 },
  wordText: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.navy,
  },
  ipaText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: `${colors.navy}99`,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  partOfSpeech: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: `${colors.navy}70`,
    fontStyle: "italic",
  },
  difficultyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyText: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
  speakBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${ACCENT}18`,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  speakBtnIcon: { fontSize: 20 },

  divider: {
    height: 1,
    backgroundColor: `${colors.navy}12`,
  },

  definition: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.navy,
    lineHeight: 22,
  },

  exampleBox: { gap: 4 },
  exampleLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: `${colors.navy}60`,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exampleText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: `${colors.navy}CC`,
    fontStyle: "italic",
    lineHeight: 20,
  },

  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: `${ACCENT}12`,
    borderRadius: 12,
    padding: 12,
  },
  tipIcon: { fontSize: 14, marginTop: 1 },
  tipText: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.navy,
    lineHeight: 19,
  },

  practicedBadge: {
    alignItems: "center",
    backgroundColor: `${colors.success}15`,
    borderRadius: 12,
    paddingVertical: 10,
  },
  practicedText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.success,
  },

  recordingArea: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  noSpeechText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.warning,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loadingText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}80`,
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  micIcon: { fontSize: 28 },
  micLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}80`,
  },

  resultSection: { gap: 16 },
  gaugeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  resultLabel: { flex: 1, gap: 2 },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.navy,
  },
  resultSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: `${colors.navy}60`,
  },

  section: { gap: 8 },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: `${colors.navy}80`,
  },

  retryBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${ACCENT}60`,
  },
  retryBtnText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: ACCENT,
  },
});
