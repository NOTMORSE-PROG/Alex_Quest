import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlexCharacter } from "@/components/AlexCharacter";
import { VideoPlayer } from "@/components/VideoPlayer";
import { getChapter } from "@/lib/chaptersData";
import { useGameStore, type ChapterId } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

type Phase = "info" | "video" | "done";

export default function LessonPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chapterId = Number(id) as ChapterId;
  const chapter = getChapter(chapterId);
  const { setCurrentChapter } = useGameStore();

  const [phase, setPhase] = useState<Phase>("info");

  const handleVideoEnd = useCallback(() => {
    setPhase("done");
  }, []);

  const handleContinue = () => {
    setCurrentChapter(chapterId);
    router.replace(`/chapter/${id}`);
  };

  if (!chapter) return null;

  // Phase 2: Video playback
  if (phase === "video") {
    return (
      <View style={styles.videoContainer}>
        <VideoPlayer
          source={chapter.lessonVideo}
          onEnd={handleVideoEnd}
          onSkip={handleVideoEnd}
          showSkip
        />
      </View>
    );
  }

  // Phase 1: Lesson info & Phase 3: Done (continue to assessment)
  return (
    <View style={[styles.container, { backgroundColor: chapter.accentColorHex }]}>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <MotiView
          from={{ opacity: 0, translateY: -15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={styles.badge}
        >
          <Text style={styles.emoji}>{chapter.animalEmoji}</Text>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <Text style={styles.objective}>{chapter.learningObjective}</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 150, type: "timing", duration: 400 }}
          style={styles.alexWrap}
        >
          <AlexCharacter mood={phase === "done" ? "happy" : "thinking"} variant="home" />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 250, type: "timing", duration: 400 }}
          style={styles.card}
        >
          {phase === "info" ? (
            <>
              <Text style={styles.cardTitle}>📖 Lesson Overview</Text>
              <Text style={styles.cardBody}>{chapter.lessonDescription}</Text>
              <Text style={styles.loText}>{chapter.loDescription}</Text>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>✅ Lesson Complete!</Text>
              <Text style={styles.cardBody}>
                Great job watching the lesson! Now it's time to test what you've learned.
              </Text>
            </>
          )}
        </MotiView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={phase === "info" ? () => setPhase("video") : handleContinue}
          style={styles.btn}
        >
          <Text style={styles.btnText}>
            {phase === "info" ? "Watch Lesson  ▶" : "Continue to Assessment  ▶"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  videoContainer: { flex: 1, backgroundColor: "#000" },
  overlay: { backgroundColor: "rgba(26,26,46,0.55)" },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 20,
  },
  badge: { alignItems: "center", gap: 4 },
  emoji: { fontSize: 48 },
  chapterTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: "white",
    textAlign: "center",
  },
  objective: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
  },
  alexWrap: { alignItems: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    gap: 12,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: "white",
  },
  cardBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
  },
  loText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  btn: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  btnText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: "white",
  },
});
