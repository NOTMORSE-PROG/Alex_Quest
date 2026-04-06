import React from "react";
import { useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Polygon,
  Ellipse,
  Line,
} from "react-native-svg";

// Window grid helper
function BuildingWindows({
  bx,
  by,
  bw,
  bh,
  cols,
  rows,
  padX = 6,
  padY = 18,
  winW = 7,
  winH = 5,
  offPattern,
  litColor = "rgba(144,202,249,0.55)",
  darkColor = "rgba(20,55,100,0.5)",
}: {
  bx: number;
  by: number;
  bw: number;
  bh: number;
  cols: number;
  rows: number;
  padX?: number;
  padY?: number;
  winW?: number;
  winH?: number;
  offPattern?: Set<string>;
  litColor?: string;
  darkColor?: string;
}) {
  const gapX = (bw - padX * 2 - cols * winW) / Math.max(cols - 1, 1);
  const gapY = (bh - padY * 2 - rows * winH) / Math.max(rows - 1, 1);
  const windows: React.ReactElement[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      const isOff = offPattern?.has(key);
      const wx = bx + padX + c * (winW + gapX);
      const wy = by + padY + r * (winH + gapY);
      windows.push(
        <Rect
          key={key}
          x={wx}
          y={wy}
          width={winW}
          height={winH}
          rx={1}
          fill={isOff ? darkColor : litColor}
        />
      );
    }
  }
  return <>{windows}</>;
}

export const CityBackground = React.memo(function CityBackground() {
  const { width, height } = useWindowDimensions();

  const VW = 390;
  const VH = 844;

  // Off-patterns for each building
  const offL1 = new Set(["1-0","3-2","5-1","8-0","11-2","4-3","7-1","2-2"]);
  const offL2 = new Set(["0-1","2-3","5-0","8-2","11-4","3-4","14-2","17-1","4-0","9-3","6-1","12-3"]);
  const offL3 = new Set(["1-1","3-0","5-2","7-1","2-2","9-0"]);
  const offR1 = new Set(["2-0","4-2","7-0","10-1","5-3","8-2","1-1","3-3"]);
  const offR2 = new Set(["1-3","3-0","6-4","8-1","12-2","2-0","15-3","4-2","10-4","7-3","13-0"]);
  const offR3 = new Set(["0-1","2-2","4-0","6-1","8-2","3-1","5-0","7-2"]);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VW} ${VH}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        {/* ── SKY ── */}
        <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#1565C0" />
          <Stop offset="20%"  stopColor="#1E88E5" />
          <Stop offset="45%"  stopColor="#42A5F5" />
          <Stop offset="70%"  stopColor="#90CAF9" />
          <Stop offset="100%" stopColor="#BBDEFB" />
        </LinearGradient>

        {/* ── SUN GLOW ── */}
        <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="1"   />
          <Stop offset="18%"  stopColor="#FFF9C4"  stopOpacity="0.7" />
          <Stop offset="50%"  stopColor="#90CAF9"  stopOpacity="0.15"/>
          <Stop offset="100%" stopColor="#42A5F5"  stopOpacity="0"   />
        </RadialGradient>

        {/* ── BROWNSTONE LEFT (L1) warm vertical ── */}
        <LinearGradient id="brownL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%"   stopColor="#5D4E37" />
          <Stop offset="55%"  stopColor="#7B6B52" />
          <Stop offset="100%" stopColor="#6A5A42" />
        </LinearGradient>

        {/* ── GLASS TOWER LEFT (L2) ── */}
        <LinearGradient id="glassL" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#3A8CC0" />
          <Stop offset="20%"  stopColor="#2874A6" />
          <Stop offset="60%"  stopColor="#1A5C8A" />
          <Stop offset="100%" stopColor="#0F3D5E" />
        </LinearGradient>

        {/* ── CONCRETE LEFT (L3) ── */}
        <LinearGradient id="concreteL" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%"   stopColor="#6B7B8A" />
          <Stop offset="100%" stopColor="#8A9AA8" />
        </LinearGradient>

        {/* ── SANDSTONE RIGHT (R3) ── */}
        <LinearGradient id="sandR" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%"   stopColor="#B8A48C" />
          <Stop offset="100%" stopColor="#A08B70" />
        </LinearGradient>

        {/* ── GLASS TOWER RIGHT (R2) ── */}
        <LinearGradient id="glassR" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#3888B8" />
          <Stop offset="20%"  stopColor="#2A6888" />
          <Stop offset="60%"  stopColor="#1A4F6A" />
          <Stop offset="100%" stopColor="#0E3550" />
        </LinearGradient>

        {/* ── CONCRETE RIGHT (R1) ── */}
        <LinearGradient id="concreteR" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%"   stopColor="#7A8A9A" />
          <Stop offset="100%" stopColor="#5A6A7A" />
        </LinearGradient>

        {/* ── HERO TOWER GLASS ── */}
        <LinearGradient id="heroGlass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#B8DDF5" />
          <Stop offset="25%"  stopColor="#7CBCE0" />
          <Stop offset="60%"  stopColor="#4A9AC5" />
          <Stop offset="100%" stopColor="#2A7AA5" />
        </LinearGradient>

        {/* ── SIDEWALK ── */}
        <LinearGradient id="sidewalkGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%"   stopColor="#B0B0B0" />
          <Stop offset="100%" stopColor="#808080" />
        </LinearGradient>
      </Defs>

      {/* ══════════════════════════════════════════
          SKY + SUN
          ══════════════════════════════════════════ */}
      <Rect x={0} y={0} width={VW} height={VH} fill="url(#skyGrad)" />

      {/* Sun glow */}
      <Ellipse cx={195} cy={60} rx={140} ry={100} fill="url(#sunGlow)" />

      {/* Subtle light rays */}
      {[
        "195,60 50,0 140,0",
        "195,60 250,0 340,0",
        "195,60 0,200 0,320",
        "195,60 390,200 390,320",
      ].map((pts, i) => (
        <Polygon key={`ray-${i}`} points={pts} fill="rgba(255,248,200,0.035)" />
      ))}

      {/* ══════════════════════════════════════════
          CLOUDS
          ══════════════════════════════════════════ */}

      {/* Cloud A — upper left */}
      <Ellipse cx={72}  cy={85}  rx={42} ry={18} fill="#FFFFFF" fillOpacity={0.92} />
      <Ellipse cx={105} cy={78}  rx={34} ry={16} fill="#FFFFFF" fillOpacity={0.95} />
      <Ellipse cx={48}  cy={92}  rx={28} ry={12} fill="#FFFFFF" fillOpacity={0.84} />
      <Ellipse cx={90}  cy={70}  rx={20} ry={10} fill="#FFFFFF" fillOpacity={0.65} />

      {/* Cloud B — upper right */}
      <Ellipse cx={315} cy={105} rx={38} ry={16} fill="#FFFFFF" fillOpacity={0.90} />
      <Ellipse cx={285} cy={98}  rx={30} ry={14} fill="#FFFFFF" fillOpacity={0.93} />
      <Ellipse cx={338} cy={110} rx={24} ry={11} fill="#F8FCFF" fillOpacity={0.82} />

      {/* Cloud C — center wispy near sun */}
      <Ellipse cx={190} cy={130} rx={26} ry={8}  fill="#FFFFFF" fillOpacity={0.45} />
      <Ellipse cx={215} cy={125} rx={20} ry={7}  fill="#FFFFFF" fillOpacity={0.38} />

      {/* ══════════════════════════════════════════
          BACKGROUND DISTANT SKYLINE (pale haze)
          ══════════════════════════════════════════ */}

      {/* Distant building silhouettes — very pale, no windows */}
      <Rect x={130} y={180} width={24} height={460} fill="#B8D4E8" fillOpacity={0.55} />
      <Rect x={156} y={160} width={18} height={480} fill="#C2DBF0" fillOpacity={0.50} />
      <Rect x={178} y={200} width={16} height={440} fill="#CADEEE" fillOpacity={0.45} />
      <Rect x={196} y={195} width={16} height={445} fill="#CADEEE" fillOpacity={0.45} />
      <Rect x={216} y={160} width={18} height={480} fill="#C2DBF0" fillOpacity={0.50} />
      <Rect x={236} y={180} width={24} height={460} fill="#B8D4E8" fillOpacity={0.55} />
      <Rect x={145} y={220} width={14} height={420} fill="#D0E6F5" fillOpacity={0.38} />
      <Rect x={231} y={220} width={14} height={420} fill="#D0E6F5" fillOpacity={0.38} />

      {/* ══════════════════════════════════════════
          HERO TOWER (One WTC — center background)
          ══════════════════════════════════════════ */}
      <Rect x={180} y={20} width={30} height={620} fill="url(#heroGlass)" />
      {/* Reflection bands */}
      {Array.from({ length: 18 }, (_, i) => (
        <Rect
          key={`hero-b-${i}`}
          x={180} y={20 + i * 34}
          width={30} height={2}
          fill="rgba(255,255,255,0.14)"
        />
      ))}
      {/* Glare */}
      <Rect x={181} y={20} width={10} height={100} fill="rgba(255,255,255,0.18)" />
      {/* Spire */}
      <Polygon points="195,20 192,45 198,45" fill="#A8D4EC" />
      <Line x1={195} y1={20} x2={195} y2={4} stroke="#90C4DC" strokeWidth={1.5} />

      {/* ══════════════════════════════════════════
          LEFT BUILDINGS (L1–L4, front to back)
          ══════════════════════════════════════════ */}

      {/* ── L4 — light blue background building (innermost) ── */}
      <Rect x={164} y={160} width={30} height={480} fill="#5BA3C9" fillOpacity={0.85} />
      {Array.from({ length: 6 }, (_, i) => (
        <Rect key={`l4w-${i}`} x={168} y={175 + i * 72} width={10} height={5} rx={1} fill="rgba(180,225,250,0.45)" />
      ))}

      {/* ── L3 — grey concrete (shorter) ── */}
      <Rect x={126} y={90} width={38} height={550} fill="url(#concreteL)" />
      {/* Floor lines */}
      {Array.from({ length: 16 }, (_, i) => (
        <Line key={`l3f-${i}`} x1={126} y1={90 + i * 34} x2={164} y2={90 + i * 34} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
      ))}
      <BuildingWindows
        bx={126} by={90} bw={38} bh={550}
        cols={2} rows={14}
        padX={5} padY={14} winW={9} winH={5}
        offPattern={offL3}
        litColor="rgba(170,210,240,0.45)"
        darkColor="rgba(40,60,80,0.45)"
      />
      {/* Setback top */}
      <Rect x={130} y={90} width={30} height={18} rx={1} fill="#7A8A98" />
      {/* Rooftop equipment */}
      <Rect x={138} y={80} width={14} height={12} rx={1} fill="#5A6A78" />
      {/* Shadow on right edge */}
      <Rect x={161} y={90} width={3} height={550} fill="rgba(0,0,0,0.18)" />

      {/* ── 4px GAP (L3-L2) — sky visible ── */}

      {/* ── L2 — modern glass tower (tallest left, edge-to-edge) ── */}
      <Rect x={60} y={10} width={64} height={630} fill="url(#glassL)" />
      {/* Curtain wall floor lines */}
      {Array.from({ length: 22 }, (_, i) => (
        <Line key={`l2f-${i}`} x1={60} y1={10 + i * 29} x2={124} y2={10 + i * 29} stroke="rgba(255,255,255,0.10)" strokeWidth={0.6} />
      ))}
      <BuildingWindows
        bx={60} by={10} bw={64} bh={630}
        cols={4} rows={20}
        padX={6} padY={14} winW={8} winH={6}
        offPattern={offL2}
        litColor="rgba(144,202,249,0.52)"
        darkColor="rgba(14,48,88,0.52)"
      />
      {/* Sun glare on upper glass */}
      <Rect x={62} y={10} width={22} height={80} rx={2} fill="rgba(255,255,255,0.22)" />
      <Rect x={62} y={10} width={8} height={160} rx={1} fill="rgba(255,255,255,0.10)" />
      {/* Rooftop */}
      <Rect x={65} y={6} width={20} height={8} rx={1} fill="#0A3050" />
      <Rect x={90} y={2} width={16} height={12} rx={1} fill="#0A3050" />
      <Line x1={98} y1={2} x2={98} y2={-12} stroke="#4A8AAE" strokeWidth={1.5} />
      {/* Shadow on right edge */}
      <Rect x={121} y={10} width={3} height={630} fill="rgba(0,0,0,0.20)" />

      {/* ── 4px GAP (L2-L1) — sky visible ── */}

      {/* ── L1 — brownstone (warm, leftmost) ── */}
      <Rect x={0} y={48} width={58} height={592} fill="url(#brownL)" />
      {/* Horizontal mortar lines (brick feel) */}
      {Array.from({ length: 19 }, (_, i) => (
        <Line key={`l1f-${i}`} x1={0} y1={48 + i * 31} x2={58} y2={48 + i * 31} stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
      ))}
      {/* Brownstone windows — warm lit */}
      <BuildingWindows
        bx={0} by={48} bw={58} bh={592}
        cols={3} rows={16}
        padX={5} padY={16} winW={8} winH={6}
        offPattern={offL1}
        litColor="rgba(255,230,180,0.48)"
        darkColor="rgba(60,45,30,0.5)"
      />
      {/* Cornice at top */}
      <Rect x={0} y={44} width={58} height={6} rx={1} fill="#8A7A62" />
      <Rect x={0} y={40} width={58} height={5} rx={1} fill="#7A6A52" />
      {/* Fire escape accent (NYC character) */}
      <Rect x={15} y={110} width={20} height={2} fill="rgba(50,40,30,0.6)" />
      <Rect x={15} y={175} width={20} height={2} fill="rgba(50,40,30,0.6)" />
      <Rect x={15} y={240} width={20} height={2} fill="rgba(50,40,30,0.6)" />
      <Rect x={15} y={305} width={20} height={2} fill="rgba(50,40,30,0.6)" />
      <Line x1={25} y1={110} x2={25} y2={305} stroke="rgba(50,40,30,0.5)" strokeWidth={1} />
      {/* Shadow on right edge */}
      <Rect x={55} y={48} width={3} height={592} fill="rgba(0,0,0,0.15)" />

      {/* ══════════════════════════════════════════
          RIGHT BUILDINGS (R1–R4, front to back)
          ══════════════════════════════════════════ */}

      {/* ── R4 — light blue background building (innermost) ── */}
      <Rect x={196} y={148} width={28} height={492} fill="#5BA3C9" fillOpacity={0.85} />
      {Array.from({ length: 6 }, (_, i) => (
        <Rect key={`r4w-${i}`} x={200} y={165 + i * 72} width={10} height={5} rx={1} fill="rgba(180,225,250,0.45)" />
      ))}

      {/* ── R3 — warm sandstone (taller) ── */}
      <Rect x={226} y={75} width={40} height={565} fill="url(#sandR)" />
      {Array.from({ length: 16 }, (_, i) => (
        <Line key={`r3f-${i}`} x1={226} y1={75 + i * 35} x2={266} y2={75 + i * 35} stroke="rgba(0,0,0,0.06)" strokeWidth={0.5} />
      ))}
      <BuildingWindows
        bx={226} by={75} bw={40} bh={565}
        cols={2} rows={14}
        padX={5} padY={16} winW={9} winH={6}
        offPattern={offR3}
        litColor="rgba(230,210,180,0.50)"
        darkColor="rgba(80,65,45,0.45)"
      />
      {/* Decorative top — arched cornice */}
      <Rect x={226} y={71} width={40} height={6} rx={1} fill="#BCA88E" />
      <Rect x={230} y={65} width={32} height={8} rx={2} fill="#B09A80" />
      {/* Shadow on left edge (sun from left) */}
      <Rect x={226} y={75} width={3} height={565} fill="rgba(0,0,0,0.12)" />

      {/* ── 4px GAP ── */}

      {/* ── R2 — steel glass tower (tallest right) ── */}
      <Rect x={270} y={5} width={62} height={635} fill="url(#glassR)" />
      {Array.from({ length: 22 }, (_, i) => (
        <Line key={`r2f-${i}`} x1={270} y1={5 + i * 29} x2={332} y2={5 + i * 29} stroke="rgba(255,255,255,0.09)" strokeWidth={0.6} />
      ))}
      <BuildingWindows
        bx={270} by={5} bw={62} bh={635}
        cols={4} rows={20}
        padX={6} padY={14} winW={8} winH={6}
        offPattern={offR2}
        litColor="rgba(144,202,249,0.50)"
        darkColor="rgba(14,48,88,0.50)"
      />
      {/* Sun glare */}
      <Rect x={272} y={5} width={20} height={75} rx={2} fill="rgba(255,255,255,0.20)" />
      <Rect x={272} y={5} width={8} height={150} rx={1} fill="rgba(255,255,255,0.09)" />
      {/* Rooftop */}
      <Rect x={278} y={0} width={22} height={9} rx={1} fill="#0A3050" />
      <Rect x={308} y={0} width={16} height={7} rx={1} fill="#0A3050" />
      <Line x1={316} y1={0} x2={316} y2={-14} stroke="#4A8AAE" strokeWidth={1.5} />
      {/* Shadow on left edge */}
      <Rect x={270} y={5} width={3} height={635} fill="rgba(0,0,0,0.18)" />

      {/* ── 4px GAP ── */}

      {/* ── R1 — dark concrete (rightmost edge) ── */}
      <Rect x={336} y={55} width={54} height={585} fill="url(#concreteR)" />
      {Array.from({ length: 18 }, (_, i) => (
        <Line key={`r1f-${i}`} x1={336} y1={55 + i * 32} x2={390} y2={55 + i * 32} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} />
      ))}
      <BuildingWindows
        bx={336} by={55} bw={54} bh={585}
        cols={3} rows={15}
        padX={6} padY={16} winW={8} winH={5}
        offPattern={offR1}
        litColor="rgba(160,200,230,0.42)"
        darkColor="rgba(30,50,70,0.48)"
      />
      {/* Flat top with water tower silhouette */}
      <Rect x={336} y={51} width={54} height={6} rx={1} fill="#4A5A6A" />
      <Rect x={356} y={38} width={14} height={16} rx={1} fill="#3A4A5A" />
      <Rect x={354} y={34} width={18} height={5} rx={1} fill="#4A5A6A" />
      {/* Fire escape on right edge */}
      <Rect x={368} y={120} width={18} height={2} fill="rgba(60,70,80,0.55)" />
      <Rect x={368} y={190} width={18} height={2} fill="rgba(60,70,80,0.55)" />
      <Rect x={368} y={260} width={18} height={2} fill="rgba(60,70,80,0.55)" />
      <Line x1={377} y1={120} x2={377} y2={260} stroke="rgba(60,70,80,0.45)" strokeWidth={1} />
      {/* Shadow on left edge */}
      <Rect x={336} y={55} width={3} height={585} fill="rgba(0,0,0,0.15)" />

      {/* ══════════════════════════════════════════
          TREES (sidewalk level, both sides)
          ══════════════════════════════════════════ */}

      {/* Left trees */}
      {([
        [14,  622, 18, 24, "#1B5E20"],
        [36,  616, 22, 28, "#2E7D32"],
        [55,  620, 16, 22, "#388E3C"],
        [78,  614, 24, 30, "#2E7D32"],
        [100, 618, 15, 20, "#43A047"],
        [118, 616, 18, 26, "#2E7D32"],
        [25,  632, 14, 15, "#145214"],
        [50,  630, 16, 14, "#1A6B1A"],
        [72,  632, 12, 13, "#145214"],
        [95,  630, 14, 16, "#256B25"],
        [112, 631, 13, 14, "#1A5A1A"],
      ] as [number,number,number,number,string][]).map(([cx, cy, rx, ry, c], i) => (
        <Ellipse key={`tL-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} />
      ))}

      {/* Right trees */}
      {([
        [376, 622, 18, 24, "#1B5E20"],
        [354, 616, 22, 28, "#2E7D32"],
        [335, 620, 16, 22, "#388E3C"],
        [312, 614, 24, 30, "#2E7D32"],
        [290, 618, 15, 20, "#43A047"],
        [272, 616, 18, 26, "#2E7D32"],
        [365, 632, 14, 15, "#145214"],
        [340, 630, 16, 14, "#1A6B1A"],
        [318, 632, 12, 13, "#145214"],
        [295, 630, 14, 16, "#256B25"],
        [278, 631, 13, 14, "#1A5A1A"],
      ] as [number,number,number,number,string][]).map(([cx, cy, rx, ry, c], i) => (
        <Ellipse key={`tR-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} />
      ))}

      {/* Center trees (between buildings in the middle gap) */}
      {([
        [165, 628, 14, 18, "#2E7D32"],
        [185, 624, 16, 22, "#388E3C"],
        [205, 628, 14, 18, "#2E7D32"],
        [225, 624, 16, 22, "#388E3C"],
        [175, 634, 10, 12, "#145214"],
        [195, 632, 12, 14, "#1A6B1A"],
        [215, 634, 10, 12, "#145214"],
      ] as [number,number,number,number,string][]).map(([cx, cy, rx, ry, c], i) => (
        <Ellipse key={`tC-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={c} />
      ))}

      {/* ══════════════════════════════════════════
          SIDEWALK / PAVEMENT
          ══════════════════════════════════════════ */}
      <Rect x={0} y={640} width={VW} height={204} fill="url(#sidewalkGrad)" />
      {/* Left walkway — lighter */}
      <Rect x={0} y={640} width={125} height={204} fill="rgba(255,255,255,0.08)" />
      {/* Right walkway — lighter */}
      <Rect x={265} y={640} width={125} height={204} fill="rgba(255,255,255,0.08)" />
      {/* Center strip — slightly darker */}
      <Rect x={125} y={640} width={140} height={204} fill="rgba(0,0,0,0.08)" />
      {/* Ground-to-building blend */}
      <Rect x={0} y={636} width={VW} height={12} fill="rgba(140,170,195,0.18)" />
    </Svg>
  );
});
