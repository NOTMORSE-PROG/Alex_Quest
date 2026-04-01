import { StyleSheet, View } from "react-native";
import { MotiView } from "moti";
import { colors } from "@/lib/theme";

const BAR_CONFIGS = [
  { minH: 8, maxH: 28, duration: 600 },
  { minH: 16, maxH: 32, duration: 450 },
  { minH: 10, maxH: 24, duration: 700 },
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
          animate={{ scaleY: active ? [cfg.minH / cfg.maxH, 1, cfg.minH / cfg.maxH] : cfg.minH / cfg.maxH }}
          transition={
            active
              ? { loop: true, duration: cfg.duration, type: "timing" }
              : { duration: 200 }
          }
          style={[styles.bar, { backgroundColor: color, height: cfg.maxH }]}
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
