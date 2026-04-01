import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { GameHeader } from "@/components/ui/GameHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { useAlexAnimation } from "@/hooks/useAlexAnimation";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

type CloudDef = { top: string; left?: string; right?: string; scale: number; delay: number };
const CLOUDS: CloudDef[] = [
  { top: "8%", left: "5%", scale: 0.7, delay: 0 },
  { top: "15%", right: "8%", scale: 0.9, delay: 1000 },
  { top: "22%", left: "25%", scale: 0.6, delay: 2000 },
];

export default function HomePage() {
  const router = useRouter();
  const { mood, showBubble, bubbleText, tap } = useAlexAnimation();
  const { playSFX } = useAudio();
  const { tutorialCompleted, questStarted } = useGameStore();

  useEffect(() => {
    if (!tutorialCompleted) {
      const t = setTimeout(() => router.push("/tutorial"), 2000);
      return () => clearTimeout(t);
    }
  }, [tutorialCompleted, router]);

  const handleAlexTap = () => { tap(); playSFX("tap"); };
  const handleQuestClick = () => {
    playSFX("click");
    router.push(questStarted ? "/map" : "/quest");
  };

  return (
    <View style={styles.container}>
      {/* Sky gradient */}
      <View style={[StyleSheet.absoluteFill, styles.bg]} />

      {/* Floating clouds */}
      {CLOUDS.map((c, i) => (
        <MotiView
          key={i}
          animate={{ translateX: [0, 20, 0] }}
          transition={{ loop: true, duration: 6000 + i * 1000, delay: c.delay, type: "timing" }}
          style={[styles.cloud, { top: c.top, left: c.left, right: c.right, transform: [{ scale: c.scale }] }]}
        >
          <Text style={{ fontSize: 36 }}>☁️</Text>
        </MotiView>
      ))}

      <GameHeader transparent />

      <View style={styles.content}>
        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, duration: 400, type: "timing" }}
          style={styles.titleBlock}
        >
          <Text style={styles.title}>Alex's Quest</Text>
          <Text style={styles.subtitle}>for Home 🏠</Text>
        </MotiView>

        {/* Alex */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 300 }}
        >
          <AlexCharacter
            mood={mood}
            variant="home"
            showBubble={showBubble}
            bubbleText={bubbleText}
            onClick={handleAlexTap}
          />
          {!showBubble && (
            <MotiView
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ loop: true, duration: 2000, type: "timing" }}
              style={styles.tapHint}
            >
              <Text style={styles.tapHintText}>Tap Alex! 👆</Text>
            </MotiView>
          )}
        </MotiView>

        {/* Quest button */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500, duration: 400, type: "timing" }}
          style={styles.questBlock}
        >
          {!questStarted && (
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 12, delay: 600 }}
              style={styles.arrowHint}
            >
              <Text style={{ fontSize: 24 }}>👇</Text>
              <Text style={styles.startHint}>Start here!</Text>
            </MotiView>
          )}

          <Pressable onPress={handleQuestClick} style={styles.questBtn}>
            <View style={styles.questBtnInner}>
              <Text style={styles.questBtnText}>
                {questStarted ? "Continue Quest 🗺️" : "Start Quest →"}
              </Text>
            </View>
          </Pressable>
        </MotiView>
      </View>

      {/* Vocab shortcut */}
      <MotiView
        from={{ translateX: 80, opacity: 0 }}
        animate={{ translateX: 0, opacity: 1 }}
        transition={{ delay: 800, type: "spring", stiffness: 200, damping: 20 }}
        style={styles.vocabBtn}
      >
        <Pressable
          onPress={() => { playSFX("click"); router.push("/vocabulary"); }}
          style={styles.vocabBtnInner}
        >
          <Text style={{ fontSize: 22 }}>📖</Text>
          <View>
            <Text style={styles.vocabBtnLabel}>Word of</Text>
            <Text style={styles.vocabBtnLabel}>the Day</Text>
          </View>
        </Pressable>
      </MotiView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { backgroundColor: colors.sky },
  cloud: { position: "absolute" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    gap: 24,
  },
  titleBlock: { alignItems: "center" },
  title: { fontFamily: fonts.display, fontSize: 26, color: "white" },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  tapHint: { alignItems: "center", marginTop: -4 },
  tapHintText: { fontFamily: fonts.body, fontSize: 16, color: "white", textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  questBlock: { alignItems: "center", gap: 12 },
  arrowHint: { alignItems: "center" },
  startHint: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.6)" },
  questBtn: {},
  questBtnInner: {
    backgroundColor: colors.gold,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  questBtnText: { fontFamily: fonts.display, fontSize: 20, color: "white" },
  vocabBtn: { position: "absolute", top: 100, right: 16, zIndex: 20 },
  vocabBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  vocabBtnLabel: { fontFamily: fonts.display, color: colors.navy, fontSize: 12 },
});
