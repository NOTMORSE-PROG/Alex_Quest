/**
 * ReunionScreen — dramatic end-game cutscene after completing Chapter 5.
 * Alex's mother and father slide in from the sides to reunite with him,
 * with sequential story text, firefly bokeh, and a storybook "THE END" card.
 * Auto-advances to /map after ~13 seconds.
 */
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { ConfettiBlast } from "@/components/animations/ConfettiBlast";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const OFFSCREEN = SCREEN_W * 0.65;

// Firefly/bokeh specs — random-ish positions distributed across the screen
const BOKEH = [
  { x: 0.08, y: 0.12, r: 5, color: colors.gold,    opacity: 0.28, delay: 0 },
  { x: 0.85, y: 0.18, r: 4, color: "#a8e6cf",      opacity: 0.22, delay: 600 },
  { x: 0.22, y: 0.55, r: 6, color: colors.gold,    opacity: 0.18, delay: 300 },
  { x: 0.75, y: 0.42, r: 4, color: "white",         opacity: 0.20, delay: 900 },
  { x: 0.50, y: 0.08, r: 5, color: "#22C55E",       opacity: 0.16, delay: 200 },
  { x: 0.12, y: 0.75, r: 3, color: "white",         opacity: 0.14, delay: 750 },
  { x: 0.88, y: 0.70, r: 5, color: colors.gold,    opacity: 0.22, delay: 400 },
  { x: 0.38, y: 0.88, r: 4, color: "#a8e6cf",      opacity: 0.18, delay: 1100 },
  { x: 0.62, y: 0.22, r: 3, color: "white",         opacity: 0.16, delay: 850 },
  { x: 0.93, y: 0.50, r: 4, color: colors.gold,    opacity: 0.20, delay: 500 },
];

/** Three sequential narrative lines shown before the reunion */
const STORY_LINES = [
  { text: "A long journey ends…",              delay: 300,  exitAt: 1100 },
  { text: "Through city, park, and jungle…",   delay: 1400, exitAt: 2200 },
  { text: "Alex is finally home.",             delay: 2900, exitAt: 4800 },
];

export default function ReunionScreen() {
  const router = useRouter();
  const { playSFX } = useAudio();
  const setReunionWatched = useGameStore((s) => s.setReunionWatched);

  const [storyLine, setStoryLine]         = useState<number | null>(null);
  const [showMother, setShowMother]       = useState(false);
  const [showFather, setShowFather]       = useState(false);
  const [cheer, setCheer]                 = useState(false);
  const [showBubbles, setShowBubbles]     = useState(false);
  const [showConfetti, setShowConfetti]   = useState(false);
  const [showEndCard, setShowEndCard]     = useState(false);

  const navigateToMap = () => {
    setReunionWatched();
    router.replace("/certificate");
  };

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      // Story text sequence
      setTimeout(() => setStoryLine(0), STORY_LINES[0].delay),
      setTimeout(() => setStoryLine(null), STORY_LINES[0].exitAt),
      setTimeout(() => setStoryLine(1), STORY_LINES[1].delay),
      setTimeout(() => setStoryLine(null), STORY_LINES[1].exitAt),
      setTimeout(() => setStoryLine(2), STORY_LINES[2].delay),
      setTimeout(() => setStoryLine(null), STORY_LINES[2].exitAt),

      // Characters slide in
      setTimeout(() => setShowMother(true), 3200),
      setTimeout(() => setShowFather(true), 3800),

      // Cheer + SFX
      setTimeout(() => { setCheer(true); playSFX("levelUp"); }, 4600),
      setTimeout(() => setShowBubbles(true), 5200),

      // Confetti
      setTimeout(() => setShowConfetti(true), 5800),

      // THE END card
      setTimeout(() => setShowEndCard(true), 7000),

      // Auto-advance
      setTimeout(navigateToMap, 13000),
    ];
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* Deep midnight jungle background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#050F08" }]} />

      {/* Warm radial glow centred on characters */}
      <View style={styles.radialGlow} />

      {/* Animated bokeh / fireflies */}
      {BOKEH.map((b, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0 }}
          animate={{ opacity: b.opacity }}
          transition={{
            loop: true,
            type: "timing",
            duration: 1800,
            delay: b.delay,
            repeatReverse: true,
          }}
          style={[
            styles.bokeh,
            {
              left: SCREEN_W * b.x - b.r,
              top: SCREEN_H * b.y - b.r,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: b.r,
              backgroundColor: b.color,
            },
          ]}
        />
      ))}

      <ConfettiBlast fire={showConfetti} />

      {/* Sequential story text */}
      <AnimatePresence>
        {storyLine !== null && (
          <MotiView
            key={storyLine}
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 10 }}
            transition={{ type: "timing", duration: 500 }}
            style={styles.storyTextWrap}
            pointerEvents="none"
          >
            <Text
              style={[
                styles.storyText,
                storyLine === 2 && styles.storyTextLarge,
              ]}
            >
              {STORY_LINES[storyLine].text}
            </Text>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Character scene */}
      <View style={styles.scene} pointerEvents="none">
        {/* Father — slides in from left, positioned closer to centre */}
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

        {/* Alex — rises from centre, in front */}
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

        {/* Mother — slides in from right, positioned closer to centre */}
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

      {/* THE END storybook card */}
      <AnimatePresence>
        {showEndCard && (
          <MotiView
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={styles.endCard}
            pointerEvents="none"
          >
            <Text style={styles.endCardDivider}>✦ ✦ ✦</Text>
            <Text style={styles.endCardTitle}>THE END</Text>
            <Text style={styles.endCardDivider}>✦ ✦ ✦</Text>
            <Text style={styles.endCardBody}>
              Alex reunited with his family.{"\n"}Your adventure is complete!
            </Text>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Skip */}
      <Pressable onPress={navigateToMap} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip  ▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },

  // Warm radial glow behind the characters
  radialGlow: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "rgba(245,166,35,0.07)",
    bottom: 80,
    left: SCREEN_W / 2 - 180,
  },

  bokeh: {
    position: "absolute",
  },

  // Sequential story text (fades in and out)
  storyTextWrap: {
    position: "absolute",
    top: 110,
    left: 24,
    right: 24,
    alignItems: "center",
    zIndex: 5,
  },
  storyText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 17,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storyTextLarge: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: "white",
    fontStyle: "normal",
    textShadowRadius: 8,
  },

  // Character scene — taller and characters positioned closer to centre
  scene: {
    position: "absolute",
    bottom: 88,
    left: 0,
    right: 0,
    height: 420,
  },
  fatherWrap: {
    position: "absolute",
    left: SCREEN_W * 0.04,
    bottom: 0,
  },
  alexWrap: {
    position: "absolute",
    bottom: 20,
    left: SCREEN_W / 2 - 90,
    zIndex: 2,
  },
  motherWrap: {
    position: "absolute",
    right: SCREEN_W * 0.04,
    bottom: 0,
  },

  // Cinematic letterbox bars
  barTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.80)",
  },
  barBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: "rgba(0,0,0,0.80)",
  },

  // THE END card
  endCard: {
    position: "absolute",
    top: SCREEN_H * 0.18,
    left: 32,
    right: 32,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.gold,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  endCardTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.gold,
    letterSpacing: 4,
    textShadowColor: "rgba(245,166,35,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  endCardDivider: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.gold,
    opacity: 0.7,
    letterSpacing: 4,
  },
  endCardBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
  },

  // Skip button
  skipBtn: {
    position: "absolute",
    top: 84,
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
