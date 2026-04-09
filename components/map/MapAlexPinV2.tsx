/**
 * MapAlexPinV2 — Alex character on the map with ground shadow,
 * an arrow tether connecting to the current node, and a richer speech bubble.
 * Shows chapter-specific homesick lines as Alex progresses through the journey.
 */
import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { fonts } from "@/lib/theme";
import { useGameStore, type ChapterId } from "@/store/gameStore";

interface Props {
  x: number;
  y: number;
  accentColor?: string;
}

// Homesick messages shown as Alex progresses through the journey
const MESSAGES = [
  "You're here! 🎯",
  "Miss home... 🌴",
  "Getting closer! 💪",
  "Almost there! 🏠",
  "Home! 🎉",
];

export function MapAlexPinV2({ x, y, accentColor = "#F5A623" }: Props) {
  const chapterProgress = useGameStore((s) => s.chapterProgress);

  // Find the highest completed chapter to pick message
  const highestDone = ([5, 4, 3, 2, 1] as ChapterId[]).find(
    (id) => chapterProgress[id]?.completed
  ) ?? 0;
  // Map 0-5 → index 0-4
  const msgIndex = Math.min(Math.max(highestDone, 0), MESSAGES.length - 1);
  const message = MESSAGES[msgIndex];

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 550, type: "spring", stiffness: 200, damping: 16 }}
      style={[styles.wrapper, { left: x - 90, top: y - 148 }]}
    >
      {/* Arrow tether pointing down to node */}
      <View style={[styles.tether, { borderTopColor: accentColor }]} />
      <View style={[styles.tetherLine, { backgroundColor: accentColor }]} />

      {/* Speech bubble */}
      <MotiView
        from={{ opacity: 0, scale: 0.75, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ delay: 900, type: "spring", stiffness: 280, damping: 20 }}
        style={[styles.bubble, { borderColor: accentColor }]}
      >
        <Text style={styles.bubbleText}>{message}</Text>
        <View style={[styles.bubbleTail, { borderTopColor: "white" }]} />
      </MotiView>

      {/* Alex floating */}
      <MotiView
        animate={{ translateY: [0, -7, 0] }}
        transition={{ loop: true, duration: 2400, type: "timing" }}
        style={styles.alexWrap}
      >
        <AlexCharacter mood="happy" variant="small" />
      </MotiView>

      {/* Ground shadow — grows/shrinks with bob */}
      <MotiView
        animate={{ scaleX: [1, 0.7, 1], opacity: [0.4, 0.2, 0.4] }}
        transition={{ loop: true, duration: 2400, type: "timing" }}
        style={styles.shadow}
      />
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignItems: "center",
    width: 136,
  },
  tetherLine: {
    width: 2,
    height: 12,
    borderRadius: 1,
    opacity: 0.6,
    marginBottom: 0,
  },
  tether: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    opacity: 0.8,
  },
  bubble: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 6,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
  },
  bubbleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: "#1F2937",
    textAlign: "center",
  },
  bubbleTail: {
    position: "absolute",
    bottom: -9,
    alignSelf: "center",
    left: "50%",
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  alexWrap: {
    marginTop: 4,
  },
  shadow: {
    width: 44,
    height: 10,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    marginTop: -4,
  },
});
