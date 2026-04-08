/**
 * MapSky — full-canvas SVG sky background replacing the flat LinearGradient.
 * Renders gradient sky, a sun in the bakery zone, a moon + stars in the jungle zone,
 * and distant hazy horizon silhouettes at each zone transition.
 */
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Path,
} from "react-native-svg";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./MapPath";

export const MapSky = memo(function MapSky() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Defs>
          {/* Full-canvas vertical sky gradient */}
          <SvgGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0"    stopColor="#0b001f" />
            <Stop offset="0.06" stopColor="#1a0533" />
            <Stop offset="0.14" stopColor="#052e16" />
            <Stop offset="0.25" stopColor="#093d21" />
            <Stop offset="0.36" stopColor="#0a4064" />
            <Stop offset="0.48" stopColor="#075985" />
            <Stop offset="0.57" stopColor="#0c4a6e" />
            <Stop offset="0.68" stopColor="#92400e" />
            <Stop offset="0.82" stopColor="#d97706" />
            <Stop offset="1"    stopColor="#fef3c7" />
          </SvgGradient>

          {/* Sun glow radial */}
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0"   stopColor="#fde68a" stopOpacity="1" />
            <Stop offset="0.4" stopColor="#f59e0b" stopOpacity="0.8" />
            <Stop offset="1"   stopColor="#d97706" stopOpacity="0" />
          </RadialGradient>

          {/* Moon glow radial */}
          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0"   stopColor="#f1f5f9" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#e2e8f0" stopOpacity="0.9" />
            <Stop offset="1"   stopColor="#94a3b8" stopOpacity="0" />
          </RadialGradient>

          {/* Horizon haze at zone transitions */}
          <SvgGradient id="hazeAmber" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#d97706" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#d97706" stopOpacity="0" />
          </SvgGradient>
          <SvgGradient id="hazeBlue" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0ea5e9" stopOpacity="0.14" />
            <Stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
          </SvgGradient>
          <SvgGradient id="hazeGreen" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#16a34a" stopOpacity="0.16" />
            <Stop offset="1" stopColor="#16a34a" stopOpacity="0" />
          </SvgGradient>
        </Defs>

        {/* Base sky gradient */}
        <Rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#skyGrad)" />

        {/* ── JUNGLE ZONE (top, y 0–310) ── */}
        {/* Moon */}
        <Circle cx={310} cy={60} r={44} fill="url(#moonGlow)" opacity={0.9} />
        <Circle cx={310} cy={60} r={28} fill="#e2e8f0" />
        {/* Moon crescent cutout shadow */}
        <Circle cx={322} cy={52} r={24} fill="#1a0533" opacity={0.85} />
        {/* Stars */}
        {STARS.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
        ))}
        {/* Distant jungle ridge silhouette */}
        <Path
          d="M0 250 C40 200 80 230 120 210 C160 190 200 220 240 200 C280 180 320 215 390 195 L390 310 L0 310 Z"
          fill="#052e16"
          opacity={0.7}
        />
        <Path
          d="M0 275 C50 255 100 265 155 250 C210 235 260 258 310 245 C345 236 370 252 390 242 L390 310 L0 310 Z"
          fill="#041a0f"
          opacity={0.85}
        />

        {/* ── FARM ZONE (y 310–650) ── */}
        {/* Sky wash at farm level */}
        <Rect x="0" y="310" width={CANVAS_WIDTH} height="60" fill="url(#hazeGreen)" />
        {/* Distant rolling hills */}
        <Ellipse cx={80}  cy={480} rx={140} ry={90} fill="#166534" opacity={0.35} />
        <Ellipse cx={310} cy={510} rx={150} ry={80} fill="#15803d" opacity={0.3}  />
        {/* Small sun peek */}
        <Circle cx={330} cy={345} r={30} fill="url(#sunGlow)" opacity={0.5} />

        {/* ── FOREST ZONE (y 650–1010) ── */}
        {/* Canopy glow at top */}
        <Rect x="0" y="650" width={CANVAS_WIDTH} height="70" fill="url(#hazeGreen)" />
        {/* Distant tree line silhouettes */}
        <Path
          d="M0 950 C30 900 55 920 80 905 C110 888 130 912 160 898 C190 884 210 910 240 896 C268 882 290 905 320 892 C348 879 370 900 390 888 L390 1010 L0 1010 Z"
          fill="#052e16"
          opacity={0.5}
        />
        <Path
          d="M0 980 C50 960 100 975 150 962 C200 949 250 968 300 955 C335 945 365 960 390 950 L390 1010 L0 1010 Z"
          fill="#031a0b"
          opacity={0.6}
        />
        {/* Light beams in forest */}
        {[60, 160, 290, 360].map((lx, i) => (
          <Path
            key={i}
            d={`M${lx - 12} 650 L${lx + 12} 650 L${lx + 30} 1010 L${lx - 30} 1010 Z`}
            fill="rgba(255,255,220,0.025)"
          />
        ))}

        {/* ── FOUNTAIN ZONE (y 1010–1370) ── */}
        <Rect x="0" y="1010" width={CANVAS_WIDTH} height="70" fill="url(#hazeBlue)" />
        {/* Plaza horizon shimmer */}
        <Ellipse cx={195} cy={1020} rx={160} ry={18} fill="#bae6fd" opacity={0.12} />

        {/* ── BAKERY ZONE (y 1370–1760) ── */}
        <Rect x="0" y="1370" width={CANVAS_WIDTH} height="80" fill="url(#hazeAmber)" />
        {/* Sun above bakery */}
        <Circle cx={68} cy={1430} r={52} fill="url(#sunGlow)" opacity={0.85} />
        <Circle cx={68} cy={1430} r={28} fill="#fde68a" opacity={0.95} />
        {/* Sun rays */}
        {SUN_RAYS.map((r, i) => (
          <Path key={i} d={r} stroke="#fde68a" strokeWidth={2} opacity={0.3} />
        ))}
        {/* Ground gradient at very bottom */}
        <Rect x="0" y="1680" width={CANVAS_WIDTH} height="80" fill="#78350f" opacity={0.4} />
      </Svg>
    </View>
  );
});

// Pre-computed star positions for the jungle zone
const STARS = [
  { x: 18,  y: 22,  r: 1.2, o: 0.9 }, { x: 45,  y: 8,   r: 0.8, o: 0.7 },
  { x: 72,  y: 35,  r: 1.0, o: 0.8 }, { x: 98,  y: 14,  r: 1.4, o: 0.95 },
  { x: 130, y: 48,  r: 0.7, o: 0.6 }, { x: 155, y: 10,  r: 1.1, o: 0.85 },
  { x: 180, y: 28,  r: 0.9, o: 0.75 },{ x: 210, y: 55,  r: 1.3, o: 0.9 },
  { x: 235, y: 18,  r: 0.8, o: 0.7 }, { x: 260, y: 40,  r: 1.0, o: 0.8 },
  { x: 340, y: 28,  r: 1.2, o: 0.85 },{ x: 365, y: 12,  r: 0.9, o: 0.7 },
  { x: 380, y: 45,  r: 0.7, o: 0.65 },{ x: 54,  y: 75,  r: 1.0, o: 0.6 },
  { x: 108, y: 90,  r: 0.8, o: 0.55 },{ x: 175, y: 82,  r: 1.1, o: 0.7 },
  { x: 248, y: 68,  r: 0.9, o: 0.65 },{ x: 295, y: 88,  r: 1.3, o: 0.75 },
];

// Sun ray paths (radiating from cx=68, cy=1430)
const SUN_RAYS = [
  "M 68 1430 L 28 1390", "M 68 1430 L 18 1430", "M 68 1430 L 28 1470",
  "M 68 1430 L 68 1385", "M 68 1430 L 108 1390","M 68 1430 L 118 1430",
  "M 68 1430 L 108 1470","M 68 1430 L 68 1475",
];

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
});
