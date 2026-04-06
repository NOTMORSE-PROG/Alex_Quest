import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Props {
  progress: number; // 0–1
  color: string;
  size?: number;
}

const RADIUS = 50;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StageProgressRing({ progress, color, size = 108 }: Props) {
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <View style={[styles.wrapper, { width: size, height: size }]} pointerEvents="none">
      <Svg width={size} height={size}>
        {/* Track ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
