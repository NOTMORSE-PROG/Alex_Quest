import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { fonts } from "@/lib/theme";

interface Props {
  x: number;
  y: number;
}

export function MapAlexPin({ x, y }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 600, type: "spring", stiffness: 200, damping: 16 }}
      style={[styles.wrapper, { left: x - 70, top: y - 140 }]}
    >
      {/* Speech bubble */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 900, type: "spring", stiffness: 260, damping: 20 }}
        style={styles.bubble}
      >
        <Text style={styles.bubbleText}>You're here! 🎯</Text>
        <View style={styles.bubbleTail} />
      </MotiView>

      {/* Alex floating animation */}
      <MotiView
        animate={{ translateY: [0, -8, 0] }}
        transition={{ loop: true, duration: 2500, type: "timing" }}
      >
        <AlexCharacter mood="happy" variant="small" />
      </MotiView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignItems: "center",
    width: 120,
  },
  bubble: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    bottom: -7,
    left: "50%",
    marginLeft: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
});
