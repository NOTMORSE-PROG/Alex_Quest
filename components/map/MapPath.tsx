import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

// Node center positions on the 390px-wide canvas (x, y from top)
export const NODE_POSITIONS = [
  { x: 230, y: 1600 }, // Stage 1 — Bakery
  { x: 100, y: 1260 }, // Stage 2 — Fountain
  { x: 240, y: 880 },  // Stage 3 — Forest
  { x: 90,  y: 500 },  // Stage 4 — Farm
  { x: 200, y: 120 },  // Stage 5 — Enchanted Forest
] as const;

export const CANVAS_HEIGHT = 1760;
export const CANVAS_WIDTH = 390;

// Cubic bezier SVG path data connecting all 5 nodes smoothly
const FULL_PATH =
  "M 230 1600 C 300 1500 60 1350 100 1260 C 140 1180 310 1050 240 880 C 180 750 60 640 90 500 C 120 380 290 270 200 120";

// Partial paths for each completed segment
const SEGMENT_PATHS = [
  "M 230 1600 C 300 1500 60 1350 100 1260",               // 1→2 Bakery amber
  "M 100 1260 C 140 1180 310 1050 240 880",               // 2→3 Fountain blue
  "M 240 880 C 180 750 60 640 90 500",                    // 3→4 Forest green
  "M 90 500 C 120 380 290 270 200 120",                   // 4→5 Farm gold
];

const SEGMENT_COLORS = [
  "#D97706", // Bakery amber
  "#0EA5E9", // Fountain blue
  "#16A34A", // Forest green
  "#CA8A04", // Farm gold
];

interface Props {
  /** Number of stages completed (0–4 segments colored) */
  completedSegments: number;
}

export function MapPath({ completedSegments }: Props) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        {/* Base gray track — full path always visible */}
        <Path
          d={FULL_PATH}
          stroke="#374151"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={FULL_PATH}
          stroke="#6B7280"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 8"
        />

        {/* Colored completed segments */}
        {SEGMENT_PATHS.map((segPath, i) => {
          if (i >= completedSegments) return null;
          return (
            <Path
              key={i}
              d={segPath}
              stroke={SEGMENT_COLORS[i]}
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Dotted overlay on completed segments for texture */}
        {SEGMENT_PATHS.map((segPath, i) => {
          if (i >= completedSegments) return null;
          return (
            <Path
              key={`dot-${i}`}
              d={segPath}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray="2 12"
            />
          );
        })}
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
