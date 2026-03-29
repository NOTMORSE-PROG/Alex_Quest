import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import type { ChapterId } from "@/store/gameStore";

interface Props {
  id: ChapterId;
  label: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  isActive: boolean;
  stars: number;
  onPress: () => void;
}

export function LevelNode({ label, icon, color, isUnlocked, isActive, stars, onPress }: Props) {
  return (
    <Pressable onPress={isUnlocked ? onPress : undefined} style={styles.wrapper}>
      <MotiView
        animate={{
          scale: isActive ? [1, 1.06, 1] : 1,
          shadowOpacity: isActive ? 0.8 : 0.2,
        }}
        transition={isActive ? { loop: true, duration: 1500, type: "timing" } : { duration: 300 }}
        style={[
          styles.node,
          { backgroundColor: isUnlocked ? color : colors.navy },
          isActive && { shadowColor: color, shadowRadius: 12, shadowOpacity: 0.8, elevation: 12 },
        ]}
      >
        <Text style={styles.icon}>{isUnlocked ? icon : "🔒"}</Text>
      </MotiView>

      {/* Stars */}
      <View style={styles.stars}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Text key={i} style={{ fontSize: 10, opacity: i < stars ? 1 : 0.2 }}>⭐</Text>
        ))}
      </View>

      <Text style={[styles.label, !isUnlocked && styles.labelLocked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 4,
  },
  node: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 32,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "white",
    textAlign: "center",
  },
  labelLocked: {
    opacity: 0.4,
  },
});
