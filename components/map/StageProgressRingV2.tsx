/**
 * StageProgressRingV2 — upgraded progress ring with pulsing inner glow
 * and a sparkle burst effect when progress hits 100%.
 */
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { MotiView } from "moti";

interface Props {
  progress: number; // 0–1
  color: string;
  size?: number;
}

const RADIUS = 52;
const STROKE = 5.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Sparkle offsets for the completion burst
const SPARKLES = [
  { dx: 0,   dy: -1,  delay: 0   },
  { dx: 0.7, dy: -0.7, delay: 40 },
  { dx: 1,   dy: 0,   delay: 80  },
  { dx: 0.7, dy: 0.7,  delay: 120 },
  { dx: 0,   dy: 1,   delay: 160 },
  { dx: -0.7, dy: 0.7, delay: 200 },
  { dx: -1,  dy: 0,   delay: 240 },
  { dx: -0.7, dy: -0.7, delay: 280 },
];

export const StageProgressRingV2 = memo(function StageProgressRingV2({
  progress,
  color,
  size = 112,
}: Props) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - clampedProgress);
  const isComplete = clampedProgress >= 1;
  const center = size / 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]} pointerEvents="none">
      {/* Outer glow ring pulse (only when in progress) */}
      {clampedProgress > 0 && !isComplete && (
        <MotiView
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.08, 1] }}
          transition={{ loop: true, duration: 2000, type: "timing" }}
          style={[
            styles.glowRing,
            { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2, backgroundColor: color },
          ]}
        />
      )}

      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`ringGlow_${color.replace("#", "")}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.15" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Inner glow fill */}
        {clampedProgress > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={RADIUS - 2}
            fill={`url(#ringGlow_${color.replace("#", "")})`}
          />
        )}

        {/* Track ring */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={STROKE}
          fill="none"
        />

        {/* Secondary shadow track */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={STROKE + 2}
          fill="none"
          rotation="-90"
          origin={`${center}, ${center}`}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset + 1}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />

        {/* Bright leading dot on progress tip */}
        {clampedProgress > 0 && clampedProgress < 1 && (() => {
          const angle = (clampedProgress * 360 - 90) * (Math.PI / 180);
          const dotX = center + RADIUS * Math.cos(angle);
          const dotY = center + RADIUS * Math.sin(angle);
          return (
            <Circle cx={dotX} cy={dotY} r={4} fill="white" opacity={0.9} />
          );
        })()}
      </Svg>

      {/* Sparkle burst on completion */}
      {isComplete &&
        SPARKLES.map((s, i) => (
          <MotiView
            key={i}
            from={{ opacity: 1, translateX: 0, translateY: 0, scale: 1 }}
            animate={{ opacity: 0, translateX: s.dx * 26, translateY: s.dy * 26, scale: 0.3 }}
            transition={{ delay: s.delay, duration: 600, type: "timing" }}
            style={[styles.sparkle, { top: center - 3, left: center - 3, backgroundColor: color }]}
          />
        ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    opacity: 0.25,
    top: -5,
    left: -5,
  },
  sparkle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
