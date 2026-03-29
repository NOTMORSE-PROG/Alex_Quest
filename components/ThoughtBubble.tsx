import { AnimatePresence, MotiView } from "moti";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";

interface Props {
  text: string;
  show: boolean;
}

export function ThoughtBubble({ text, show }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <MotiView
          from={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={styles.container}
        >
          <Text style={styles.text}>{text}</Text>
          {/* Bubble tail (downward triangle) */}
          <View style={styles.tail} />
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    maxWidth: 200,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    color: colors.navy,
    fontSize: 13,
    fontFamily: fonts.body,
    textAlign: "center",
  },
  tail: {
    position: "absolute",
    bottom: -10,
    left: "50%",
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
});
