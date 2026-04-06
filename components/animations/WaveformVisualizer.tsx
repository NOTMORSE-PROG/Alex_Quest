import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

const BARS = [
  { height: 18 },
  { height: 28 },
  { height: 22 },
];

interface Props {
  active?: boolean;
  color?: string;
}

export function WaveformVisualizer({ active = true, color = colors.sky }: Props) {
  return (
    <View style={styles.row}>
      {BARS.map((bar, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: active ? bar.height : 8,
              opacity: active ? 1 : 0.4,
            },
          ]}
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
