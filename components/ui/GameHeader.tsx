import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";

interface Props {
  transparent?: boolean;
}

export function GameHeader({ transparent = false }: Props) {
  const insets = useSafeAreaInsets();
  const streak = useGameStore((s) => s.streak);

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        transparent && styles.transparent,
      ]}
    >
      {/* Streak */}
      <Text style={styles.streakText}>🔥 {streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  transparent: {
    backgroundColor: "transparent",
  },
  streakText: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 16,
  },
});
