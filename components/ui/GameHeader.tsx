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
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const router = useRouter();

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        transparent && styles.transparent,
      ]}
    >
      <Pressable onPress={toggleMute} style={styles.muteBtn}>
        <Text style={styles.muteIcon}>{muted ? "🔇" : "🔊"}</Text>
      </Pressable>

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

/** Standalone mute button for screens that don't use GameHeader (quest, tutorial, chapter, reward…) */
export function MuteButton({ style }: { style?: object }) {
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  return (
    <Pressable onPress={toggleMute} style={[styles.muteBtn, style]}>
      <Text style={styles.muteIcon}>{muted ? "🔇" : "🔊"}</Text>
    </Pressable>
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
  muteBtn: {
    padding: 4,
    marginRight: 8,
  },
  muteIcon: {
    fontSize: 18,
  },
  streakText: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 16,
  },
});
