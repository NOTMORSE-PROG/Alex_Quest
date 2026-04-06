import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors, fonts } from "@/lib/theme";

interface Props {
  score: number;
  size?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Color based on score: green 80+, yellow 60-79, orange 40-59, red 0-39. */
function scoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return "#FFD900";
  if (score >= 40) return colors.warning;
  return colors.danger;
}

/**
 * Build an SVG arc path for a semicircle.
 * `fraction` is 0-1 representing how much of the 180-degree arc to fill.
 */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  fraction: number,
): string {
  const clamp = Math.min(Math.max(fraction, 0), 1);
  if (clamp === 0) return "";

  const startAngle = Math.PI; // left (180°)
  const endAngle = Math.PI + Math.PI * clamp; // sweep clockwise

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = clamp > 0.5 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function ScoreGauge({ score, size = 120 }: Props) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [score, progress]);

  // Background track (full semicircle)
  const trackD = arcPath(cx, cy, radius, 1);

  const animatedProps = useAnimatedProps(() => {
    // Compute the arc length for the animated fraction
    const totalLen = Math.PI * radius;
    const filledLen = totalLen * progress.value;
    return {
      strokeDasharray: [filledLen, totalLen] as number[],
      strokeDashoffset: 0,
    };
  });

  const color = scoreColor(score);

  return (
    <View style={[styles.container, { width: size, height: size * 0.6 }]}>
      <Svg width={size} height={size * 0.55} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <Path
          d={trackD}
          stroke={`${colors.navy}20`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Filled arc — uses full track path with dash offset for animation */}
        <AnimatedPath
          d={trackD}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Score label */}
      <View style={[styles.labelContainer, { bottom: 0 }]}>
        <Text style={[styles.scoreText, { fontSize: size * 0.28, color }]}>
          {score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  labelContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scoreText: {
    fontFamily: fonts.display,
  },
});
