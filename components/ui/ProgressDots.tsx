import { StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import { colors } from "@/lib/theme";

interface Props {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <MotiView
          key={i}
          animate={{
            backgroundColor:
              i < current
                ? colors.success
                : i === current
                ? colors.gold
                : "rgba(255,255,255,0.3)",
            scale: i === current ? 1.3 : 1,
          }}
          transition={{ duration: 300, type: "timing" }}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
