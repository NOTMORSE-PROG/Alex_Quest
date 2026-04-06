import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { fonts } from "@/lib/theme";
import type { Chapter } from "@/lib/chaptersData";

interface Props {
  chapter: Chapter;
  isUnlocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
  onPress: (chapter: Chapter) => void;
}

export const StageNode = memo(function StageNode({ chapter, isUnlocked, isActive, isCompleted, onPress }: Props) {
  const color = chapter.accentColorHex;

  return (
    <View style={styles.container}>
      {/* Outer glow ring for active node */}
      {isActive && (
        <MotiView
          from={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [1, 1.28, 1], opacity: [0.65, 0.15, 0.65] }}
          transition={{ loop: true, duration: 2200, type: "timing" }}
          style={[styles.glowRing, { borderColor: color }]}
        />
      )}

      <Pressable onPress={isUnlocked ? () => onPress(chapter) : undefined} hitSlop={8}>
        <MotiView
          animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={
            isActive
              ? { loop: true, duration: 1800, type: "timing" }
              : { duration: 300, type: "timing" }
          }
          style={[
            styles.node,
            isCompleted && { backgroundColor: color, borderColor: "#FBBF24", borderWidth: 4 },
            isActive && !isCompleted && { backgroundColor: color, borderColor: "rgba(255,255,255,0.5)", borderWidth: 3 },
            !isUnlocked && styles.nodeLocked,
            isActive && { shadowColor: color, shadowRadius: 18, shadowOpacity: 0.8, elevation: 18 },
          ]}
        >
          {!isUnlocked ? (
            <Text style={styles.lockIcon}>🔒</Text>
          ) : (
            <Text style={styles.emoji}>{chapter.animalEmoji}</Text>
          )}

          {/* Gold check badge for completed stages */}
          {isCompleted && (
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}

          {/* Stage number — bottom-left corner */}
          <View style={styles.stageNumWrap}>
            <Text style={[styles.stageNum, !isUnlocked && { opacity: 0.4 }]}>
              {chapter.id}
            </Text>
          </View>
        </MotiView>
      </Pressable>

      {/* PLAY banner for current active node */}
      {isActive && !isCompleted && (
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: [0.85, 1, 0.85], translateY: 0 }}
          transition={{ loop: true, duration: 1600, type: "timing" }}
          style={[styles.playBanner, { backgroundColor: color }]}
        >
          <Text style={styles.playText}>▶ PLAY</Text>
        </MotiView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  glowRing: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    top: -10,
    left: -10,
  },
  node: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#1F2937",
    borderColor: "#4B5563",
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  nodeLocked: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    opacity: 0.58,
  },
  emoji: {
    fontSize: 36,
  },
  lockIcon: {
    fontSize: 26,
  },
  checkBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#22C55E",
    borderWidth: 2.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 13,
    color: "white",
    fontWeight: "800",
    lineHeight: 15,
  },
  stageNumWrap: {
    position: "absolute",
    bottom: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  stageNum: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: "white",
    lineHeight: 14,
  },
  playBanner: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  playText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: "white",
    letterSpacing: 0.8,
  },
});
