import { StyleSheet, View } from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { CANVAS_WIDTH } from "./MapPath";

// Wavy divider shapes at zone transition points
const TERRAIN_BANDS = [
  // Between Stage 1 (Bakery) and Stage 2 (Fountain) — y ≈ 1400
  {
    y: 1370,
    topColor: "#78350F",  // dark amber
    botColor: "#0C4A6E",  // dark sky
    wavePath: "M0 20 C80 0 160 40 240 20 C320 0 360 30 390 20 L390 50 L0 50 Z",
  },
  // Between Stage 2 (Fountain) and Stage 3 (Forest) — y ≈ 1040
  {
    y: 1010,
    topColor: "#0C4A6E",
    botColor: "#14532D",
    wavePath: "M0 20 C60 0 130 36 200 20 C270 4 330 32 390 16 L390 50 L0 50 Z",
  },
  // Between Stage 3 (Forest) and Stage 4 (Farm) — y ≈ 680
  {
    y: 650,
    topColor: "#14532D",
    botColor: "#78350F",
    wavePath: "M0 16 C70 36 150 0 220 24 C290 44 350 8 390 22 L390 50 L0 50 Z",
  },
  // Between Stage 4 (Farm) and Stage 5 (Enchanted Forest) — y ≈ 340
  {
    y: 310,
    topColor: "#78350F",
    botColor: "#052e16",
    wavePath: "M0 24 C90 4 170 40 250 18 C310 2 360 28 390 14 L390 50 L0 50 Z",
  },
];

export function MapTerrain() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {TERRAIN_BANDS.map((band, i) => (
        <View key={i} style={[styles.band, { top: band.y }]}>
          <Svg width={CANVAS_WIDTH} height={50}>
            <Path
              d={band.wavePath}
              fill={band.botColor}
              opacity={0.55}
            />
          </Svg>
        </View>
      ))}

      {/* Ground dots / pebble texture at each transition */}
      {TERRAIN_BANDS.map((band, i) => (
        <Svg
          key={`dots-${i}`}
          width={CANVAS_WIDTH}
          height={10}
          style={{ position: "absolute", top: band.y + 2 }}
        >
          {Array.from({ length: 18 }).map((_, j) => (
            <Ellipse
              key={j}
              cx={12 + j * 21}
              cy={5}
              rx={3}
              ry={2}
              fill="rgba(255,255,255,0.12)"
            />
          ))}
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 50,
    overflow: "hidden",
  },
});
