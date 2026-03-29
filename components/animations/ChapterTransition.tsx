import { StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

interface Props {
  visible: boolean;
  label?: string;
  bgColor?: string;
}

export function ChapterTransition({ visible, label, bgColor = colors.navy }: Props) {
  return (
    <MotiView
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 400, type: "timing" }}
      pointerEvents={visible ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: bgColor }]}
    >
      {label && (
        <MotiView
          from={{ scale: 0.6, opacity: 0 }}
          animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 150 }}
        >
          <Text style={styles.label}>{label}</Text>
        </MotiView>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: "white",
    textAlign: "center",
  },
});
