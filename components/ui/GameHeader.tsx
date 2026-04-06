import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";

interface Props {
  transparent?: boolean;
}

export function GameHeader({ transparent = false }: Props) {
  const insets = useSafeAreaInsets();
  const streak = useGameStore((s) => s.streak);
  const router = useRouter();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        transparent && styles.transparent,
      ]}
    >
      {/* Streak — long-press (3s) opens teacher assessment */}
      <Pressable
        onLongPress={() => router.push("/teacher/pin")}
        delayLongPress={3000}
      >
        <Text style={styles.streakText}>🔥 {streak}</Text>
      </Pressable>
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
