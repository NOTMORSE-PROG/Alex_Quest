/**
 * MapPathV2 — premium quest path with cobblestone texture, glow edges,
 * and an animated shimmer that crawls along completed segments.
 */
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./MapPath";

// Re-export constants so the main screen can keep using them
export { NODE_POSITIONS, CANVAS_HEIGHT, CANVAS_WIDTH } from "./MapPath";

// Path data — same nodes, same bezier curves
const FULL_PATH =
  "M 230 1600 C 300 1500 60 1350 100 1260 C 140 1180 310 1050 240 880 C 180 750 60 640 90 500 C 120 380 290 270 200 120";

const SEGMENT_PATHS = [
  "M 230 1600 C 300 1500 60 1350 100 1260",
  "M 100 1260 C 140 1180 310 1050 240 880",
  "M 240 880 C 180 750 60 640 90 500",
  "M 90 500 C 120 380 290 270 200 120",
];

const SEGMENT_COLORS = [
  "#D97706", // Bakery amber
  "#0EA5E9", // Fountain blue
  "#16A34A", // Forest green
  "#CA8A04", // Farm gold
];

const SEGMENT_LENGTHS = [520, 510, 490, 490]; // approximate for shimmer

const AnimatedPath = Animated.createAnimatedComponent(Path);

function ShimmerPath({ segPath, length }: { segPath: string; length: number }) {
  const offset = useSharedValue(length);

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(-length * 0.3, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, [length, offset]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <AnimatedPath
      d={segPath}
      stroke="rgba(255,255,255,0.55)"
      strokeWidth={6}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={`${length * 0.08} ${length * 0.92}`}
      animatedProps={animProps}
    />
  );
}

interface Props {
  completedSegments: number;
}

export function MapPathV2({ completedSegments }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Defs>
          <SvgGradient id="pathGlow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fde68a" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#d97706" stopOpacity="0.4" />
          </SvgGradient>
        </Defs>

        {/* ── Outer shadow/glow under path ── */}
        <Path
          d={FULL_PATH}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Base cobblestone track ── */}
        {/* Dark outer edge */}
        <Path
          d={FULL_PATH}
          stroke="#1f1204"
          strokeWidth={26}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Mid stone fill */}
        <Path
          d={FULL_PATH}
          stroke="#44280c"
          strokeWidth={22}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lighter stone center */}
        <Path
          d={FULL_PATH}
          stroke="#6b3a1f"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Cobblestone texture: dual dashed overlays ── */}
        {/* Wide stone blocks */}
        <Path
          d={FULL_PATH}
          stroke="#7c4522"
          strokeWidth={14}
          fill="none"
          strokeLinecap="square"
          strokeDasharray="18 6"
          opacity={0.7}
        />
        {/* Offset thin cracks */}
        <Path
          d={FULL_PATH}
          stroke="#2d1507"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="3 21"
          strokeDashoffset={12}
          opacity={0.9}
        />
        {/* Edge highlight (inner top) */}
        <Path
          d={FULL_PATH}
          stroke="rgba(255,220,150,0.18)"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="5 15"
          strokeDashoffset={4}
        />

        {/* ── Completed segment color overlays ── */}
        {SEGMENT_PATHS.map((segPath, i) => {
          if (i >= completedSegments) return null;
          return (
            <Path
              key={`fill-${i}`}
              d={segPath}
              stroke={SEGMENT_COLORS[i]}
              strokeWidth={16}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.75}
            />
          );
        })}

        {/* Bright edge on completed segments */}
        {SEGMENT_PATHS.map((segPath, i) => {
          if (i >= completedSegments) return null;
          return (
            <Path
              key={`edge-${i}`}
              d={segPath}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 14"
            />
          );
        })}

        {/* ── Animated shimmer on each completed segment ── */}
        {SEGMENT_PATHS.map((segPath, i) => {
          if (i >= completedSegments) return null;
          return (
            <ShimmerPath
              key={`shimmer-${i}`}
              segPath={segPath}
              length={SEGMENT_LENGTHS[i]}
            />
          );
        })}

        {/* Active next segment: faint amber pulse marker */}
        {completedSegments < SEGMENT_PATHS.length && (
          <Path
            d={SEGMENT_PATHS[completedSegments]}
            stroke="rgba(251,191,36,0.22)"
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 20"
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});
