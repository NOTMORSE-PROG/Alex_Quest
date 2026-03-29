import { StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import { colors } from "@/lib/theme";

const BAR_CONFIGS = [
  { minH: 8, maxH: 22, duration: 700 },
  { minH: 14, maxH: 30, duration: 500 },
  { minH: 20, maxH: 10, duration: 600 },
  { minH: 12, maxH: 28, duration: 800 },
  { minH: 18, maxH: 8, duration: 400 },
];

interface Props {
  active?: boolean;
  color?: string;
}

export function WaveformVisualizer({ active = true, color = colors.sky }: Props) {
  return (
    <View style={styles.row}>
      {BAR_CONFIGS.map((cfg, i) => (
        <MotiView
          key={i}
          animate={{ height: active ? [cfg.minH, cfg.maxH, cfg.minH] : cfg.minH }}
          transition={
            active
              ? { loop: true, duration: cfg.duration, type: "timing" }
              : { duration: 200 }
          }
          style={[styles.bar, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 36,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
});
