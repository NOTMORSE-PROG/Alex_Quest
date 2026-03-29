import { StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

interface Props {
  amount: number;
  onDone?: () => void;
}

export function FloatingXP({ amount, onDone }: Props) {
  return (
    <MotiView
      from={{ opacity: 1, translateY: 0, scale: 1 }}
      animate={{ opacity: 0, translateY: -80, scale: 1.2 }}
      transition={{ duration: 1200, type: "timing" }}
      onDidAnimate={onDone}
      style={styles.container}
    >
      <Text style={styles.text}>+{amount} XP ⚡</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 100,
  },
  text: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.gold,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
