import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { CityBackground } from "@/components/CityBackground";
import { GameHeader } from "@/components/ui/GameHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import { BadgeToast } from "@/components/ui/BadgeToast";
import { useAlexAnimation } from "@/hooks/useAlexAnimation";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

export default function HomePage() {
  const router = useRouter();
  const { mood, showBubble, bubbleText, tap } = useAlexAnimation();
  const { playSFX } = useAudio();
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const questStarted = useGameStore((s) => s.questStarted);
  const updateStreak = useGameStore((s) => s.updateStreak);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

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
      {/* City background */}
      <View style={StyleSheet.absoluteFill}>
        <CityBackground />
      </View>

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
          <Text style={styles.subtitle}>Learn English the fun way!</Text>
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

      {/* Word of the Day shortcut */}
      <MotiView
        from={{ translateX: 80, opacity: 0 }}
        animate={{ translateX: 0, opacity: 1 }}
        transition={{ delay: 800, type: "spring", stiffness: 200, damping: 20 }}
        style={styles.vocabBtn}
      >
        <Pressable
          onPress={() => { playSFX("click"); router.push("/vocabulary/wotd"); }}
          style={styles.vocabBtnInner}
        >
          <Text style={{ fontSize: 22 }}>📖</Text>
          <View>
            <Text style={styles.vocabBtnLabel}>Word of</Text>
            <Text style={styles.vocabBtnLabel}>the Day</Text>
          </View>
        </Pressable>
      </MotiView>

      <BadgeToast />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
    gap: 24,
  },
  titleBlock: { alignItems: "center" },
  title: { fontFamily: fonts.display, fontSize: 26, color: "white", textShadowColor: "rgba(0,0,0,0.55)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 2, textShadowColor: "rgba(0,0,0,0.55)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  tapHint: { alignItems: "center", marginTop: -4 },
  tapHintText: { fontFamily: fonts.body, fontSize: 16, color: "white", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  questBlock: { alignItems: "center", gap: 12 },
  arrowHint: { alignItems: "center" },
  startHint: { fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.85)", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
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
