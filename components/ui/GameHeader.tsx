import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";

interface Props {
  transparent?: boolean;
}

export function GameHeader({ transparent = false }: Props) {
  const insets = useSafeAreaInsets();
  const { totalXP, hearts, streak } = useGameStore();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        transparent && styles.transparent,
      ]}
    >
      {/* Hearts */}
      <View style={styles.section}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Text key={i} style={[styles.heart, i >= hearts && styles.heartEmpty]}>
            ❤️
          </Text>
        ))}
      </View>

      {/* XP */}
      <View style={styles.xpBadge}>
        <Text style={styles.xpText}>⚡ {totalXP} XP</Text>
      </View>

      {/* Streak */}
      <View style={styles.section}>
        <Text style={styles.streakText}>🔥 {streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  transparent: {
    backgroundColor: "transparent",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  heart: {
    fontSize: 16,
  },
  heartEmpty: {
    opacity: 0.25,
  },
  xpBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  xpText: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 14,
  },
  streakText: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 16,
  },
});
