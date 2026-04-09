import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { Audio } from "expo-av";
import { colors, fonts, shadows } from "@/lib/theme";
import { getScoreTier } from "@/lib/config";
import type { AssessmentResult } from "@/types/assessment";
import { ScoreGauge } from "./ScoreGauge";
import { PhonemeBreakdown } from "./PhonemeBreakdown";
import { ProblemSounds } from "./ProblemSounds";

interface Props {
  result: AssessmentResult | null;
  hint?: string;
  recordingUri?: string | null;
  onTryAgain?: () => void;
  onListen?: () => void;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

const PRAISE_LINES = [
  "Great job! 🌟",
  "Awesome! Keep it up! 🎉",
  "You got it! 💪",
  "Brilliant! 🏆",
  "Well done! 👏",
  "Excellent! ⭐",
  "Fantastic! 🥳",
  "Perfect! 🎯",
];

export const AnswerFeedback = memo(function AnswerFeedback({
  result,
  hint,
  recordingUri,
  onTryAgain,
  onListen,
  onNext,
  isLastQuestion,
}: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pick a random praise line once per result (stable across re-renders)
  const praiseLine = useMemo(
    () => PRAISE_LINES[Math.floor(Math.random() * PRAISE_LINES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result?.timestamp]
  );

  const handlePlayback = useCallback(async () => {
    if (!recordingUri || isPlaying) return;
    try {
      setIsPlaying(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (e) {
      console.error("[AnswerFeedback] playback failed:", e);
      setIsPlaying(false);
    }
  }, [recordingUri, isPlaying]);

  if (!result) return null;

  const { passed, pronunciationScore } = result;
  const isSimple = result.source === "simple";
  const pronTier = getScoreTier(pronunciationScore);

  // ── Simple card for identify (YES/NO) questions ──────────────────
  if (isSimple) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        style={[styles.container, passed ? styles.passedBorder : styles.failedBorder, shadows.card]}
      >
        {passed ? (
          <>
            <MotiView
              from={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
            >
              <Text style={[styles.simpleResultText, styles.simplePass]}>✓ Correct!</Text>
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200, type: "timing", duration: 300 }}
            >
              <Text style={styles.praiseText}>{praiseLine}</Text>
            </MotiView>
          </>
        ) : (
          <Text style={[styles.simpleResultText, styles.simpleFail]}>
            {result.description}
          </Text>
        )}

        {!passed && hint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        )}

        {!passed && (
          <View style={styles.actions}>
            {onListen && (
              <Pressable onPress={onListen} style={styles.listenBtn}>
                <Text style={styles.listenText}>Listen</Text>
              </Pressable>
            )}
            {onTryAgain && (
              <Pressable onPress={onTryAgain} style={styles.tryAgainBtn}>
                <Text style={styles.tryAgainText}>Try Again</Text>
              </Pressable>
            )}
          </View>
        )}

        {passed && onNext && (
          <Pressable onPress={onNext} style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>
              {isLastQuestion ? "Finish Chapter →" : "Next Question →"}
            </Text>
          </Pressable>
        )}

        <Text style={styles.encouragement}>{result.reflection.encouragement}</Text>
      </MotiView>
    );
  }

  // ── Full card: dual-track (content + pronunciation) ──────────────
  const hasPronunciationDetail =
    result.wordResults.length > 0 &&
    result.wordResults.some((w) => w.phonemes.length > 0);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      style={[styles.container, passed ? styles.passedBorder : styles.failedBorder, shadows.card]}
    >
      {/* ── TRACK 1: Content result ── */}
      <View style={[styles.contentBanner, passed ? styles.contentBannerPass : styles.contentBannerFail]}>
        <Text style={[styles.contentBannerIcon, passed ? styles.contentIconPass : styles.contentIconFail]}>
          {passed ? "✓" : "✗"}
        </Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.contentBannerLabel, passed ? styles.contentLabelPass : styles.contentLabelFail]}>
            {passed ? "Correct answer!" : "Not quite right"}
          </Text>
          <Text style={styles.contentFeedbackText}>{result.contentFeedback}</Text>
        </View>
      </View>

      {/* ── TRACK 2: Pronunciation coaching ── */}
      {result.source !== "fallback-local" && (
        <View style={styles.pronSection}>
          <View style={styles.pronHeader}>
            <ScoreGauge score={pronunciationScore} size={72} />
            <View style={styles.pronHeaderText}>
              <Text style={styles.pronSectionTitle}>Your pronunciation</Text>
              <Text style={[styles.pronTierLabel, { color: pronTier.color }]}>
                {pronTier.emoji} {pronTier.label}
              </Text>
              {result.pronunciationFeedback ? (
                <Text style={styles.pronFeedbackText}>{result.pronunciationFeedback}</Text>
              ) : null}
            </View>
          </View>

          {/* Phoneme Breakdown */}
          {hasPronunciationDetail && (
            <PhonemeBreakdown wordResults={result.wordResults} />
          )}

          {/* Problem Sounds — always show if any (even on pass, as coaching) */}
          {result.problemSounds.length > 0 && (
            <ProblemSounds problemSounds={result.problemSounds} />
          )}
        </View>
      )}

      {/* Reflection: Strengths */}
      {result.reflection.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {passed ? "Well done" : "What you did well"}
          </Text>
          {result.reflection.strengths.map((s, i) => (
            <Text key={i} style={styles.bulletItem}>• {s}</Text>
          ))}
        </View>
      )}

      {/* Areas to Improve — only on fail */}
      {!passed && result.reflection.areasToImprove.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to improve</Text>
          {result.reflection.areasToImprove.map((a, i) => (
            <Text key={i} style={styles.bulletItem}>• {a}</Text>
          ))}
        </View>
      )}

      {/* Practice Exercise — only on fail */}
      {!passed && result.reflection.practiceExercise ? (
        <View style={styles.practiceBox}>
          <Text style={styles.practiceLabel}>Try this:</Text>
          <Text style={styles.practiceText}>{result.reflection.practiceExercise}</Text>
        </View>
      ) : null}

      {/* Hint — only on fail */}
      {!passed && hint && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      )}

      {/* Hear yourself playback */}
      {recordingUri && (
        <Pressable onPress={handlePlayback} disabled={isPlaying} style={styles.playbackBtn}>
          <Text style={styles.playbackText}>
            {isPlaying ? "Playing…" : "🎙 Hear yourself"}
          </Text>
        </Pressable>
      )}

      {/* Action Buttons */}
      {!passed && (
        <View style={styles.actions}>
          {onListen && (
            <Pressable onPress={onListen} style={styles.listenBtn}>
              <Text style={styles.listenText}>Listen</Text>
            </Pressable>
          )}
          {onTryAgain && (
            <Pressable onPress={onTryAgain} style={styles.tryAgainBtn}>
              <Text style={styles.tryAgainText}>Try Again</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Praise line on correct full answers */}
      {passed && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <Text style={styles.praiseText}>{praiseLine}</Text>
        </MotiView>
      )}

      {/* Next / Finish button — content gates this */}
      {passed && onNext && (
        <Pressable onPress={onNext} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>
            {isLastQuestion ? "Finish Chapter" : "Next Question"}
          </Text>
        </Pressable>
      )}

      <Text style={styles.encouragement}>{result.reflection.encouragement}</Text>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    backgroundColor: "#FFFFFF",
  },
  passedBorder: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  failedBorder: {
    borderWidth: 2,
    borderColor: colors.warning,
  },

  // ── Track 1: Content banner ──
  contentBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 12,
  },
  contentBannerPass: {
    backgroundColor: `${colors.success}15`,
  },
  contentBannerFail: {
    backgroundColor: `${colors.warning}12`,
  },
  contentBannerIcon: {
    fontSize: 22,
    fontFamily: fonts.body,
  },
  contentIconPass: {
    color: colors.success,
  },
  contentIconFail: {
    color: colors.warning,
  },
  contentBannerLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: 2,
  },
  contentLabelPass: {
    color: colors.success,
  },
  contentLabelFail: {
    color: colors.navy,
  },
  contentFeedbackText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}BB`,
    lineHeight: 18,
  },

  // ── Track 2: Pronunciation section ──
  pronSection: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.navy}0F`,
    paddingTop: 12,
  },
  pronHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pronHeaderText: {
    flex: 1,
    gap: 2,
  },
  pronSectionTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: `${colors.navy}99`,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pronTierLabel: {
    fontFamily: fonts.body,
    fontSize: 16,
  },
  pronFeedbackText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: `${colors.navy}99`,
    lineHeight: 17,
    marginTop: 2,
  },

  // ── Common ──
  section: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.navy,
    marginBottom: 2,
  },
  bulletItem: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}CC`,
    paddingLeft: 8,
    lineHeight: 18,
  },
  practiceBox: {
    backgroundColor: `${colors.sky}15`,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.sky,
  },
  practiceLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.sky,
    marginBottom: 4,
  },
  practiceText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.navy,
    lineHeight: 18,
  },
  hintBox: {
    backgroundColor: `${colors.gold}18`,
    borderRadius: 12,
    padding: 12,
  },
  hintText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.navy,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 4,
  },
  listenBtn: {
    backgroundColor: `${colors.navy}0A`,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: `${colors.navy}18`,
  },
  listenText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.navy,
  },
  tryAgainBtn: {
    backgroundColor: colors.sky,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  tryAgainText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "white",
  },
  playbackBtn: {
    backgroundColor: `${colors.navy}08`,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${colors.navy}15`,
  },
  playbackText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navy,
  },
  simpleResultText: {
    fontFamily: fonts.body,
    fontSize: 20,
    textAlign: "center",
  },
  simplePass: {
    color: colors.success,
  },
  simpleFail: {
    color: colors.navy,
  },
  praiseText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.gold,
    textAlign: "center",
  },
  nextBtn: {
    backgroundColor: colors.gold,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.4,
    elevation: 6,
  },
  nextBtnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: "white",
  },
  encouragement: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: `${colors.navy}80`,
    textAlign: "center",
    fontStyle: "italic",
  },
});
