import { Pressable, StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import { fonts } from "@/lib/theme";

interface Props {
  visible: boolean;
  onPress: () => void;
}

export function MapJumpButton({ visible, onPress }: Props) {
  return (
    <MotiView
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.85, translateY: visible ? 0 : 12 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      pointerEvents={visible ? "auto" : "none"}
      style={styles.wrapper}
    >
      <Pressable onPress={onPress} style={styles.btn}>
        <MotiView
          animate={{ translateY: [0, -4, 0] }}
          transition={{ loop: true, duration: 1400, type: "timing" }}
        >
          <Text style={styles.icon}>📍</Text>
        </MotiView>
        <Text style={styles.label}>My Stage</Text>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 110,
    right: 18,
    zIndex: 90,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15,12,41,0.88)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: "white",
  },
});
