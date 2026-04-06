import { useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { Audio } from "expo-av";
import { colors, fonts, shadows } from "@/lib/theme";
import { getScoreTier } from "@/lib/config";
import type { AssessmentResult } from "@/types/assessment";
import { ScoreGauge } from "./ScoreGauge";
import { ScoreBars } from "./ScoreBars";
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

export function AnswerFeedback({ result, hint, recordingUri, onTryAgain, onListen, onNext, isLastQuestion }: Props) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayback = useCallback(async () => {
    if (!recordingUri || isPlaying) return;
    try {
      setIsPlaying(true);
      // Unload previous sound
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

  const isSimple = result.source === "simple";
  const { passed, overallScore } = result;
  const tier = getScoreTier(overallScore);

  // Simplified card for identify (YES/NO) questions — no scores or phoneme breakdown
  if (isSimple) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        style={[styles.container, passed ? styles.passedBorder : styles.failedBorder, shadows.card]}
      >
        <Text style={[styles.simpleResultText, passed ? styles.simplePass : styles.simpleFail]}>
          {passed ? "Correct!" : result.description}
        </Text>

        {!passed && hint ? (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        ) : null}

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

        <Text style={styles.encouragement}>
          {result.reflection.encouragement}
        </Text>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      style={[styles.container, passed ? styles.passedBorder : styles.failedBorder, shadows.card]}
    >
      {/* Score Gauge + Tier Label */}
      <View style={styles.headerRow}>
        <ScoreGauge score={overallScore} size={90} />
        <View style={styles.headerText}>
          <Text style={styles.tierLabel}>
            {tier.emoji} {tier.label}
          </Text>
          <Text style={styles.description}>{result.description}</Text>
        </View>
      </View>

      {/* Sub-score bars (only on fail — keep success feedback brief) */}
      {!passed && (
        <ScoreBars
          contentScore={result.contentScore}
          pronunciationScore={result.pronunciationScore}
          fluencyScore={result.fluencyScore}
        />
      )}

      {/* Phoneme Breakdown */}
      {result.wordResults.length > 0 &&
        result.wordResults.some((w) => w.phonemes.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your pronunciation</Text>
            <PhonemeBreakdown wordResults={result.wordResults} />
          </View>
        )}

      {/* Problem Sounds */}
      {!passed && result.problemSounds.length > 0 && (
        <ProblemSounds problemSounds={result.problemSounds} />
      )}

      {/* Reflection: Strengths */}
      {result.reflection.strengths.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {passed ? "Well done" : "What you did well"}
          </Text>
          {result.reflection.strengths.map((s, i) => (
            <Text key={i} style={styles.bulletItem}>
              {"\u2022"} {s}
            </Text>
          ))}
        </View>
      )}

      {/* Reflection: Areas to Improve (only on fail) */}
      {!passed && result.reflection.areasToImprove.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to improve</Text>
          {result.reflection.areasToImprove.map((a, i) => (
            <Text key={i} style={styles.bulletItem}>
              {"\u2022"} {a}
            </Text>
          ))}
        </View>
      )}

      {/* Practice Exercise (only on fail) */}
      {!passed && result.reflection.practiceExercise ? (
        <View style={styles.practiceBox}>
          <Text style={styles.practiceLabel}>Try this:</Text>
          <Text style={styles.practiceText}>
            {result.reflection.practiceExercise}
          </Text>
        </View>
      ) : null}

      {/* Hint (escalating, from question data) */}
      {!passed && hint ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}

      {/* Hear yourself playback — always visible when recording exists */}
      {recordingUri && (
        <Pressable onPress={handlePlayback} disabled={isPlaying} style={styles.playbackBtn}>
          <Text style={styles.playbackText}>
            {isPlaying ? "Playing..." : "Hear yourself"}
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

      {/* Next / Finish button — only on pass */}
      {passed && onNext && (
        <Pressable onPress={onNext} style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>
            {isLastQuestion ? "Finish Chapter →" : "Next Question →"}
          </Text>
        </Pressable>
      )}

      {/* Encouragement */}
      <Text style={styles.encouragement}>
        {result.reflection.encouragement}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  passedBorder: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.success,
  },
  failedBorder: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.warning,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  tierLabel: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.navy,
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}CC`,
    lineHeight: 18,
  },
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
