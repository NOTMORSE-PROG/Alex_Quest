/**
 * StageNodeV2 — premium layered medallion stage node.
 * Outer ring → themed plate → embossed emblem → state badge → idle bob.
 */
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from "react-native-svg";
import { fonts } from "@/lib/theme";
import type { Chapter } from "@/lib/chaptersData";

interface Props {
  chapter: Chapter;
  isUnlocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
  onPress: (chapter: Chapter) => void;
}

// Zone-themed inner plate colors
const ZONE_PLATE_COLORS: Record<number, [string, string]> = {
  1: ["#451a03", "#7c2d12"],  // Bakery — deep amber
  2: ["#0c1a2e", "#0c4a6e"],  // Fountain — deep blue
  3: ["#052e16", "#14532d"],  // Forest — deep green
  4: ["#1a0e00", "#4a2c0a"],  // Farm — dark earth
  5: ["#12002e", "#2d0a5a"],  // Jungle — deep purple
};

export const StageNodeV2 = memo(function StageNodeV2({
  chapter,
  isUnlocked,
  isActive,
  isCompleted,
  onPress,
}: Props) {
  const [pressed, setPressed] = useState(false);
  const color = chapter.accentColorHex;
  const [plateDark, plateLight] = ZONE_PLATE_COLORS[chapter.id] ?? ["#1f2937", "#374151"];

  const nodeContent = (
    <MotiView
      // Idle bob on active + completed nodes
      animate={
        isActive
          ? { translateY: [0, -6, 0] }
          : isCompleted
          ? { scale: [1, 1.015, 1] }
          : { translateY: 0, scale: 1 }
      }
      transition={
        isActive
          ? { loop: true, duration: 2200, type: "timing" }
          : isCompleted
          ? { loop: true, duration: 3500, type: "timing" }
          : { type: "timing", duration: 0 }
      }
    >
      <MotiView
        // Entry pop
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: pressed ? 0.9 : 1 }}
        transition={pressed ? { type: "timing", duration: 80 } : { type: "spring", stiffness: 260, damping: 18 }}
        style={styles.medallionWrapper}
      >
        {/* ── Outer glow halo (active only) ── */}
        {isActive && (
          <MotiView
            animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.12, 1] }}
            transition={{ loop: true, duration: 1800, type: "timing" }}
            style={[styles.glowHalo, { backgroundColor: color }]}
          />
        )}

        {/* ── Outer decorative ring ── */}
        <View
          style={[
            styles.outerRing,
            isUnlocked
              ? { borderColor: color, borderWidth: 3 }
              : { borderColor: "#374151", borderWidth: 2 },
            isCompleted && { borderColor: "#FBBF24", borderWidth: 3.5 },
            isActive && {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 16,
              elevation: 16,
            },
          ]}
        >
          {/* ── Inner plate with theme gradient ── */}
          <View style={[styles.innerPlate, { backgroundColor: plateDark }]}>
            {/* Radial glow inside plate */}
            <Svg
              width={76}
              height={76}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Defs>
                <RadialGradient id={`plateGlow${chapter.id}`} cx="50%" cy="40%" r="55%">
                  <Stop offset="0" stopColor={plateLight} stopOpacity="0.9" />
                  <Stop offset="1" stopColor={plateDark} stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <SvgCircle cx={38} cy={38} r={38} fill={`url(#plateGlow${chapter.id})`} />
            </Svg>

            {/* ── Emblem ── */}
            {!isUnlocked ? (
              <Text style={styles.lockIcon}>🔒</Text>
            ) : (
              <Text style={[styles.emoji, !isActive && !isCompleted && styles.emojiMuted]}>
                {chapter.animalEmoji}
              </Text>
            )}
          </View>
        </View>

        {/* ── Top-right state badge ── */}
        {isCompleted && (
          <MotiView
            from={{ scale: 0, rotate: "-30deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 100 }}
            style={styles.completedBadge}
          >
            <Text style={styles.completedBadgeText}>★</Text>
          </MotiView>
        )}
        {isActive && !isCompleted && (
          <MotiView
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ loop: true, duration: 900, type: "timing" }}
            style={[styles.activeBadge, { backgroundColor: color }]}
          >
            <Text style={styles.activeBadgeText}>▶</Text>
          </MotiView>
        )}

        {/* ── Stage number (bottom-left) ── */}
        <View
          style={[
            styles.stageNumBadge,
            isUnlocked && { borderColor: color },
          ]}
        >
          <Text style={[styles.stageNumText, !isUnlocked && styles.stageNumMuted]}>
            {chapter.id}
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={isUnlocked ? () => onPress(chapter) : undefined}
        onPressIn={() => isUnlocked && setPressed(true)}
        onPressOut={() => setPressed(false)}
        hitSlop={10}
      >
        {nodeContent}
      </Pressable>

      {/* ── PLAY label below active node ── */}
      {isActive && !isCompleted && (
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, type: "spring", stiffness: 200, damping: 18 }}
          style={[styles.playBanner, { backgroundColor: color }]}
        >
          <Text style={styles.playText}>▶ PLAY</Text>
        </MotiView>
      )}

      {/* ── DONE ribbon for completed node ── */}
      {isCompleted && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200, type: "spring", stiffness: 240, damping: 20 }}
          style={styles.doneBanner}
        >
          <Text style={styles.doneText}>✓ DONE</Text>
        </MotiView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  medallionWrapper: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  glowHalo: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    opacity: 0.35,
  },
  outerRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  innerPlate: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  emoji: {
    fontSize: 34,
  },
  emojiMuted: {
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  completedBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FBBF24",
    borderWidth: 2.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 8,
  },
  completedBadgeText: {
    fontSize: 13,
    color: "white",
    fontWeight: "900",
    lineHeight: 16,
  },
  activeBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  activeBadgeText: {
    fontSize: 9,
    color: "white",
    fontWeight: "900",
    marginLeft: 2,
  },
  stageNumBadge: {
    position: "absolute",
    bottom: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stageNumText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: "white",
    lineHeight: 14,
  },
  stageNumMuted: {
    opacity: 0.35,
  },
  playBanner: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  playText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: "white",
    letterSpacing: 1,
  },
  doneBanner: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "rgba(34,197,94,0.25)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.5)",
  },
  doneText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: "#86efac",
    letterSpacing: 0.8,
  },
});
