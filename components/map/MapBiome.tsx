/**
 * MapBiome — per-zone illustrated SVG environment panels.
 * Each zone gets a layered SVG scene: ground, structures, plants, details.
 * Locked zones are desaturated. Completed zones have a subtle glow bloom.
 */
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Ellipse,
  Line,
  G,
} from "react-native-svg";
import { CANVAS_WIDTH } from "./MapPath";

export type BiomeState = "locked" | "active" | "completed";

interface BiomeProps {
  /** Zone index: 0=Bakery, 1=Fountain, 2=Forest, 3=Farm, 4=Jungle */
  zone: 0 | 1 | 2 | 3 | 4;
  state: BiomeState;
  y: number;       // canvas Y top of this zone
  height: number;  // zone height
}

export const MapBiome = memo(function MapBiome({ zone, state, y, height }: BiomeProps) {
  const opacity = state === "locked" ? 0.42 : 1;
  const Component = BIOME_COMPONENTS[zone];
  return (
    <View
      style={[styles.container, { top: y, height }]}
      pointerEvents="none"
    >
      {state === "completed" && (
        <View style={[styles.completedGlow, { height }]} />
      )}
      <Svg width={CANVAS_WIDTH} height={height} opacity={opacity}>
        <Component width={CANVAS_WIDTH} height={height} />
      </Svg>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 0 — Bakery District
// ─────────────────────────────────────────────────────────────────────────────
function BakeryBiome({ width: W, height: H }: { width: number; height: number }) {
  return (
    <G>
      <Defs>
        <SvgGradient id="bakeryGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#92400e" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#78350f" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#451a03" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="bakeryWall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f5d48a" />
          <Stop offset="1" stopColor="#d4a853" />
        </SvgGradient>
        <SvgGradient id="bakeryWall2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e8c87a" />
          <Stop offset="1" stopColor="#c49640" />
        </SvgGradient>
        <RadialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0"   stopColor="#fde68a" stopOpacity="0.9" />
          <Stop offset="1"   stopColor="#f59e0b" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Ground cobblestone base */}
      <Rect x="0" y={H * 0.72} width={W} height={H * 0.28} fill="url(#bakeryGround)" />
      {/* Cobblestone rows */}
      {[0.74, 0.79, 0.84, 0.89, 0.94].map((row, ri) => (
        <G key={ri}>
          {Array.from({ length: 10 }).map((_, ci) => (
            <Rect
              key={ci}
              x={ci * (W / 10) + (ri % 2 === 0 ? 0 : W / 20)}
              y={H * row}
              width={W / 10 - 2}
              height={H * 0.045}
              rx={3}
              ry={3}
              fill={ci % 2 === 0 ? "#6b3a1f" : "#7c4522"}
              opacity={0.6}
            />
          ))}
        </G>
      ))}

      {/* ── Left Bakery Shop ── */}
      {/* Main building */}
      <Rect x={8} y={H * 0.2} width={155} height={H * 0.55} fill="url(#bakeryWall)" rx={4} />
      {/* Second floor / upper wall */}
      <Rect x={8} y={H * 0.1} width={155} height={H * 0.12} fill="#e8b460" rx={4} />
      {/* Roof ridge */}
      <Path d={`M8 ${H * 0.1} L85 ${H * 0.02} L163 ${H * 0.1}`} fill="#7c4522" />
      <Path d={`M8 ${H * 0.1} L85 ${H * 0.02} L163 ${H * 0.1}`} stroke="#5c3010" strokeWidth={2} fill="none" />
      {/* Chimney */}
      <Rect x={100} y={H * -0.04} width={18} height={H * 0.1} fill="#8b5e3c" />
      <Rect x={97} y={H * -0.04} width={24} height={H * 0.025} fill="#7c4522" />
      {/* Striped awning - left shop */}
      <Path d={`M8 ${H * 0.35} L163 ${H * 0.35} L163 ${H * 0.44} Q85 ${H * 0.48} 8 ${H * 0.44} Z`} fill="#dc2626" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Line
          key={i}
          x1={8 + i * 19.5}
          y1={H * 0.35}
          x2={8 + i * 19.5}
          y2={H * 0.44}
          stroke="#fef2f2"
          strokeWidth={4}
          opacity={0.6}
        />
      ))}
      {/* Awning scallop bottom */}
      {Array.from({ length: 7 }).map((_, i) => (
        <Ellipse
          key={i}
          cx={8 + 12 + i * 21}
          cy={H * 0.46}
          rx={12}
          ry={6}
          fill="#dc2626"
        />
      ))}
      {/* Shop window - bakery display */}
      <Rect x={22} y={H * 0.46} width={60} height={H * 0.2} rx={5} fill="#1c1008" />
      <Rect x={24} y={H * 0.47} width={56} height={H * 0.18} rx={4} fill="#fde68a" opacity={0.25} />
      {/* Window glow */}
      <Circle cx={52} cy={H * 0.56} r={28} fill="url(#windowGlow)" />
      {/* Pie in window */}
      <Ellipse cx={52} cy={H * 0.56} rx={14} ry={8} fill="#b45309" />
      <Ellipse cx={52} cy={H * 0.54} rx={14} ry={6} fill="#d97706" />
      <Path d={`M40 ${H * 0.54} Q52 ${H * 0.48} 64 ${H * 0.54}`} fill="#fbbf24" />
      {/* Door */}
      <Rect x={90} y={H * 0.5} width={32} height={H * 0.22} rx={4} fill="#7c4522" />
      <Rect x={92} y={H * 0.52} width={13} height={H * 0.12} rx={3} fill="#fde68a" opacity={0.2} />
      <Rect x={107} y={H * 0.52} width={13} height={H * 0.12} rx={3} fill="#fde68a" opacity={0.2} />
      <Circle cx={104} cy={H * 0.61} r={3} fill="#f59e0b" />
      {/* Sign above door */}
      <Rect x={78} y={H * 0.44} width={54} height={H * 0.065} rx={6} fill="#7c4522" />
      <Rect x={80} y={H * 0.445} width={50} height={H * 0.055} rx={5} fill="#b45309" />
      {/* Upper window */}
      <Rect x={22} y={H * 0.16} width={40} height={H * 0.1} rx={5} fill="#1c1008" />
      <Rect x={24} y={H * 0.17} width={36} height={H * 0.08} rx={4} fill="#fde68a" opacity={0.3} />
      <Line x1={44} y1={H * 0.17} x2={44} y2={H * 0.25} stroke="#7c4522" strokeWidth={2} />
      <Line x1={24} y1={H * 0.21} x2={60} y2={H * 0.21} stroke="#7c4522" strokeWidth={2} />

      {/* ── Right adjacent building ── */}
      <Rect x={225} y={H * 0.25} width={160} height={H * 0.47} fill="url(#bakeryWall2)" rx={4} />
      <Rect x={225} y={H * 0.14} width={160} height={H * 0.13} fill="#d4a040" rx={4} />
      <Path d={`M225 ${H * 0.14} L305 ${H * 0.06} L385 ${H * 0.14}`} fill="#6b3a1f" />
      {/* Right shop awning */}
      <Path d={`M225 ${H * 0.38} L385 ${H * 0.38} L385 ${H * 0.46} Q305 ${H * 0.5} 225 ${H * 0.46} Z`} fill="#1d4ed8" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Line
          key={i}
          x1={225 + i * 20}
          y1={H * 0.38}
          x2={225 + i * 20}
          y2={H * 0.46}
          stroke="white"
          strokeWidth={4}
          opacity={0.45}
        />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <Ellipse key={i} cx={225 + 12 + i * 23} cy={H * 0.48} rx={12} ry={6} fill="#1d4ed8" />
      ))}
      {/* Right shop window */}
      <Rect x={238} y={H * 0.49} width={65} height={H * 0.18} rx={5} fill="#1c1008" />
      <Rect x={240} y={H * 0.5} width={61} height={H * 0.16} rx={4} fill="#bae6fd" opacity={0.2} />
      <Circle cx={271} cy={H * 0.58} r={25} fill="url(#windowGlow)" opacity={0.5} />
      {/* Cake in window */}
      <Rect x={258} y={H * 0.57} width={26} height={H * 0.06} rx={2} fill="#f9a8d4" />
      <Rect x={260} y={H * 0.53} width={22} height={H * 0.04} rx={2} fill="#fbcfe8" />
      <Circle cx={271} cy={H * 0.52} r={4} fill="#f43f5e" />
      {/* Right door */}
      <Rect x={328} y={H * 0.5} width={36} height={H * 0.22} rx={4} fill="#6b3a1f" />
      <Rect x={330} y={H * 0.52} width={14} height={H * 0.12} rx={3} fill="#fde68a" opacity={0.2} />
      <Rect x={348} y={H * 0.52} width={14} height={H * 0.12} rx={3} fill="#fde68a" opacity={0.2} />
      <Circle cx={344} cy={H * 0.61} r={3} fill="#f59e0b" />
      {/* Flower boxes under right windows */}
      <Rect x={238} y={H * 0.665} width={65} height={H * 0.04} rx={3} fill="#7c4522" />
      {[245, 255, 265, 275, 285, 292].map((fx, fi) => (
        <G key={fi}>
          <Circle cx={fx} cy={H * 0.66} r={4} fill={["#f87171","#fb923c","#fbbf24","#a3e635","#38bdf8","#c084fc"][fi]} />
          <Rect x={fx - 1} y={H * 0.66} width={2} height={H * 0.02} fill="#166534" />
        </G>
      ))}

      {/* ── Center lamp post ── */}
      <Rect x={188} y={H * 0.3} width={8} height={H * 0.42} fill="#374151" rx={2} />
      <Ellipse cx={192} cy={H * 0.3} rx={14} ry={5} fill="#374151" />
      {/* Lamp head */}
      <Path d={`M178 ${H * 0.26} Q192 ${H * 0.18} 206 ${H * 0.26}`} fill="#1f2937" />
      <Ellipse cx={192} cy={H * 0.26} rx={12} ry={8} fill="#1f2937" />
      <Ellipse cx={192} cy={H * 0.24} rx={8} ry={5} fill="#fde68a" opacity={0.95} />
      {/* Lamp glow */}
      <Circle cx={192} cy={H * 0.24} r={20} fill="#fde68a" opacity={0.12} />
      {/* Post base */}
      <Ellipse cx={192} cy={H * 0.72} rx={10} ry={4} fill="#1f2937" />
    </G>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 1 — Fountain Square
// ─────────────────────────────────────────────────────────────────────────────
function FountainBiome({ width: W, height: H }: { width: number; height: number }) {
  return (
    <G>
      <Defs>
        <SvgGradient id="plazaGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7dd3fc" stopOpacity="0.08" />
          <Stop offset="0.6" stopColor="#0369a1" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#0c4a6e" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="fountainStone" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e2e8f0" />
          <Stop offset="1" stopColor="#94a3b8" />
        </SvgGradient>
        <RadialGradient id="waterReflect" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#7dd3fc" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#0369a1" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="waterPool" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#38bdf8" stopOpacity="0.8" />
          <Stop offset="0.7" stopColor="#0ea5e9" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#0369a1" stopOpacity="0.4" />
        </RadialGradient>
      </Defs>

      {/* Ground */}
      <Rect x="0" y={H * 0.65} width={W} height={H * 0.35} fill="url(#plazaGround)" />
      {/* Stone tile grid */}
      {[0.67, 0.73, 0.79, 0.85, 0.91].map((row, ri) => (
        Array.from({ length: 9 }).map((_, ci) => (
          <Rect
            key={`${ri}-${ci}`}
            x={ci * (W / 9) + 1}
            y={H * row}
            width={W / 9 - 2}
            height={H * 0.055}
            rx={2}
            fill={ci % 2 === ri % 2 ? "#e2e8f0" : "#cbd5e1"}
            opacity={0.3}
          />
        ))
      ))}

      {/* Fountain water pool (base) */}
      <Ellipse cx={W * 0.5} cy={H * 0.7} rx={90} ry={24} fill="url(#waterPool)" />
      {/* Water ripple rings */}
      {[0, 1, 2].map((i) => (
        <Ellipse
          key={i}
          cx={W * 0.5}
          cy={H * 0.7}
          rx={60 + i * 18}
          ry={14 + i * 4}
          stroke="#38bdf8"
          strokeWidth={1.5 - i * 0.4}
          fill="none"
          opacity={0.4 - i * 0.1}
        />
      ))}

      {/* Fountain base tier */}
      <Ellipse cx={W * 0.5} cy={H * 0.64} rx={68} ry={14} fill="url(#fountainStone)" />
      <Rect x={W * 0.5 - 68} y={H * 0.56} width={136} height={H * 0.09} rx={6} fill="#94a3b8" />
      <Rect x={W * 0.5 - 68} y={H * 0.56} width={136} height={H * 0.04} rx={6} fill="#e2e8f0" opacity={0.6} />

      {/* Fountain middle tier */}
      <Ellipse cx={W * 0.5} cy={H * 0.52} rx={38} ry={9} fill="url(#fountainStone)" />
      <Rect x={W * 0.5 - 38} y={H * 0.44} width={76} height={H * 0.09} rx={5} fill="#94a3b8" />
      <Rect x={W * 0.5 - 38} y={H * 0.44} width={76} height={H * 0.035} rx={5} fill="#e2e8f0" opacity={0.6} />

      {/* Fountain top tier & spout */}
      <Ellipse cx={W * 0.5} cy={H * 0.41} rx={18} ry={5} fill="url(#fountainStone)" />
      <Rect x={W * 0.5 - 6} y={H * 0.28} width={12} height={H * 0.14} rx={4} fill="#94a3b8" />
      {/* Water arcs from spout */}
      {[-35, -18, 0, 18, 35].map((dx, i) => (
        <Path
          key={i}
          d={`M ${W * 0.5} ${H * 0.28} Q ${W * 0.5 + dx * 1.5} ${H * 0.2} ${W * 0.5 + dx * 2} ${H * 0.37}`}
          stroke="#7dd3fc"
          strokeWidth={2.5 - Math.abs(i - 2) * 0.4}
          fill="none"
          opacity={0.7}
          strokeLinecap="round"
        />
      ))}
      {/* Water droplets in pool */}
      {[[-30, 0.68], [20, 0.72], [-50, 0.71], [55, 0.69], [0, 0.695]].map(([dx, dy], i) => (
        <Ellipse
          key={i}
          cx={W * 0.5 + (dx as number)}
          cy={H * (dy as number)}
          rx={3}
          ry={1.5}
          fill="#bae6fd"
          opacity={0.6}
        />
      ))}

      {/* Fountain detail — carved relief band */}
      {[...Array(6)].map((_, i) => (
        <Ellipse
          key={i}
          cx={W * 0.5 - 50 + i * 20}
          cy={H * 0.59}
          rx={6}
          ry={5}
          fill="#e2e8f0"
          opacity={0.4}
        />
      ))}

      {/* Left park bench */}
      <Rect x={32} y={H * 0.68} width={70} height={H * 0.045} rx={3} fill="#7c5c3e" />
      <Rect x={32} y={H * 0.64} width={70} height={H * 0.04} rx={3} fill="#8b6b4a" />
      <Rect x={34} y={H * 0.64} width={6} height={H * 0.1} rx={2} fill="#6b4a2e" />
      <Rect x={90} y={H * 0.64} width={6} height={H * 0.1} rx={2} fill="#6b4a2e" />

      {/* Right park bench */}
      <Rect x={W - 102} y={H * 0.68} width={70} height={H * 0.045} rx={3} fill="#7c5c3e" />
      <Rect x={W - 102} y={H * 0.64} width={70} height={H * 0.04} rx={3} fill="#8b6b4a" />
      <Rect x={W - 100} y={H * 0.64} width={6} height={H * 0.1} rx={2} fill="#6b4a2e" />
      <Rect x={W - 44} y={H * 0.64} width={6} height={H * 0.1} rx={2} fill="#6b4a2e" />

      {/* Left flower bed */}
      <Ellipse cx={42} cy={H * 0.58} rx={28} ry={10} fill="#166534" opacity={0.6} />
      {[28, 36, 44, 52, 58].map((fx, fi) => (
        <G key={fi}>
          <Circle cx={fx} cy={H * 0.55} r={5} fill={["#f87171","#fb923c","#fbbf24","#a3e635","#38bdf8"][fi]} />
          <Rect x={fx - 1} y={H * 0.56} width={2} height={H * 0.04} fill="#15803d" />
        </G>
      ))}

      {/* Right flower bed */}
      <Ellipse cx={W - 42} cy={H * 0.58} rx={28} ry={10} fill="#166534" opacity={0.6} />
      {[W - 58, W - 50, W - 42, W - 34, W - 26].map((fx, fi) => (
        <G key={fi}>
          <Circle cx={fx} cy={H * 0.55} r={5} fill={["#c084fc","#f472b6","#fb923c","#fbbf24","#34d399"][fi]} />
          <Rect x={fx - 1} y={H * 0.56} width={2} height={H * 0.04} fill="#15803d" />
        </G>
      ))}

      {/* Birds on fountain rim */}
      {[[W * 0.5 - 75, H * 0.57], [W * 0.5 + 60, H * 0.57], [W * 0.5 - 20, H * 0.54]].map(([bx, by], i) => (
        <G key={i}>
          <Ellipse cx={bx as number} cy={by as number} rx={7} ry={4} fill="#475569" />
          <Circle cx={(bx as number) - 4} cy={(by as number) - 4} r={4} fill="#334155" />
          <Path
            d={`M ${(bx as number) - 4} ${(by as number) - 4} L ${(bx as number) + 8} ${(by as number) - 2}`}
            stroke="#64748b"
            strokeWidth={2}
            fill="none"
          />
          <Path
            d={`M ${(bx as number) - 4} ${(by as number) - 3} L ${(bx as number) - 9} ${(by as number) - 7}`}
            stroke="#64748b"
            strokeWidth={1.5}
          />
        </G>
      ))}

      {/* Distant building silhouettes */}
      <Rect x={0} y={H * 0.05} width={55} height={H * 0.3} fill="#0c4a6e" opacity={0.4} rx={3} />
      <Rect x={8} y={H * 0.02} width={18} height={H * 0.06} fill="#0c4a6e" opacity={0.4} rx={2} />
      <Rect x={W - 60} y={H * 0.08} width={60} height={H * 0.28} fill="#0c4a6e" opacity={0.35} rx={3} />
      <Rect x={W - 45} y={H * 0.04} width={20} height={H * 0.07} fill="#0c4a6e" opacity={0.35} rx={2} />
    </G>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 2 — Countryside Forest
// ─────────────────────────────────────────────────────────────────────────────
function ForestBiome({ width: W, height: H }: { width: number; height: number }) {
  return (
    <G>
      <Defs>
        <SvgGradient id="forestFloor" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#14532d" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#166534" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#052e16" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="pineTree" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#16a34a" />
          <Stop offset="1" stopColor="#052e16" />
        </SvgGradient>
        <SvgGradient id="oakTree" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#22c55e" />
          <Stop offset="1" stopColor="#166534" />
        </SvgGradient>
        <SvgGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#38bdf8" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#0369a1" stopOpacity="0.6" />
        </SvgGradient>
      </Defs>

      {/* Forest floor */}
      <Rect x="0" y={H * 0.7} width={W} height={H * 0.3} fill="url(#forestFloor)" />
      {/* Mossy ground bumps */}
      {[20, 60, 110, 160, 215, 270, 320, 365].map((gx, i) => (
        <Ellipse key={i} cx={gx} cy={H * 0.72} rx={22} ry={7} fill="#166534" opacity={0.35 + (i % 3) * 0.1} />
      ))}

      {/* Background distant tree silhouettes */}
      {[15, 55, 100, 150, 200, 255, 305, 350].map((tx, i) => {
        const th = H * (0.45 + (i % 3) * 0.06);
        return (
          <G key={i}>
            <Path
              d={`M ${tx} ${H * 0.72} L ${tx + 14} ${H * 0.72} L ${tx + 7} ${H * 0.72 - th}`}
              fill="#052e16"
              opacity={0.5}
            />
          </G>
        );
      })}

      {/* Mid-ground pines */}
      {[0, 80, 170, 260, 340].map((px, i) => {
        const ph = H * (0.55 + (i % 2) * 0.08);
        const pw = 50 + (i % 3) * 8;
        return (
          <G key={i}>
            {/* Trunk */}
            <Rect x={px + pw / 2 - 5} y={H * 0.7} width={10} height={H * 0.1} fill="#6b3a1f" />
            {/* Three tiers */}
            <Path d={`M${px} ${H * 0.7} L${px + pw / 2} ${H * 0.7 - ph * 0.35} L${px + pw} ${H * 0.7} Z`}
              fill="#16a34a" opacity={0.9} />
            <Path d={`M${px + 5} ${H * 0.7 - ph * 0.28} L${px + pw / 2} ${H * 0.7 - ph * 0.6} L${px + pw - 5} ${H * 0.7 - ph * 0.28} Z`}
              fill="#15803d" opacity={0.9} />
            <Path d={`M${px + 12} ${H * 0.7 - ph * 0.55} L${px + pw / 2} ${H * 0.7 - ph * 0.9} L${px + pw - 12} ${H * 0.7 - ph * 0.55} Z`}
              fill="#166534" opacity={0.9} />
          </G>
        );
      })}

      {/* Foreground oak trees */}
      <G>
        {/* Left oak */}
        <Rect x={22} y={H * 0.5} width={14} height={H * 0.22} fill="#7c4522" />
        <Ellipse cx={38} cy={H * 0.46} rx={44} ry={36} fill="#16a34a" />
        <Ellipse cx={28} cy={H * 0.42} rx={30} ry={24} fill="#22c55e" opacity={0.7} />
        <Ellipse cx={50} cy={H * 0.44} rx={28} ry={22} fill="#4ade80" opacity={0.5} />
      </G>
      <G>
        {/* Right oak */}
        <Rect x={W - 50} y={H * 0.48} width={14} height={H * 0.24} fill="#7c4522" />
        <Ellipse cx={W - 42} cy={H * 0.44} rx={48} ry={38} fill="#15803d" />
        <Ellipse cx={W - 32} cy={H * 0.4} rx={30} ry={24} fill="#16a34a" opacity={0.8} />
        <Ellipse cx={W - 55} cy={H * 0.42} rx={26} ry={20} fill="#22c55e" opacity={0.5} />
      </G>

      {/* Winding stream */}
      <Path
        d={`M 0 ${H * 0.78} C 60 ${H * 0.75} 100 ${H * 0.82} 160 ${H * 0.79} C 220 ${H * 0.76} 260 ${H * 0.83} 310 ${H * 0.8} C 350 ${H * 0.78} 375 ${H * 0.76} ${W} ${H * 0.77}`}
        stroke="#38bdf8"
        strokeWidth={14}
        fill="none"
        opacity={0.35}
        strokeLinecap="round"
      />
      <Path
        d={`M 0 ${H * 0.78} C 60 ${H * 0.75} 100 ${H * 0.82} 160 ${H * 0.79} C 220 ${H * 0.76} 260 ${H * 0.83} 310 ${H * 0.8} C 350 ${H * 0.78} 375 ${H * 0.76} ${W} ${H * 0.77}`}
        stroke="#7dd3fc"
        strokeWidth={6}
        fill="none"
        opacity={0.5}
        strokeLinecap="round"
        strokeDasharray="12 8"
      />

      {/* Mushrooms */}
      {[[W * 0.3, H * 0.72], [W * 0.62, H * 0.74], [W * 0.18, H * 0.75]].map(([mx, my], i) => (
        <G key={i}>
          <Rect x={(mx as number) - 4} y={my as number} width={8} height={H * 0.05} rx={2} fill="#f1f5f9" />
          <Ellipse cx={mx as number} cy={my as number} rx={14} ry={9} fill="#dc2626" />
          {[[-5, -2], [2, -4], [7, -1]].map(([dx2, dy2], j) => (
            <Circle key={j} cx={(mx as number) + dx2} cy={(my as number) + dy2} r={2.5} fill="white" opacity={0.7} />
          ))}
        </G>
      ))}

      {/* Ferns */}
      {[W * 0.45, W * 0.75, W * 0.1].map((fx, fi) => (
        <G key={fi}>
          {[-20, -10, 0, 10, 20].map((dx, li) => (
            <Path
              key={li}
              d={`M ${fx} ${H * 0.73} Q ${(fx as number) + dx} ${H * 0.68} ${(fx as number) + dx * 1.5} ${H * 0.66}`}
              stroke="#4ade80"
              strokeWidth={2}
              fill="none"
              opacity={0.7}
              strokeLinecap="round"
            />
          ))}
        </G>
      ))}

      {/* Light rays (atmospheric) */}
      {[55, 175, 295].map((lx, i) => (
        <Path
          key={i}
          d={`M ${lx - 15} 0 L ${lx + 15} 0 L ${lx + 50} ${H} L ${lx - 50} ${H} Z`}
          fill="rgba(255,255,200,0.03)"
        />
      ))}
    </G>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 3 — Farmlands of Plenty
// ─────────────────────────────────────────────────────────────────────────────
function FarmBiome({ width: W, height: H }: { width: number; height: number }) {
  return (
    <G>
      <Defs>
        <SvgGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#bae6fd" stopOpacity="0.3" />
          <Stop offset="0.6" stopColor="#166534" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#052e16" stopOpacity="0.8" />
        </SvgGradient>
        <SvgGradient id="barnWall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ef4444" />
          <Stop offset="1" stopColor="#b91c1c" />
        </SvgGradient>
        <SvgGradient id="wheat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fbbf24" stopOpacity="0" />
          <Stop offset="0.4" stopColor="#f59e0b" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#b45309" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="wheatRight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fde68a" stopOpacity="0" />
          <Stop offset="0.4" stopColor="#fbbf24" stopOpacity="0.7" />
          <Stop offset="1" stopColor="#d97706" stopOpacity="1" />
        </SvgGradient>
      </Defs>

      {/* Ground */}
      <Rect x="0" y={H * 0.65} width={W} height={H * 0.35} fill="url(#farmSky)" />

      {/* Rolling hills */}
      <Ellipse cx={W * 0.2} cy={H * 0.68} rx={180} ry={60} fill="#166534" opacity={0.5} />
      <Ellipse cx={W * 0.75} cy={H * 0.7} rx={200} ry={55} fill="#15803d" opacity={0.45} />
      <Ellipse cx={W * 0.5} cy={H * 0.72} rx={240} ry={45} fill="#14532d" opacity={0.55} />

      {/* Wheat field left */}
      <Rect x={0} y={H * 0.6} width={120} height={H * 0.15} fill="url(#wheat)" />
      {Array.from({ length: 12 }).map((_, i) => (
        <G key={i}>
          <Line x1={i * 10 + 5} y1={H * 0.75} x2={i * 10 + 5} y2={H * 0.6} stroke="#fbbf24" strokeWidth={1.5} opacity={0.5} />
          <Ellipse cx={i * 10 + 5} cy={H * 0.61} rx={4} ry={7} fill="#fde68a" opacity={0.6} />
        </G>
      ))}

      {/* Wheat field right */}
      <Rect x={W - 130} y={H * 0.58} width={130} height={H * 0.17} fill="url(#wheatRight)" />
      {Array.from({ length: 13 }).map((_, i) => (
        <G key={i}>
          <Line x1={W - 128 + i * 10} y1={H * 0.75} x2={W - 128 + i * 10} y2={H * 0.58} stroke="#f59e0b" strokeWidth={1.5} opacity={0.5} />
          <Ellipse cx={W - 128 + i * 10} cy={H * 0.59} rx={4} ry={7} fill="#fbbf24" opacity={0.6} />
        </G>
      ))}

      {/* Fence */}
      <Rect x={0} y={H * 0.62} width={W} height={H * 0.025} fill="#7c4522" opacity={0.5} />
      <Rect x={0} y={H * 0.64} width={W} height={H * 0.02} fill="#6b3a1f" opacity={0.4} />
      {Array.from({ length: 22 }).map((_, i) => (
        <Rect key={i} x={i * 18} y={H * 0.59} width={6} height={H * 0.08} rx={1} fill="#6b3a1f" opacity={0.5} />
      ))}

      {/* ── Barn (right side) ── */}
      {/* Barn main body */}
      <Rect x={W - 145} y={H * 0.28} width={110} height={H * 0.38} fill="url(#barnWall)" rx={3} />
      {/* Gambrel roof */}
      <Path
        d={`M${W - 155} ${H * 0.28} L${W - 90} ${H * 0.08} L${W - 25} ${H * 0.28}`}
        fill="#7c1d1d"
      />
      <Path
        d={`M${W - 155} ${H * 0.28} L${W - 90} ${H * 0.08} L${W - 25} ${H * 0.28}`}
        stroke="#5a1212"
        strokeWidth={2}
        fill="none"
      />
      {/* Roof peak detail */}
      <Rect x={W - 97} y={H * 0.07} width={14} height={H * 0.06} fill="#9b2c2c" rx={2} />
      {/* Barn doors */}
      <Rect x={W - 126} y={H * 0.44} width={35} height={H * 0.22} rx={2} fill="#7c1d1d" />
      <Rect x={W - 109} y={H * 0.44} width={35} height={H * 0.22} rx={2} fill="#9b2c2c" />
      <Line x1={W - 126} y1={H * 0.44} x2={W - 109} y2={H * 0.66} stroke="#b91c1c" strokeWidth={2} />
      <Line x1={W - 126} y1={H * 0.66} x2={W - 109} y2={H * 0.44} stroke="#b91c1c" strokeWidth={2} />
      {/* Barn window (loft) */}
      <Ellipse cx={W - 90} cy={H * 0.22} rx={18} ry={14} fill="#1c1008" />
      <Ellipse cx={W - 90} cy={H * 0.22} rx={14} ry={11} fill="#92400e" opacity={0.4} />
      {/* White trim */}
      <Rect x={W - 145} y={H * 0.28} width={110} height={H * 0.04} fill="white" opacity={0.15} />

      {/* ── Windmill (left side) ── */}
      {/* Windmill tower */}
      <Path
        d={`M${40} ${H * 0.68} L${52} ${H * 0.68} L${55} ${H * 0.2} L${37} ${H * 0.2} Z`}
        fill="#d4a853"
      />
      {/* Tower window */}
      <Circle cx={46} cy={H * 0.45} r={6} fill="#1c1008" />
      <Circle cx={46} cy={H * 0.45} r={4} fill="#fde68a" opacity={0.3} />
      {/* Windmill cap */}
      <Path d={`M${30} ${H * 0.2} L${46} ${H * 0.1} L${62} ${H * 0.2}`} fill="#b45309" />
      {/* Windmill sails (cross pattern) */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const sx = 46 + Math.cos(rad) * 38;
        const sy = H * 0.16 + Math.sin(rad) * 38;
        const sw = Math.cos(rad) * 12;
        const sh = Math.sin(rad) * 12;
        return (
          <G key={i}>
            <Line
              x1={46}
              y1={H * 0.16}
              x2={sx}
              y2={sy}
              stroke="#92400e"
              strokeWidth={4}
            />
            <Path
              d={`M${sx - sw} ${sy - sh} L${sx + sw} ${sy + sh} L${46 + sw * 0.3} ${H * 0.16 + sh * 0.3} Z`}
              fill="#d97706"
              opacity={0.8}
            />
          </G>
        );
      })}
      <Circle cx={46} cy={H * 0.16} r={6} fill="#b45309" />

      {/* Sunflowers along fence */}
      {[W * 0.38, W * 0.48, W * 0.56].map((sx, si) => (
        <G key={si}>
          <Line x1={sx as number} y1={H * 0.65} x2={sx as number} y2={H * 0.5} stroke="#166534" strokeWidth={3} />
          <Circle cx={sx as number} cy={H * 0.5} r={14} fill="#fbbf24" />
          <Circle cx={sx as number} cy={H * 0.5} r={8} fill="#92400e" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((pa, pi) => {
            const pr = (pa * Math.PI) / 180;
            return (
              <Ellipse
                key={pi}
                cx={(sx as number) + Math.cos(pr) * 13}
                cy={H * 0.5 + Math.sin(pr) * 13}
                rx={6}
                ry={3}
                fill="#fde68a"
                opacity={0.8}
                rotation={pa}
                origin={`${sx}, ${H * 0.5}`}
              />
            );
          })}
        </G>
      ))}
    </G>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZONE 4 — The Jungle's Edge
// ─────────────────────────────────────────────────────────────────────────────
function JungleBiome({ width: W, height: H }: { width: number; height: number }) {
  return (
    <G>
      <Defs>
        <SvgGradient id="jungleFloor" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1a0533" stopOpacity="0" />
          <Stop offset="0.5" stopColor="#0b0f1a" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#000000" stopOpacity="0.9" />
        </SvgGradient>
        <SvgGradient id="leaf1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4ade80" />
          <Stop offset="1" stopColor="#052e16" />
        </SvgGradient>
        <SvgGradient id="leaf2" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#34d399" />
          <Stop offset="1" stopColor="#065f46" />
        </SvgGradient>
        <RadialGradient id="mysticalGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#a78bfa" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#6d28d9" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="magicOrb" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#c4b5fd" stopOpacity="0.9" />
          <Stop offset="0.5" stopColor="#7c3aed" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#4c1d95" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Dark forest floor */}
      <Rect x="0" y={H * 0.65} width={W} height={H * 0.35} fill="url(#jungleFloor)" />

      {/* Dense background foliage */}
      {[0, 60, 140, 210, 290, 360].map((lx, i) => {
        const lh = H * (0.4 + (i % 3) * 0.08);
        const lw = 70 + (i % 4) * 15;
        return (
          <Ellipse
            key={i}
            cx={lx as number}
            cy={H * 0.55 - lh / 2}
            rx={lw / 2}
            ry={lh / 2}
            fill={i % 2 === 0 ? "#052e16" : "#064e3b"}
            opacity={0.7}
          />
        );
      })}

      {/* Giant tropical leaves — left */}
      <Path
        d={`M 0 ${H * 0.5} Q 45 ${H * 0.2} 80 ${H * 0.15} Q 60 ${H * 0.35} 30 ${H * 0.6} Z`}
        fill="url(#leaf1)"
        opacity={0.85}
      />
      <Path d={`M 0 ${H * 0.5} Q 45 ${H * 0.325} 80 ${H * 0.15}`} stroke="#166534" strokeWidth={2} fill="none" opacity={0.4} />
      <Path
        d={`M 0 ${H * 0.65} Q 55 ${H * 0.35} 90 ${H * 0.28} Q 65 ${H * 0.5} 20 ${H * 0.7} Z`}
        fill="url(#leaf2)"
        opacity={0.75}
      />

      {/* Giant tropical leaves — right */}
      <Path
        d={`M ${W} ${H * 0.48} Q ${W - 45} ${H * 0.18} ${W - 80} ${H * 0.12} Q ${W - 60} ${H * 0.33} ${W - 30} ${H * 0.58} Z`}
        fill="url(#leaf1)"
        opacity={0.8}
      />
      <Path
        d={`M ${W} ${H * 0.62} Q ${W - 55} ${H * 0.32} ${W - 95} ${H * 0.25} Q ${W - 65} ${H * 0.48} ${W - 20} ${H * 0.68} Z`}
        fill="url(#leaf2)"
        opacity={0.7}
      />

      {/* Hanging vines */}
      {[30, 80, 140, 200, 260, 320, 375].map((vx, vi) => {
        const vl = H * (0.3 + (vi % 4) * 0.07);
        return (
          <G key={vi}>
            <Path
              d={`M ${vx} 0 Q ${(vx as number) + 15} ${vl * 0.5} ${vx} ${vl}`}
              stroke="#166534"
              strokeWidth={2.5}
              fill="none"
              opacity={0.6}
            />
            {[0.2, 0.4, 0.6, 0.8].map((t, ti) => (
              <Ellipse
                key={ti}
                cx={(vx as number) + 8 * t}
                cy={vl * t}
                rx={6}
                ry={3}
                fill="#22c55e"
                opacity={0.5}
                rotation={-20 + ti * 10}
              />
            ))}
          </G>
        );
      })}

      {/* Ancient ruins — stone arch */}
      <G opacity={0.65}>
        <Rect x={W * 0.38} y={H * 0.32} width={18} height={H * 0.4} rx={2} fill="#374151" />
        <Rect x={W * 0.52} y={H * 0.32} width={18} height={H * 0.4} rx={2} fill="#374151" />
        <Path
          d={`M ${W * 0.38} ${H * 0.32} Q ${W * 0.45} ${H * 0.2} ${W * 0.52} ${H * 0.32}`}
          stroke="#4b5563"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
        />
        {/* Arch moss */}
        <Path
          d={`M ${W * 0.38} ${H * 0.32} Q ${W * 0.45} ${H * 0.2} ${W * 0.52} ${H * 0.32}`}
          stroke="#166534"
          strokeWidth={4}
          fill="none"
          opacity={0.5}
        />
        {/* Arch glow */}
        <Circle cx={W * 0.45} cy={H * 0.28} r={30} fill="url(#mysticalGlow)" />
      </G>

      {/* Mystical light pillar */}
      <Path
        d={`M ${W * 0.42} 0 L ${W * 0.48} 0 L ${W * 0.6} ${H} L ${W * 0.35} ${H} Z`}
        fill="rgba(167,139,250,0.04)"
      />

      {/* Magic orbs / fireflies (static positions — ambient will animate) */}
      {FIREFLY_POSITIONS.map((f, i) => (
        <G key={i}>
          <Circle cx={f.x * W} cy={f.y * H} r={f.r + 2} fill="url(#magicOrb)" />
          <Circle cx={f.x * W} cy={f.y * H} r={f.r} fill={f.color} opacity={0.9} />
        </G>
      ))}

      {/* Exotic flowers */}
      {[[W * 0.12, H * 0.7], [W * 0.28, H * 0.68], [W * 0.68, H * 0.71], [W * 0.84, H * 0.69]].map(([fx, fy], fi) => (
        <G key={fi}>
          <Line x1={fx as number} y1={fy as number} x2={fx as number} y2={(fy as number) - H * 0.08} stroke="#22c55e" strokeWidth={2} />
          {[0, 60, 120, 180, 240, 300].map((pa2, pi) => {
            const pr2 = (pa2 * Math.PI) / 180;
            const petalColors = ["#f472b6","#c084fc","#a78bfa","#34d399","#60a5fa","#fb923c"];
            return (
              <Ellipse
                key={pi}
                cx={(fx as number) + Math.cos(pr2) * 10}
                cy={(fy as number) - H * 0.08 + Math.sin(pr2) * 10}
                rx={7}
                ry={4}
                fill={petalColors[pi]}
                opacity={0.8}
                rotation={pa2}
                origin={`${fx}, ${(fy as number) - H * 0.08}`}
              />
            );
          })}
          <Circle cx={fx as number} cy={(fy as number) - H * 0.08} r={4} fill="#fde68a" />
        </G>
      ))}
    </G>
  );
}

const FIREFLY_POSITIONS = [
  { x: 0.08, y: 0.55, r: 3, color: "#fde68a" },
  { x: 0.22, y: 0.42, r: 2.5, color: "#a78bfa" },
  { x: 0.35, y: 0.6,  r: 2, color: "#86efac" },
  { x: 0.55, y: 0.48, r: 3, color: "#fde68a" },
  { x: 0.72, y: 0.38, r: 2.5, color: "#c4b5fd" },
  { x: 0.88, y: 0.52, r: 2, color: "#6ee7b7" },
  { x: 0.15, y: 0.72, r: 1.8, color: "#fbbf24" },
  { x: 0.63, y: 0.68, r: 2, color: "#a78bfa" },
];

const BIOME_COMPONENTS = [BakeryBiome, FountainBiome, ForestBiome, FarmBiome, JungleBiome];

// Zone Y positions and heights (matching terrain band boundaries)
export const ZONE_BOUNDS = [
  { zone: 0, y: 1370, height: 390 },  // Bakery
  { zone: 1, y: 1010, height: 360 },  // Fountain
  { zone: 2, y: 650,  height: 360 },  // Forest
  { zone: 3, y: 310,  height: 340 },  // Farm
  { zone: 4, y: 0,    height: 310 },  // Jungle
] as const;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    width: CANVAS_WIDTH,
    overflow: "hidden",
  },
  completedGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
