/**
 * ReunionScreen — end-game cutscene after completing Chapter 5.
 * Alex's mother and father slide in from the sides to reunite with him.
 * Auto-advances to /map after ~7.5 seconds.
 */
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { ConfettiBlast } from "@/components/animations/ConfettiBlast";
import { useAudio } from "@/hooks/useAudio";
import { fonts } from "@/lib/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const OFFSCREEN = SCREEN_W * 0.8;

export default function ReunionScreen() {
  const router = useRouter();
  const { playSFX } = useAudio();

  const [showMother, setShowMother] = useState(false);
  const [showFather, setShowFather] = useState(false);
  const [cheer, setCheer] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const navigateToMap = () => router.replace("/map");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setShowMother(true), 800),
      setTimeout(() => setShowFather(true), 1400),
      setTimeout(() => { setCheer(true); playSFX("levelUp"); }, 2200),
      setTimeout(() => setShowBubbles(true), 2800),
      setTimeout(() => setShowConfetti(true), 3600),
      setTimeout(navigateToMap, 7500),
    ];
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* Jungle night background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0D2B1A" }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#22C55E0D" }]} />

      <ConfettiBlast fire={showConfetti} />

      {/* Scene title */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400, duration: 700, type: "timing" }}
        style={styles.titleWrap}
        pointerEvents="none"
      >
        <Text style={styles.titleText}>Alex is home! 🌿</Text>
      </MotiView>

      {/* Character scene */}
      <View style={styles.scene} pointerEvents="none">
        {/* Father — slides in from left */}
        <MotiView
          from={{ translateX: -OFFSCREEN, opacity: 0 }}
          animate={showFather
            ? { translateX: 0, opacity: 1 }
            : { translateX: -OFFSCREEN, opacity: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 22 }}
          style={styles.fatherWrap}
        >
          <AlexCharacter
            variant="father"
            mood={cheer ? "cheer" : "idle"}
            showBubble={showBubbles}
            bubbleText="We missed you!"
          />
        </MotiView>

        {/* Alex — rises from center, in front */}
        <MotiView
          from={{ translateY: 80, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 200, type: "spring", stiffness: 130, damping: 18 }}
          style={styles.alexWrap}
        >
          <AlexCharacter
            variant="home"
            mood={cheer ? "cheer" : "happy"}
            showBubble={showBubbles}
            bubbleText="Mom! Dad!"
          />
        </MotiView>

        {/* Mother — slides in from right */}
        <MotiView
          from={{ translateX: OFFSCREEN, opacity: 0 }}
          animate={showMother
            ? { translateX: 0, opacity: 1 }
            : { translateX: OFFSCREEN, opacity: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 22 }}
          style={styles.motherWrap}
        >
          <AlexCharacter
            variant="mother"
            mood={cheer ? "cheer" : "idle"}
            showBubble={showBubbles}
            bubbleText="Alex!"
          />
        </MotiView>
      </View>

      {/* Cinematic bars */}
      <View style={styles.barTop} pointerEvents="none" />
      <View style={styles.barBottom} pointerEvents="none" />

      {/* Skip */}
      <Pressable onPress={navigateToMap} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip  ▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  titleWrap: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  titleText: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: "white",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  scene: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    height: 340,
  },
  // Father: left side, slightly taller so he looms over Alex
  fatherWrap: {
    position: "absolute",
    left: 8,
    bottom: 0,
  },
  // Alex: centered, in front (zIndex: 2)
  alexWrap: {
    position: "absolute",
    bottom: 0,
    left: SCREEN_W / 2 - 90, // 90 = half of home variant (180px)
    zIndex: 2,
  },
  // Mother: right side
  motherWrap: {
    position: "absolute",
    right: 8,
    bottom: 0,
  },
  barTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  barBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  skipBtn: {
    position: "absolute",
    top: 76,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
});
