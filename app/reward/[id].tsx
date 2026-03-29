import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlexCharacter } from "@/components/AlexCharacter";
import { StarRating } from "@/components/ui/StarRating";
import { ConfettiBlast } from "@/components/animations/ConfettiBlast";
import { getChapter } from "@/lib/chaptersData";
import { useGameStore, type ChapterId } from "@/store/gameStore";
import { useAudio } from "@/hooks/useAudio";
import { colors, fonts } from "@/lib/theme";

export default function RewardPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chapterId = Number(id) as ChapterId;
  const chapter = getChapter(chapterId);
  const { chapterProgress } = useGameStore();
  const { playSFX } = useAudio();
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = chapterProgress[chapterId];
  const stars = progress?.stars ?? 0;
  const xp = progress?.xpEarned ?? 0;

  useEffect(() => {
    setTimeout(() => {
      setShowConfetti(true);
      playSFX("levelUp");
    }, 400);
  }, []);

  if (!chapter) return null;

  const hasNext = chapterId < 5;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: chapter.accentColorHex }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.navy, opacity: 0.6 }]} />

      <ConfettiBlast fire={showConfetti} />

      <View style={styles.content}>
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

        {/* Stars */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600, type: "spring" }}
        >
          <StarRating stars={stars} size={48} />
        </MotiView>

        {/* XP */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 900, duration: 300, type: "timing" }}
          style={styles.xpBox}
        >
          <Text style={styles.xpText}>⚡ +{xp} XP earned!</Text>
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
      </View>

      {/* Buttons */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 1400, type: "spring" }}
        style={[styles.buttons, { paddingBottom: insets.bottom + 24 }]}
      >
        {hasNext && (
          <Pressable
            onPress={() => { playSFX("click"); router.replace("/map"); }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>Next Chapter →</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => { playSFX("click"); router.replace("/home"); }}
          style={styles.homeBtn}
        >
          <Text style={styles.homeBtnText}>{hasNext ? "Back to Home" : "🏠 Home"}</Text>
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
  xpBox: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  xpText: { fontFamily: fonts.display, fontSize: 20, color: colors.gold },
  storyBox: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 16, maxWidth: 340 },
  storyText: { fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", lineHeight: 22 },
  buttons: { paddingHorizontal: 24, gap: 12 },
  nextBtn: { backgroundColor: colors.gold, paddingVertical: 16, borderRadius: 100, alignItems: "center" },
  nextBtnText: { fontFamily: fonts.display, fontSize: 18, color: "white" },
  homeBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 14, borderRadius: 100, alignItems: "center" },
  homeBtnText: { fontFamily: fonts.body, fontSize: 15, color: "white" },
});
