/**
 * JourneyScreen — chapter-to-chapter cutscene where Alex walks between map pins.
 * Shown after reward screen when the user taps "Continue to Stage X".
 * id = the chapter just completed (Alex walks from id → id+1).
 */
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import Svg, { Circle, Line } from "react-native-svg";
import { AlexCharacter } from "@/components/AlexCharacter";
import { NODE_POSITIONS } from "@/components/map/MapPath";
import { useAudio } from "@/hooks/useAudio";
import type { ChapterId } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");
const WALK_DURATION = 2200; // ms for Alex to walk between nodes

const CHAPTER_NAMES: Record<number, string> = {
  1: "The Bakery District",
  2: "The Fountain Square",
  3: "The Forest Trail",
  4: "The Farm Fields",
  5: "The Enchanted Forest",
};

const CHAPTER_COLORS: Record<number, string> = {
  1: "#D97706",
  2: "#0EA5E9",
  3: "#16A34A",
  4: "#CA8A04",
  5: "#22C55E",
};

// Canvas dimensions match MapPath
const CANVAS_W = 390;
const CANVAS_H = 1760;

export default function JourneyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const fromId = Number(id) as ChapterId;
  const toId = Math.min(fromId + 1, 5) as ChapterId;

  const { playSFX } = useAudio();

  const fromPos = NODE_POSITIONS[fromId - 1];
  const toPos = NODE_POSITIONS[toId - 1];

  // Scale canvas down to screen width
  const scale = SCREEN_W / CANVAS_W;

  // Scaled positions on screen
  const fromScreen = { x: fromPos.x * scale, y: fromPos.y * scale };
  const toScreen = { x: toPos.x * scale, y: toPos.y * scale };

  // Find midpoint — we'll center the viewport between the two nodes
  const midY = (fromScreen.y + toScreen.y) / 2;
  const viewportTop = Math.max(0, midY - SCREEN_H / 2);

  // Adjusted y positions relative to viewport
  const fromView = { x: fromScreen.x, y: fromScreen.y - viewportTop };
  const toView = { x: toScreen.x, y: toScreen.y - viewportTop };

  // Animated values for Alex position
  const animX = useRef(new Animated.Value(fromView.x)).current;
  const animY = useRef(new Animated.Value(fromView.y)).current;

  const [phase, setPhase] = useState<"walking" | "arrived">("walking");

  const navigateNext = () => {
    router.replace(`/lesson/${toId}`);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      playSFX("tap");
      Animated.parallel([
        Animated.timing(animX, {
          toValue: toView.x,
          duration: WALK_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(animY, {
          toValue: toView.y,
          duration: WALK_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        playSFX("levelUp");
        setPhase("arrived");
        setTimeout(navigateNext, 2600);
      });
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accentColor = CHAPTER_COLORS[toId];
  const svgH = CANVAS_H * scale;

  return (
    <View style={styles.container}>
      {/* Gradient background based on destination chapter */}
      <View style={[styles.bg, { backgroundColor: "#0F172A" }]} />
      <View style={[styles.bgAccent, { backgroundColor: accentColor + "18" }]} />

      {/* Map path snippet — show scaled SVG with the two nodes */}
      <View style={[styles.svgWrap, { top: -viewportTop }]} pointerEvents="none">
        <Svg width={SCREEN_W} height={svgH}>
          {/* Track line between nodes */}
          <Line
            x1={fromScreen.x}
            y1={fromScreen.y}
            x2={toScreen.x}
            y2={toScreen.y}
            stroke="#374151"
            strokeWidth={18}
            strokeLinecap="round"
          />
          <Line
            x1={fromScreen.x}
            y1={fromScreen.y}
            x2={toScreen.x}
            y2={toScreen.y}
            stroke={accentColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray="12 10"
          />
          {/* From node (completed) */}
          <Circle cx={fromScreen.x} cy={fromScreen.y} r={22} fill={CHAPTER_COLORS[fromId]} />
          <Circle cx={fromScreen.x} cy={fromScreen.y} r={16} fill="white" opacity={0.35} />
          {/* To node (unlocking) */}
          <Circle
            cx={toScreen.x}
            cy={toScreen.y}
            r={26}
            fill={phase === "arrived" ? accentColor : "#374151"}
          />
          {phase === "arrived" && (
            <Circle cx={toScreen.x} cy={toScreen.y} r={18} fill="white" opacity={0.4} />
          )}
        </Svg>
      </View>

      {/* Alex walking */}
      <Animated.View
        style={[
          styles.alex,
          {
            transform: [
              { translateX: Animated.subtract(animX, 24) },
              { translateY: Animated.subtract(animY, 52) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <AlexCharacter
          mood={phase === "arrived" ? "cheer" : "happy"}
          variant="small"
        />
      </Animated.View>

      {/* Cinematic bars */}
      <View style={[styles.bar, styles.barTop]} pointerEvents="none" />
      <View style={[styles.bar, styles.barBottom]} pointerEvents="none" />

      {/* "Stage Unlocked" toast */}
      {phase === "arrived" && (
        <MotiView
          from={{ opacity: 0, scale: 0.8, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          style={styles.toast}
          pointerEvents="none"
        >
          <Text style={styles.toastEmoji}>🎉</Text>
          <Text style={styles.toastTitle}>Stage {toId} Unlocked!</Text>
          <Text style={styles.toastSub}>{CHAPTER_NAMES[toId]}</Text>
        </MotiView>
      )}

      {/* Skip */}
      {phase === "walking" && (
        <Pressable onPress={navigateNext} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip  ▶</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  bg: { ...StyleSheet.absoluteFillObject },
  bgAccent: { ...StyleSheet.absoluteFillObject },
  svgWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  alex: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  barTop: { top: 0, height: 72 },
  barBottom: { bottom: 0, height: 88 },
  toast: {
    position: "absolute",
    bottom: 104,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
  },
  toastEmoji: { fontSize: 38 },
  toastTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.navy,
    textAlign: "center",
  },
  toastSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: `${colors.navy}99`,
    textAlign: "center",
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
