import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";

interface Props {
  stars: number; // 0–3
  size?: number;
}

export function StarRating({ stars, size = 40 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: 3 }).map((_, i) => (
        <MotiView
          key={i}
          from={{ scale: 0, rotate: "-20deg" }}
          animate={
            i < stars
              ? { scale: 1, rotate: "0deg" }
              : { scale: 0.7, rotate: "0deg" }
          }
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 14,
            delay: i * 180,
          }}
        >
          <Text style={[styles.star, { fontSize: size, opacity: i < stars ? 1 : 0.25 }]}>
            ⭐
          </Text>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  star: {
    textAlign: "center",
  },
});
