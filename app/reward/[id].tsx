import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlexCharacter } from "@/components/AlexCharacter";
import { ConfettiBlast } from "@/components/animations/ConfettiBlast";
import { getChapter } from "@/lib/chaptersData";
import { useGameStore, type ChapterId } from "@/store/gameStore";
import { useAudio } from "@/hooks/useAudio";
import { MuteButton } from "@/components/ui/GameHeader";
import { colors, fonts } from "@/lib/theme";
import { toIPA } from "@/lib/phonemeData";
import { getScoreTier } from "@/lib/config";

export default function RewardPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chapterId = Number(id) as ChapterId;
  const chapter = getChapter(chapterId);
  const { questionScores } = useGameStore();
  const { playSFX } = useAudio();
  const [showConfetti, setShowConfetti] = useState(false);

  // Compute chapter pronunciation stats
  const chapterStats = useMemo(() => {
    const scores = Object.entries(questionScores)
      .filter(([key]) => key.startsWith(`${chapterId}-`))
      .map(([, result]) => result);

    if (scores.length === 0) return null;

    const avgPronunciation = Math.round(
      scores.reduce((s, r) => s + r.pronunciationScore, 0) / scores.length
    );
    const avgOverall = Math.round(
      scores.reduce((s, r) => s + r.overallScore, 0) / scores.length
    );

    // Find mastered vs problem phonemes from this chapter
    const phonemeScores: Record<string, number[]> = {};
    for (const result of scores) {
      for (const wr of result.wordResults) {
        for (const pr of wr.phonemes) {
          if (!phonemeScores[pr.arpabet]) phonemeScores[pr.arpabet] = [];
          phonemeScores[pr.arpabet].push(pr.qualityScore);
        }
      }
    }

    const mastered: string[] = [];
    const needsPractice: string[] = [];
    for (const [phoneme, scoreList] of Object.entries(phonemeScores)) {
      const avg = scoreList.reduce((a, b) => a + b, 0) / scoreList.length;
      if (avg >= 85) mastered.push(phoneme);
      else if (avg < 60) needsPractice.push(phoneme);
    }

    return { avgPronunciation, avgOverall, mastered, needsPractice, totalQuestions: scores.length };
  }, [questionScores, chapterId]);

  useEffect(() => {
    setTimeout(() => {
      setShowConfetti(true);
      playSFX("levelUp");
    }, 400);
  }, [playSFX]);

  if (!chapter) return null;

  const hasNext = chapterId < 5;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: chapter.accentColorHex }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.navy, opacity: 0.6 }]} />

      <ConfettiBlast fire={showConfetti} />
      <MuteButton style={{ position: "absolute", top: insets.top + 10, right: 16, zIndex: 10 }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Alex celebrating */}
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 200 }}
        >
          <AlexCharacter mood="cheer" variant="celebrating" />
        </MotiView>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400, duration: 400, type: "timing" }}
          style={styles.titleBlock}
        >
          <Text style={styles.congrats}>Chapter Complete! 🎉</Text>
          <Text style={styles.chapterName}>{chapter.title}</Text>
        </MotiView>

        {/* Story reward text */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1100, duration: 400, type: "timing" }}
          style={styles.storyBox}
        >
          <Text style={styles.storyText}>{chapter.story.reward}</Text>
        </MotiView>

        {/* Pronunciation Summary */}
        {chapterStats && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 1300, type: "spring" }}
            style={styles.pronSummary}
          >
            <Text style={styles.pronTitle}>Your Pronunciation</Text>
            <View style={styles.pronScoreRow}>
              <Text style={styles.pronScore}>
                {getScoreTier(chapterStats.avgPronunciation).emoji}{" "}
                {chapterStats.avgPronunciation}%
              </Text>
              <Text style={styles.pronLabel}>avg pronunciation</Text>
            </View>

            {chapterStats.mastered.length > 0 && (
              <View style={styles.phonemeSection}>
                <Text style={styles.phonemeSectionTitle}>Sounds you mastered</Text>
                <View style={styles.phonemePills}>
                  {chapterStats.mastered.slice(0, 8).map((p) => (
                    <View key={p} style={[styles.phonemePill, styles.masteredPill]}>
                      <Text style={styles.phonemePillText}>{toIPA(p)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {chapterStats.needsPractice.length > 0 && (
              <View style={styles.phonemeSection}>
                <Text style={styles.phonemeSectionTitle}>Sounds to keep practicing</Text>
                <View style={styles.phonemePills}>
                  {chapterStats.needsPractice.slice(0, 5).map((p) => (
                    <View key={p} style={[styles.phonemePill, styles.practicePill]}>
                      <Text style={styles.phonemePillText}>{toIPA(p)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </MotiView>
        )}
      </ScrollView>

      {/* Buttons */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1400, type: "spring" }}
        style={[styles.buttons, { paddingBottom: insets.bottom + 24 }]}
      >
        {hasNext ? (
          <Pressable
            onPress={() => { playSFX("click"); router.replace(`/journey/${chapterId}`); }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>Continue to Stage {chapterId + 1}  ▶</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => { playSFX("click"); router.replace("/reunion"); }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>Watch the Reunion 🦜</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => { playSFX("click"); router.replace("/map"); }}
          style={styles.homeBtn}
        >
          <Text style={styles.homeBtnText}>Back to Map</Text>
        </Pressable>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingHorizontal: 24 },
  titleBlock: { alignItems: "center" },
  congrats: { fontFamily: fonts.display, fontSize: 28, color: "white", textAlign: "center" },
  chapterName: { fontFamily: fonts.body, fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  storyBox: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, maxWidth: 340 },
  storyText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 22 },
  buttons: { paddingHorizontal: 24, gap: 12 },
  nextBtn: { backgroundColor: colors.gold, paddingVertical: 16, borderRadius: 100, alignItems: "center" },
  nextBtnText: { fontFamily: fonts.display, fontSize: 18, color: "white" },
  homeBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 14, borderRadius: 100, alignItems: "center" },
  homeBtnText: { fontFamily: fonts.body, fontSize: 15, color: "white" },
  pronSummary: { backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 16, width: "100%", maxWidth: 340, gap: 10 },
  pronTitle: { fontFamily: fonts.body, fontSize: 16, color: "white", textAlign: "center" },
  pronScoreRow: { alignItems: "center", gap: 2 },
  pronScore: { fontFamily: fonts.display, fontSize: 24, color: colors.gold },
  pronLabel: { fontFamily: fonts.bodyRegular, fontSize: 12, color: "rgba(255,255,255,0.6)" },
  phonemeSection: { gap: 6 },
  phonemeSectionTitle: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.7)" },
  phonemePills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  phonemePill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, minWidth: 32, alignItems: "center" },
  masteredPill: { backgroundColor: `${colors.success}40` },
  practicePill: { backgroundColor: `${colors.warning}40` },
  phonemePillText: { fontFamily: fonts.body, fontSize: 14, color: "white" },
});
