/**
 * Home screen location scenes — one rich layered SVG + ambient MotiView
 * animations per chapter location. Rendered as the full-screen backdrop on
 * the home screen, replacing the static CityBackground when the player
 * accepts a chapter quest.
 *
 * Chapters → scenes:
 *   null / default → CityBackground (imported in HomeBackground.tsx)
 *   1 → BakeryScene    (Bakery District — warm dawn amber)
 *   2 → FountainScene  (Fountain Square — bright teal noon)
 *   3 → FarmScene      (Golden Farm — harvest golden hour)
 *   4 → ForestScene    (Ancient Forest — cool purple dusk)
 *   5 → JungleScene    (Jungle Temple — deep green canopy)
 *
 * Each scene: SVG for static layered art + absolute MotiView loops for
 * ambient motion (smoke, water, clouds, fireflies, vines, etc.).
 */

import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Circle,
  Ellipse,
  Polygon,
  G,
  Line,
} from "react-native-svg";
import { MotiView } from "moti";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

const VW = 390;
const VH = 844;

function pctX(p: number) { return VW * p; }
function pctY(p: number) { return VH * p; }

// ─────────────────────────────────────────────────────────────────────────────
// 1. BAKERY SCENE — "The Bakery District"
//    Warm dawn: cream sky fading to soft orange, cobblestone street,
//    two-storey bakery shop with striped awning, chimney, warm window glow.
//    Ambience: rising chimney smoke puffs, warm window glow pulse.
// ─────────────────────────────────────────────────────────────────────────────

export function BakeryScene() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.fill}>
      {/* ── Static SVG ── */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Sky — warm dawn */}
          <LinearGradient id="bk_sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1a0a00" />
            <Stop offset="25%" stopColor="#7c3100" />
            <Stop offset="55%" stopColor="#e8701a" />
            <Stop offset="80%" stopColor="#f5c97a" />
            <Stop offset="100%" stopColor="#fde8b5" />
          </LinearGradient>
          {/* Sun glow */}
          <RadialGradient id="bk_sun" cx="65%" cy="52%" r="28%">
            <Stop offset="0%" stopColor="#fff0a0" stopOpacity="0.9" />
            <Stop offset="40%" stopColor="#ffcc55" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#f5a020" stopOpacity="0" />
          </RadialGradient>
          {/* Building wall */}
          <LinearGradient id="bk_wall" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#f2dba0" />
            <Stop offset="100%" stopColor="#d4a84b" />
          </LinearGradient>
          {/* Side building */}
          <LinearGradient id="bk_wall2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#e8c97a" />
            <Stop offset="100%" stopColor="#c49640" />
          </LinearGradient>
          {/* Ground */}
          <LinearGradient id="bk_ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#5c2e00" />
            <Stop offset="100%" stopColor="#2d1500" />
          </LinearGradient>
          {/* Awning */}
          <LinearGradient id="bk_awning" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#c0392b" />
            <Stop offset="14.28%" stopColor="#f5f5f5" />
            <Stop offset="28.57%" stopColor="#c0392b" />
            <Stop offset="42.85%" stopColor="#f5f5f5" />
            <Stop offset="57.14%" stopColor="#c0392b" />
            <Stop offset="71.42%" stopColor="#f5f5f5" />
            <Stop offset="85.71%" stopColor="#c0392b" />
            <Stop offset="100%" stopColor="#f5f5f5" />
          </LinearGradient>
          {/* Window warm glow */}
          <RadialGradient id="bk_winGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
            <Stop offset="60%" stopColor="#f59e0b" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ── Sky + sun glow ── */}
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#bk_sky)" />
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#bk_sun)" />

        {/* ── Far horizon — faint city silhouette ── */}
        <Path
          d={`M0,${pctY(0.50)} L30,${pctY(0.43)} L50,${pctY(0.43)} L50,${pctY(0.38)} L65,${pctY(0.38)} L65,${pctY(0.34)} L80,${pctY(0.34)} L80,${pctY(0.38)} L110,${pctY(0.38)} L120,${pctY(0.32)} L135,${pctY(0.32)} L135,${pctY(0.38)} L160,${pctY(0.38)} L160,${pctY(0.44)} L200,${pctY(0.44)} L200,${pctY(0.39)} L225,${pctY(0.39)} L230,${pctY(0.35)} L245,${pctY(0.35)} L255,${pctY(0.39)} L280,${pctY(0.39)} L290,${pctY(0.43)} L330,${pctY(0.43)} L340,${pctY(0.37)} L355,${pctY(0.37)} L365,${pctY(0.43)} L${VW},${pctY(0.43)} L${VW},${pctY(0.50)} Z`}
          fill="#3d1a00"
          opacity={0.35}
        />

        {/* ── Ground — cobblestone ── */}
        <Rect x="0" y={pctY(0.74)} width={VW} height={pctY(0.26)} fill="url(#bk_ground)" />
        {/* Cobblestone rows */}
        {[0.755, 0.785, 0.815, 0.845, 0.875, 0.905, 0.935, 0.965].map((row, ri) => (
          <G key={ri}>
            {Array.from({ length: 11 }).map((_, ci) => (
              <Rect
                key={ci}
                x={ci * (VW / 11) + (ri % 2 === 0 ? 0 : VW / 22) - 2}
                y={pctY(row)}
                width={VW / 11 - 3}
                height={pctY(0.024)}
                rx={3}
                fill={ci % 3 === 0 ? "#6b2f00" : ci % 3 === 1 ? "#7c3a0a" : "#8a4510"}
                opacity={0.55}
              />
            ))}
          </G>
        ))}
        {/* Sidewalk highlight stripe */}
        <Rect x="0" y={pctY(0.74)} width={VW} height={3} fill="#ffcc88" opacity={0.18} />

        {/* ── Left side building (narrower) ── */}
        <Rect x={0} y={pctY(0.30)} width={90} height={pctY(0.44)} fill="url(#bk_wall2)" />
        <Rect x={0} y={pctY(0.30)} width={90} height={2} fill="#fff8e0" opacity={0.5} />
        {/* Its window */}
        <Rect x={20} y={pctY(0.40)} width={25} height={32} rx={4} fill="#fde68a" />
        <Rect x={55} y={pctY(0.40)} width={25} height={32} rx={4} fill="#fde68a" />
        <Rect x={20} y={pctY(0.57)} width={25} height={32} rx={4} fill="#fde68a" />
        <Rect x={55} y={pctY(0.57)} width={25} height={32} rx={4} fill="#fde68a" />

        {/* ── Main Bakery Building ── */}
        <Rect x={82} y={pctY(0.16)} width={210} height={pctY(0.58)} fill="url(#bk_wall)" rx={2} />
        {/* Facade trim */}
        <Rect x={82} y={pctY(0.16)} width={210} height={4} fill="#fff8e0" opacity={0.7} />
        {/* Decorative corniche */}
        <Rect x={78} y={pctY(0.16)} width={218} height={10} rx={2} fill="#c49640" opacity={0.8} />

        {/* Bakery sign */}
        <Rect x={110} y={pctY(0.24)} width={154} height={32} rx={6} fill="#7c1f00" />
        <Rect x={112} y={pctY(0.24) + 2} width={150} height={28} rx={5} fill="#9a2800" />

        {/* First floor windows — tall display windows */}
        <Rect x={95} y={pctY(0.435)} width={68} height={pctY(0.20)} rx={4} fill="#fff3cc" opacity={0.9} />
        <Rect x={95} y={pctY(0.435)} width={68} height={pctY(0.20)} rx={4} fill="url(#bk_winGlow)" />
        <Line x1={129} y1={pctY(0.435)} x2={129} y2={pctY(0.635)} stroke="#d4a84b" strokeWidth={2} />

        <Rect x={211} y={pctY(0.435)} width={68} height={pctY(0.20)} rx={4} fill="#fff3cc" opacity={0.9} />
        <Rect x={211} y={pctY(0.435)} width={68} height={pctY(0.20)} rx={4} fill="url(#bk_winGlow)" />
        <Line x1={245} y1={pctY(0.435)} x2={245} y2={pctY(0.635)} stroke="#d4a84b" strokeWidth={2} />

        {/* Second floor windows */}
        <Rect x={103} y={pctY(0.295)} width={42} height={46} rx={4} fill="#fde68a" opacity={0.9} />
        <Rect x={103} y={pctY(0.295)} width={42} height={46} rx={4} fill="url(#bk_winGlow)" />
        <Rect x={163} y={pctY(0.295)} width={42} height={46} rx={4} fill="#fde68a" opacity={0.9} />
        <Rect x={163} y={pctY(0.295)} width={42} height={46} rx={4} fill="url(#bk_winGlow)" />
        <Rect x={223} y={pctY(0.295)} width={42} height={46} rx={4} fill="#fde68a" opacity={0.9} />
        <Rect x={223} y={pctY(0.295)} width={42} height={46} rx={4} fill="url(#bk_winGlow)" />

        {/* Awning over display windows */}
        <Rect x={88} y={pctY(0.425)} width={200} height={18} fill="url(#bk_awning)" rx={2} />
        <Path
          d={`M88,${pctY(0.425) + 18} Q108,${pctY(0.425) + 30} 128,${pctY(0.425) + 18} Q148,${pctY(0.425) + 30} 168,${pctY(0.425) + 18} Q188,${pctY(0.425) + 30} 208,${pctY(0.425) + 18} Q228,${pctY(0.425) + 30} 248,${pctY(0.425) + 18} Q268,${pctY(0.425) + 30} 288,${pctY(0.425) + 18}`}
          stroke="#9a1a0a"
          strokeWidth={1.5}
          fill="none"
        />

        {/* Door */}
        <Rect x={170} y={pctY(0.62)} width={36} height={pctY(0.12)} rx={4} fill="#5c1f00" />
        <Rect x={175} y={pctY(0.625)} width={12} height={pctY(0.10)} rx={2} fill="#2d0e00" />
        <Rect x={189} y={pctY(0.625)} width={12} height={pctY(0.10)} rx={2} fill="#2d0e00" />
        <Circle cx={189} cy={pctY(0.68)} r={3} fill="#f5d48a" />

        {/* Chimney */}
        <Rect x={145} y={pctY(0.07)} width={18} height={pctY(0.10)} rx={2} fill="#8a4f30" />
        <Rect x={141} y={pctY(0.07)} width={26} height={8} rx={2} fill="#6b3520" />
        <Rect x={215} y={pctY(0.09)} width={14} height={pctY(0.08)} rx={2} fill="#8a4f30" />
        <Rect x={212} y={pctY(0.09)} width={20} height={7} rx={2} fill="#6b3520" />

        {/* ── Right building ── */}
        <Rect x={290} y={pctY(0.28)} width={VW - 290} height={pctY(0.46)} fill="#c49640" />
        <Rect x={300} y={pctY(0.38)} width={28} height={38} rx={3} fill="#fde68a" />
        <Rect x={340} y={pctY(0.38)} width={28} height={38} rx={3} fill="#fde68a" />
        <Rect x={300} y={pctY(0.56)} width={28} height={38} rx={3} fill="#fde68a" />
        <Rect x={340} y={pctY(0.56)} width={28} height={38} rx={3} fill="#fde68a" />

        {/* Flower boxes under main building windows */}
        <Rect x={95} y={pctY(0.635)} width={68} height={10} rx={3} fill="#7c3a10" />
        <Ellipse cx={105} cy={pctY(0.633)} rx={5} ry={7} fill="#e74c3c" />
        <Ellipse cx={118} cy={pctY(0.631)} rx={5} ry={8} fill="#ff6b9d" />
        <Ellipse cx={131} cy={pctY(0.633)} rx={4} ry={7} fill="#e74c3c" />
        <Ellipse cx={143} cy={pctY(0.632)} rx={5} ry={7} fill="#ff6b9d" />
        <Rect x={211} y={pctY(0.635)} width={68} height={10} rx={3} fill="#7c3a10" />
        <Ellipse cx={221} cy={pctY(0.633)} rx={5} ry={7} fill="#ff6b9d" />
        <Ellipse cx={234} cy={pctY(0.631)} rx={5} ry={8} fill="#e74c3c" />
        <Ellipse cx={247} cy={pctY(0.633)} rx={4} ry={7} fill="#ff6b9d" />
        <Ellipse cx={259} cy={pctY(0.632)} rx={5} ry={7} fill="#e74c3c" />

        {/* Street lamp left */}
        <Rect x={60} y={pctY(0.50)} width={4} height={pctY(0.24)} fill="#4a2800" />
        <Path d={`M62,${pctY(0.50)} Q62,${pctY(0.44)} 78,${pctY(0.44)}`} stroke="#4a2800" strokeWidth={4} fill="none" />
        <Ellipse cx={78} cy={pctY(0.44)} rx={10} ry={6} fill="#fde68a" opacity={0.9} />

        {/* Street lamp right */}
        <Rect x={326} y={pctY(0.50)} width={4} height={pctY(0.24)} fill="#4a2800" />
        <Path d={`M328,${pctY(0.50)} Q328,${pctY(0.44)} 312,${pctY(0.44)}`} stroke="#4a2800" strokeWidth={4} fill="none" />
        <Ellipse cx={312} cy={pctY(0.44)} rx={10} ry={6} fill="#fde68a" opacity={0.9} />

        {/* Bread display in window */}
        <Ellipse cx={115} cy={pctY(0.60)} rx={14} ry={8} fill="#c49640" opacity={0.7} />
        <Ellipse cx={135} cy={pctY(0.595)} rx={10} ry={6} fill="#a0722a" opacity={0.7} />
        <Ellipse cx={240} cy={pctY(0.60)} rx={14} ry={8} fill="#c49640" opacity={0.7} />
        <Ellipse cx={260} cy={pctY(0.595)} rx={10} ry={6} fill="#a0722a" opacity={0.7} />

        {/* Ground glow from lamps */}
        <Ellipse cx={78} cy={pctY(0.74)} rx={22} ry={8} fill="#fde68a" opacity={0.12} />
        <Ellipse cx={312} cy={pctY(0.74)} rx={22} ry={8} fill="#fde68a" opacity={0.12} />
      </Svg>

      {/* ── Animated smoke puffs from chimneys ── */}
      {[
        { left: width * (154 / VW), baseTop: height * 0.075, delay: 0,    dur: 3200 },
        { left: width * (156 / VW), baseTop: height * 0.075, delay: 600,  dur: 3000 },
        { left: width * (152 / VW), baseTop: height * 0.075, delay: 1200, dur: 3400 },
        { left: width * (221 / VW), baseTop: height * 0.095, delay: 300,  dur: 2900 },
        { left: width * (223 / VW), baseTop: height * 0.095, delay: 900,  dur: 3100 },
      ].map((s, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.45, 0.25, 0], translateY: [-20, -55, -90], scale: [0.4, 1.1, 1.8] }}
          transition={{ loop: true, duration: s.dur, delay: s.delay, type: "timing" }}
          style={[styles.smokePuff, { left: s.left, top: s.baseTop }]}
        />
      ))}

      {/* ── Window glow pulse ── */}
      {[
        { left: width * (88 / VW), top: height * 0.435, w: width * (72 / VW), h: height * 0.21, delay: 0, dur: 4000 },
        { left: width * (204 / VW), top: height * 0.435, w: width * (72 / VW), h: height * 0.21, delay: 1500, dur: 4500 },
      ].map((g, i) => (
        <MotiView
          key={`glow-${i}`}
          from={{ opacity: 0.0 }}
          animate={{ opacity: [0.0, 0.18, 0.0] }}
          transition={{ loop: true, duration: g.dur, delay: g.delay, type: "timing" }}
          style={{
            position: "absolute",
            left: g.left,
            top: g.top,
            width: g.w,
            height: g.h,
            backgroundColor: "#fde68a",
            borderRadius: 6,
          }}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FOUNTAIN SCENE — "Fountain Square"
//    Bright teal noon sky, marble ornate fountain in a cobblestone plaza,
//    leafy trees flanking, distant pastel buildings.
//    Ambience: water droplet arcs, expanding ripple circles.
// ─────────────────────────────────────────────────────────────────────────────

export function FountainScene() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.fill}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Sky — bright cerulean noon */}
          <LinearGradient id="ft_sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0c4a6e" />
            <Stop offset="35%" stopColor="#0ea5e9" />
            <Stop offset="70%" stopColor="#38bdf8" />
            <Stop offset="100%" stopColor="#bae6fd" />
          </LinearGradient>
          {/* Sun glow */}
          <RadialGradient id="ft_sun" cx="50%" cy="28%" r="22%">
            <Stop offset="0%" stopColor="#fffde7" stopOpacity="0.85" />
            <Stop offset="40%" stopColor="#ffd600" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </RadialGradient>
          {/* Plaza ground */}
          <LinearGradient id="ft_ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#d0c8b8" />
            <Stop offset="100%" stopColor="#8a8070" />
          </LinearGradient>
          {/* Fountain marble */}
          <LinearGradient id="ft_marble" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#f8f4f0" />
            <Stop offset="100%" stopColor="#c8c0b0" />
          </LinearGradient>
          {/* Fountain basin water */}
          <LinearGradient id="ft_water" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.9" />
          </LinearGradient>
          {/* Building façades */}
          <LinearGradient id="ft_bldg1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#fef3c7" />
            <Stop offset="100%" stopColor="#fde68a" />
          </LinearGradient>
          <LinearGradient id="ft_bldg2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#e0f2fe" />
            <Stop offset="100%" stopColor="#bae6fd" />
          </LinearGradient>
          {/* Tree foliage */}
          <RadialGradient id="ft_tree" cx="50%" cy="40%" r="55%">
            <Stop offset="0%" stopColor="#4ade80" />
            <Stop offset="60%" stopColor="#16a34a" />
            <Stop offset="100%" stopColor="#14532d" />
          </RadialGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#ft_sky)" />
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#ft_sun)" />

        {/* Sun disc */}
        <Circle cx={pctX(0.50)} cy={pctY(0.13)} r={34} fill="#fffde7" opacity={0.9} />
        <Circle cx={pctX(0.50)} cy={pctY(0.13)} r={48} fill="#ffd600" opacity={0.2} />

        {/* Clouds */}
        <Ellipse cx={pctX(0.15)} cy={pctY(0.18)} rx={55} ry={18} fill="white" opacity={0.75} />
        <Ellipse cx={pctX(0.18)} cy={pctY(0.16)} rx={35} ry={16} fill="white" opacity={0.8} />
        <Ellipse cx={pctX(0.78)} cy={pctY(0.22)} rx={60} ry={16} fill="white" opacity={0.65} />
        <Ellipse cx={pctX(0.82)} cy={pctY(0.20)} rx={38} ry={14} fill="white" opacity={0.7} />

        {/* Distant buildings */}
        {/* Left group */}
        <Rect x={0} y={pctY(0.28)} width={80} height={pctY(0.46)} fill="url(#ft_bldg1)" />
        <Rect x={0} y={pctY(0.28)} width={80} height={3} fill="white" opacity={0.6} />
        <Rect x={10} y={pctY(0.35)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={40} y={pctY(0.35)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={10} y={pctY(0.52)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={40} y={pctY(0.52)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={78} y={pctY(0.35)} width={55} height={pctY(0.39)} fill="url(#ft_bldg2)" />

        {/* Right group */}
        <Rect x={VW - 80} y={pctY(0.28)} width={80} height={pctY(0.46)} fill="url(#ft_bldg1)" />
        <Rect x={VW - 80} y={pctY(0.28)} width={80} height={3} fill="white" opacity={0.6} />
        <Rect x={VW - 60} y={pctY(0.35)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={VW - 30} y={pctY(0.35)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={VW - 60} y={pctY(0.52)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={VW - 30} y={pctY(0.52)} width={20} height={24} rx={3} fill="#93c5fd" opacity={0.8} />
        <Rect x={VW - 130} y={pctY(0.35)} width={52} height={pctY(0.39)} fill="url(#ft_bldg2)" />

        {/* Plaza ground */}
        <Rect x="0" y={pctY(0.72)} width={VW} height={pctY(0.28)} fill="url(#ft_ground)" />
        {/* Plaza tiles */}
        {Array.from({ length: 8 }).map((_, ri) =>
          Array.from({ length: 7 }).map((_, ci) => (
            <Rect
              key={`${ri}-${ci}`}
              x={ci * 56 - 4}
              y={pctY(0.72) + ri * 28}
              width={54}
              height={26}
              rx={2}
              fill={ri % 2 === ci % 2 ? "#d0c8b8" : "#bfb8a8"}
              stroke="#a8a098"
              strokeWidth={0.5}
              opacity={0.7}
            />
          ))
        )}

        {/* Trees — left and right flanking */}
        {/* Left tree */}
        <Rect x={50} y={pctY(0.52)} width={14} height={pctY(0.22)} fill="#5c3d1e" />
        <Circle cx={57} cy={pctY(0.48)} r={42} fill="url(#ft_tree)" opacity={0.95} />
        <Circle cx={38} cy={pctY(0.52)} r={28} fill="url(#ft_tree)" opacity={0.85} />
        <Circle cx={76} cy={pctY(0.52)} r={30} fill="url(#ft_tree)" opacity={0.85} />
        {/* Right tree */}
        <Rect x={326} y={pctY(0.52)} width={14} height={pctY(0.22)} fill="#5c3d1e" />
        <Circle cx={333} cy={pctY(0.48)} r={42} fill="url(#ft_tree)" opacity={0.95} />
        <Circle cx={314} cy={pctY(0.52)} r={28} fill="url(#ft_tree)" opacity={0.85} />
        <Circle cx={352} cy={pctY(0.52)} r={30} fill="url(#ft_tree)" opacity={0.85} />

        {/* ── Fountain ── */}
        {/* Outer basin */}
        <Ellipse cx={pctX(0.5)} cy={pctY(0.76)} rx={100} ry={24} fill="url(#ft_water)" />
        <Ellipse cx={pctX(0.5)} cy={pctY(0.76)} rx={100} ry={24} stroke="#7dd3fc" strokeWidth={2.5} fill="none" opacity={0.6} />
        {/* Basin rim */}
        <Path
          d={`M${pctX(0.5) - 100},${pctY(0.76)} Q${pctX(0.5)},${pctY(0.74)} ${pctX(0.5) + 100},${pctY(0.76)} L${pctX(0.5) + 95},${pctY(0.74)} Q${pctX(0.5)},${pctY(0.715)} ${pctX(0.5) - 95},${pctY(0.74)} Z`}
          fill="url(#ft_marble)"
          opacity={0.9}
        />
        {/* Middle tier */}
        <Ellipse cx={pctX(0.5)} cy={pctY(0.685)} rx={42} ry={10} fill="url(#ft_marble)" />
        <Rect x={pctX(0.5) - 10} y={pctY(0.56)} width={20} height={pctY(0.13)} rx={10} fill="url(#ft_marble)" />
        {/* Top tier cup */}
        <Ellipse cx={pctX(0.5)} cy={pctY(0.565)} rx={28} ry={7} fill="url(#ft_marble)" />
        <Path
          d={`M${pctX(0.5) - 28},${pctY(0.565)} Q${pctX(0.5)},${pctY(0.55)} ${pctX(0.5) + 28},${pctY(0.565)}`}
          stroke="white"
          strokeWidth={1.5}
          fill="none"
          opacity={0.7}
        />
        {/* Top nozzle */}
        <Rect x={pctX(0.5) - 3} y={pctY(0.51)} width={6} height={pctY(0.06)} rx={3} fill="#e2e8f0" />

        {/* Water arcs (static) */}
        {[-60, -35, 35, 60].map((dx, i) => (
          <Path
            key={i}
            d={`M${pctX(0.5)},${pctY(0.51)} Q${pctX(0.5) + dx * 0.6},${pctY(0.42)} ${pctX(0.5) + dx},${pctY(0.68)}`}
            stroke="#7dd3fc"
            strokeWidth={2.5}
            fill="none"
            opacity={0.7}
          />
        ))}

        {/* Ripple rings */}
        <Ellipse cx={pctX(0.5)} cy={pctY(0.76)} rx={60} ry={14} stroke="#93c5fd" strokeWidth={1.5} fill="none" opacity={0.4} />
        <Ellipse cx={pctX(0.5)} cy={pctY(0.76)} rx={80} ry={19} stroke="#7dd3fc" strokeWidth={1} fill="none" opacity={0.25} />

        {/* Bench left */}
        <Rect x={115} y={pctY(0.745)} width={55} height={7} rx={3} fill="#8B6914" opacity={0.8} />
        <Rect x={118} y={pctY(0.752)} width={8} height={14} rx={2} fill="#6b4f10" opacity={0.8} />
        <Rect x={156} y={pctY(0.752)} width={8} height={14} rx={2} fill="#6b4f10" opacity={0.8} />
        {/* Bench right */}
        <Rect x={220} y={pctY(0.745)} width={55} height={7} rx={3} fill="#8B6914" opacity={0.8} />
        <Rect x={223} y={pctY(0.752)} width={8} height={14} rx={2} fill="#6b4f10" opacity={0.8} />
        <Rect x={261} y={pctY(0.752)} width={8} height={14} rx={2} fill="#6b4f10" opacity={0.8} />

        {/* Pigeons (dots on ground) */}
        <Ellipse cx={145} cy={pctY(0.79)} rx={5} ry={3} fill="#9ca3af" opacity={0.7} />
        <Ellipse cx={250} cy={pctY(0.81)} rx={5} ry={3} fill="#9ca3af" opacity={0.7} />
        <Circle cx={145} cy={pctY(0.79) - 5} r={4} fill="#9ca3af" opacity={0.7} />
        <Circle cx={250} cy={pctY(0.81) - 5} r={4} fill="#9ca3af" opacity={0.7} />
      </Svg>

      {/* ── Animated water droplets from fountain top ── */}
      {[
        { left: width * 0.5 - 4, top: height * 0.50, dx: -60, delay: 0,   dur: 1400 },
        { left: width * 0.5 - 4, top: height * 0.50, dx: -36, delay: 250, dur: 1300 },
        { left: width * 0.5 - 4, top: height * 0.50, dx:  36, delay: 500, dur: 1400 },
        { left: width * 0.5 - 4, top: height * 0.50, dx:  60, delay: 750, dur: 1300 },
      ].map((d, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateX: 0, translateY: 0, scale: 1 }}
          animate={{ opacity: [0, 0.9, 0.4, 0], translateX: [0, d.dx * 0.5, d.dx], translateY: [0, -50, 80], scale: [1, 0.7, 0.4] }}
          transition={{ loop: true, duration: d.dur, delay: d.delay, type: "timing" }}
          style={[styles.waterDrop, { left: d.left, top: d.top }]}
        />
      ))}

      {/* ── Expanding ripple rings ── */}
      {[
        { delay: 0,    dur: 3000 },
        { delay: 1000, dur: 3000 },
        { delay: 2000, dur: 3000 },
      ].map((r, i) => (
        <MotiView
          key={`ripple-${i}`}
          from={{ opacity: 0.5, scale: 0.3 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ loop: true, duration: r.dur, delay: r.delay, type: "timing" }}
          style={{
            position: "absolute",
            left: width * 0.5 - 100,
            top: height * 0.748,
            width: 200,
            height: 48,
            borderRadius: 100,
            borderWidth: 2,
            borderColor: "#7dd3fc",
          }}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FARM SCENE — "Golden Farm"
//    Golden-hour sunset, rolling hills, red farmhouse + barn + silo,
//    wheat field in foreground, wooden fence.
//    Ambience: drifting cloud, wheat sway shimmer.
// ─────────────────────────────────────────────────────────────────────────────

export function FarmScene() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.fill}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Sky — harvest golden hour */}
          <LinearGradient id="fm_sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1a0500" />
            <Stop offset="20%" stopColor="#7c2000" />
            <Stop offset="45%" stopColor="#ea580c" />
            <Stop offset="65%" stopColor="#f97316" />
            <Stop offset="80%" stopColor="#fbbf24" />
            <Stop offset="100%" stopColor="#fde68a" />
          </LinearGradient>
          {/* Sun radial */}
          <RadialGradient id="fm_sun" cx="30%" cy="45%" r="30%">
            <Stop offset="0%" stopColor="#fff3a0" stopOpacity="0.95" />
            <Stop offset="35%" stopColor="#fbbf24" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </RadialGradient>
          {/* Hills */}
          <LinearGradient id="fm_hill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3d6b1f" />
            <Stop offset="100%" stopColor="#1a3a09" />
          </LinearGradient>
          {/* Ground */}
          <LinearGradient id="fm_ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#4a7c20" />
            <Stop offset="100%" stopColor="#1e3d0a" />
          </LinearGradient>
          {/* Farmhouse wall */}
          <LinearGradient id="fm_house" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#fef3c7" />
            <Stop offset="100%" stopColor="#fde68a" />
          </LinearGradient>
          {/* Barn */}
          <LinearGradient id="fm_barn" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#b91c1c" />
            <Stop offset="100%" stopColor="#7f1d1d" />
          </LinearGradient>
          {/* Wheat */}
          <LinearGradient id="fm_wheat" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#92400e" />
            <Stop offset="50%" stopColor="#d97706" />
            <Stop offset="100%" stopColor="#fbbf24" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#fm_sky)" />
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#fm_sun)" />

        {/* Sun disc */}
        <Circle cx={pctX(0.30)} cy={pctY(0.45)} r={38} fill="#fff3a0" opacity={0.95} />
        <Circle cx={pctX(0.30)} cy={pctY(0.45)} r={56} fill="#fbbf24" opacity={0.22} />
        <Circle cx={pctX(0.30)} cy={pctY(0.45)} r={72} fill="#f97316" opacity={0.12} />

        {/* Rolling hills far */}
        <Path
          d={`M0,${pctY(0.60)} Q60,${pctY(0.50)} 130,${pctY(0.56)} Q200,${pctY(0.48)} 260,${pctY(0.54)} Q320,${pctY(0.44)} 390,${pctY(0.52)} L390,${VH} L0,${VH} Z`}
          fill="url(#fm_hill)"
          opacity={0.6}
        />
        {/* Mid hills */}
        <Path
          d={`M0,${pctY(0.66)} Q80,${pctY(0.58)} 160,${pctY(0.64)} Q240,${pctY(0.56)} 320,${pctY(0.62)} Q360,${pctY(0.60)} 390,${pctY(0.62)} L390,${VH} L0,${VH} Z`}
          fill="#2d5a12"
          opacity={0.7}
        />

        {/* Ground */}
        <Rect x="0" y={pctY(0.72)} width={VW} height={pctY(0.28)} fill="url(#fm_ground)" />
        {/* Grass texture lines */}
        {[0.73, 0.76, 0.79, 0.82].map((y, i) => (
          <Path
            key={i}
            d={`M0,${pctY(y)} Q${VW * 0.25},${pctY(y) - 4} ${VW * 0.5},${pctY(y)} Q${VW * 0.75},${pctY(y) + 3} ${VW},${pctY(y)}`}
            stroke="#3d6b1f"
            strokeWidth={1.5}
            fill="none"
            opacity={0.4}
          />
        ))}

        {/* ── Farmhouse ── */}
        {/* House body */}
        <Rect x={140} y={pctY(0.44)} width={120} height={pctY(0.29)} fill="url(#fm_house)" />
        {/* Roof */}
        <Polygon
          points={`130,${pctY(0.44)} 200,${pctY(0.28)} 270,${pctY(0.44)}`}
          fill="#7f1d1d"
        />
        <Polygon
          points={`130,${pctY(0.44)} 200,${pctY(0.28)} 270,${pctY(0.44)}`}
          stroke="#5a1010"
          strokeWidth={2}
          fill="none"
        />
        {/* Chimney */}
        <Rect x={228} y={pctY(0.29)} width={14} height={pctY(0.08)} rx={2} fill="#6b2020" />
        <Rect x={225} y={pctY(0.29)} width={20} height={7} rx={2} fill="#5a1010" />
        {/* Windows */}
        <Rect x={153} y={pctY(0.515)} width={34} height={34} rx={3} fill="#93c5fd" opacity={0.85} />
        <Line x1={170} y1={pctY(0.515)} x2={170} y2={pctY(0.515) + 34} stroke="#60a5fa" strokeWidth={1.5} />
        <Line x1={153} y1={pctY(0.515) + 17} x2={187} y2={pctY(0.515) + 17} stroke="#60a5fa" strokeWidth={1.5} />
        <Rect x={213} y={pctY(0.515)} width={34} height={34} rx={3} fill="#93c5fd" opacity={0.85} />
        <Line x1={230} y1={pctY(0.515)} x2={230} y2={pctY(0.515) + 34} stroke="#60a5fa" strokeWidth={1.5} />
        <Line x1={213} y1={pctY(0.515) + 17} x2={247} y2={pctY(0.515) + 17} stroke="#60a5fa" strokeWidth={1.5} />
        {/* Door */}
        <Rect x={183} y={pctY(0.62)} width={34} height={pctY(0.105)} rx={3} fill="#92400e" />
        <Circle cx={212} cy={pctY(0.675)} r={3} fill="#fde68a" />

        {/* ── Barn ── */}
        <Rect x={275} y={pctY(0.50)} width={95} height={pctY(0.23)} fill="url(#fm_barn)" />
        <Polygon
          points={`268,${pctY(0.50)} 322,${pctY(0.37)} 377,${pctY(0.50)}`}
          fill="#991b1b"
        />
        {/* Barn X pattern */}
        <Line x1={275} y1={pctY(0.50)} x2={370} y2={pctY(0.73)} stroke="#7f1d1d" strokeWidth={3} opacity={0.5} />
        <Line x1={370} y1={pctY(0.50)} x2={275} y2={pctY(0.73)} stroke="#7f1d1d" strokeWidth={3} opacity={0.5} />
        <Rect x={308} y={pctY(0.56)} width={28} height={pctY(0.17)} rx={3} fill="#5a1010" />

        {/* ── Silo ── */}
        <Rect x={366} y={pctY(0.45)} width={28} height={pctY(0.28)} rx={14} fill="#cbd5e1" />
        <Ellipse cx={380} cy={pctY(0.45)} rx={14} ry={8} fill="#94a3b8" />
        <Ellipse cx={380} cy={pctY(0.43)} rx={14} ry={7} fill="#e2e8f0" />

        {/* ── Wooden fence ── */}
        {Array.from({ length: 18 }).map((_, i) => (
          <G key={i}>
            <Rect
              x={i * 22}
              y={pctY(0.72) - 24}
              width={8}
              height={30}
              rx={2}
              fill="#92400e"
              opacity={0.85}
            />
            <Path
              d={`M${i * 22 + 4},${pctY(0.72) - 32} L${i * 22},${pctY(0.72) - 24} L${i * 22 + 8},${pctY(0.72) - 24} Z`}
              fill="#7c3500"
            />
          </G>
        ))}
        {/* Fence rails */}
        <Rect x={0} y={pctY(0.72) - 14} width={VW} height={5} rx={2} fill="#7c3500" opacity={0.7} />
        <Rect x={0} y={pctY(0.72) - 5} width={VW} height={5} rx={2} fill="#7c3500" opacity={0.7} />

        {/* ── Wheat field foreground ── */}
        {Array.from({ length: 32 }).map((_, i) => {
          const stalkX = i * 12 + 6;
          const stalkBase = pctY(0.93);
          const stalkTop = pctY(0.76);
          return (
            <G key={i}>
              <Line x1={stalkX} y1={stalkBase} x2={stalkX + (i % 3 - 1) * 4} y2={stalkTop} stroke="url(#fm_wheat)" strokeWidth={2.5} />
              <Ellipse cx={stalkX + (i % 3 - 1) * 4} cy={stalkTop} rx={4} ry={10} fill="#d97706" opacity={0.9} />
            </G>
          );
        })}

        {/* Crows on fence */}
        <Path d={`M80,${pctY(0.72) - 34} Q85,${pctY(0.72) - 42} 90,${pctY(0.72) - 34}`} stroke="#1f2937" strokeWidth={2} fill="none" />
        <Circle cx={85} cy={pctY(0.72) - 36} r={4} fill="#1f2937" />
        <Path d={`M250,${pctY(0.72) - 34} Q255,${pctY(0.72) - 42} 260,${pctY(0.72) - 34}`} stroke="#1f2937" strokeWidth={2} fill="none" />
        <Circle cx={255} cy={pctY(0.72) - 36} r={4} fill="#1f2937" />
      </Svg>

      {/* ── Drifting cloud ── */}
      <MotiView
        from={{ translateX: -120 }}
        animate={{ translateX: width + 60 }}
        transition={{ loop: true, duration: 18000, type: "timing" }}
        style={{ position: "absolute", top: height * 0.15 }}
      >
        <View style={styles.cloudGroup}>
          <View style={[styles.cloudPuff, { width: 90, height: 30, top: 10 }]} />
          <View style={[styles.cloudPuff, { width: 60, height: 34, top: 0, left: 20 }]} />
          <View style={[styles.cloudPuff, { width: 50, height: 26, top: 8, left: 56 }]} />
        </View>
      </MotiView>

      {/* ── Wheat shimmer overlay (subtle golden pulse) ── */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: [0, 0.12, 0] }}
        transition={{ loop: true, duration: 3500, type: "timing" }}
        style={{
          position: "absolute",
          left: 0,
          top: height * 0.76,
          width: width,
          height: height * 0.20,
          backgroundColor: "#fbbf24",
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. FOREST SCENE — "Ancient Forest"
//    Cool purple-indigo dusk, towering ancient trees, moon + stars,
//    mushrooms, mossy forest floor.
//    Ambience: floating fireflies, drifting leaf.
// ─────────────────────────────────────────────────────────────────────────────

export function ForestScene() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.fill}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Sky — deep dusk */}
          <LinearGradient id="fo_sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#050014" />
            <Stop offset="30%" stopColor="#1e1b4b" />
            <Stop offset="55%" stopColor="#312e81" />
            <Stop offset="75%" stopColor="#4338ca" />
            <Stop offset="100%" stopColor="#6366f1" />
          </LinearGradient>
          {/* Moon glow */}
          <RadialGradient id="fo_moon" cx="72%" cy="22%" r="18%">
            <Stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
            <Stop offset="40%" stopColor="#c7d2fe" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </RadialGradient>
          {/* Tree trunk */}
          <LinearGradient id="fo_trunk" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#1a0a00" />
            <Stop offset="40%" stopColor="#3d1f00" />
            <Stop offset="100%" stopColor="#1a0a00" />
          </LinearGradient>
          {/* Canopy */}
          <RadialGradient id="fo_canopy" cx="50%" cy="60%" r="55%">
            <Stop offset="0%" stopColor="#166534" />
            <Stop offset="55%" stopColor="#14532d" />
            <Stop offset="100%" stopColor="#052e16" />
          </RadialGradient>
          {/* Ground */}
          <LinearGradient id="fo_ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1c3d10" />
            <Stop offset="100%" stopColor="#071a03" />
          </LinearGradient>
          {/* Moss glow */}
          <RadialGradient id="fo_moss" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#fo_sky)" />
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#fo_moon)" />

        {/* Stars */}
        {[
          [30, 50], [75, 30], [120, 70], [175, 40], [220, 20], [260, 60],
          [310, 35], [355, 55], [50, 100], [140, 90], [290, 80], [160, 110],
          [340, 100], [200, 130], [80, 140], [250, 120],
        ].map(([sx, sy], i) => (
          <Circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity={0.5 + (i % 4) * 0.12} />
        ))}

        {/* Moon */}
        <Circle cx={pctX(0.72)} cy={pctY(0.12)} r={32} fill="#e2e8f0" opacity={0.95} />
        <Circle cx={pctX(0.72) + 10} cy={pctY(0.12) - 6} r={26} fill="#312e81" opacity={0.2} />
        {/* Moon craters */}
        <Circle cx={pctX(0.72) - 8} cy={pctY(0.12) + 6} r={5} fill="#c7d2fe" opacity={0.35} />
        <Circle cx={pctX(0.72) + 12} cy={pctY(0.12) + 10} r={3} fill="#c7d2fe" opacity={0.3} />

        {/* Ground */}
        <Rect x="0" y={pctY(0.70)} width={VW} height={pctY(0.30)} fill="url(#fo_ground)" />

        {/* Ground roots / moss patches */}
        <Ellipse cx={pctX(0.25)} cy={pctY(0.75)} rx={40} ry={10} fill="url(#fo_moss)" />
        <Ellipse cx={pctX(0.65)} cy={pctY(0.78)} rx={35} ry={9} fill="url(#fo_moss)" />
        <Ellipse cx={pctX(0.10)} cy={pctY(0.80)} rx={25} ry={7} fill="url(#fo_moss)" />
        <Ellipse cx={pctX(0.85)} cy={pctY(0.77)} rx={30} ry={8} fill="url(#fo_moss)" />

        {/* ── Background trees (silhouette) ── */}
        {[10, 70, 130, 200, 270, 330].map((tx, i) => (
          <G key={i}>
            <Rect x={tx + 10} y={pctY(0.35 - i * 0.01)} width={10} height={pctY(0.38)} fill="#0f0500" opacity={0.6} />
            <Path
              d={`M${tx},${pctY(0.35 - i * 0.01)} Q${tx + 15},${pctY(0.12)} ${tx + 30},${pctY(0.35 - i * 0.01)}`}
              fill="#052e16"
              opacity={0.5}
            />
          </G>
        ))}

        {/* ── Main foreground trees (rich, layered) ── */}
        {/* Left tall tree */}
        <Rect x={30} y={pctY(0.18)} width={26} height={pctY(0.52)} fill="url(#fo_trunk)" />
        {/* Bark detail */}
        <Line x1={38} y1={pctY(0.20)} x2={36} y2={pctY(0.50)} stroke="#0f0500" strokeWidth={2} opacity={0.5} />
        <Line x1={48} y1={pctY(0.22)} x2={50} y2={pctY(0.55)} stroke="#0f0500" strokeWidth={1.5} opacity={0.4} />
        {/* Canopy layers */}
        <Ellipse cx={43} cy={pctY(0.24)} rx={62} ry={42} fill="url(#fo_canopy)" opacity={0.95} />
        <Ellipse cx={22} cy={pctY(0.30)} rx={44} ry={32} fill="url(#fo_canopy)" opacity={0.9} />
        <Ellipse cx={68} cy={pctY(0.28)} rx={40} ry={30} fill="url(#fo_canopy)" opacity={0.85} />
        <Ellipse cx={43} cy={pctY(0.18)} rx={48} ry={28} fill="#166534" opacity={0.7} />
        {/* Root sprawl */}
        <Path d={`M30,${pctY(0.70)} Q10,${pctY(0.68)} 0,${pctY(0.72)}`} stroke="#1a0a00" strokeWidth={8} fill="none" opacity={0.7} />
        <Path d={`M56,${pctY(0.70)} Q70,${pctY(0.68)} 80,${pctY(0.73)}`} stroke="#1a0a00" strokeWidth={6} fill="none" opacity={0.7} />

        {/* Right tall tree */}
        <Rect x={334} y={pctY(0.20)} width={26} height={pctY(0.50)} fill="url(#fo_trunk)" />
        <Line x1={342} y1={pctY(0.22)} x2={340} y2={pctY(0.52)} stroke="#0f0500" strokeWidth={2} opacity={0.5} />
        <Ellipse cx={347} cy={pctY(0.26)} rx={60} ry={40} fill="url(#fo_canopy)" opacity={0.95} />
        <Ellipse cx={326} cy={pctY(0.32)} rx={42} ry={30} fill="url(#fo_canopy)" opacity={0.9} />
        <Ellipse cx={368} cy={pctY(0.30)} rx={38} ry={28} fill="url(#fo_canopy)" opacity={0.85} />
        <Ellipse cx={347} cy={pctY(0.20)} rx={46} ry={26} fill="#166534" opacity={0.7} />
        <Path d={`M334,${pctY(0.70)} Q314,${pctY(0.68)} 304,${pctY(0.73)}`} stroke="#1a0a00" strokeWidth={8} fill="none" opacity={0.7} />
        <Path d={`M360,${pctY(0.70)} Q380,${pctY(0.68)} 390,${pctY(0.72)}`} stroke="#1a0a00" strokeWidth={6} fill="none" opacity={0.7} />

        {/* Mid-ground tree */}
        <Rect x={185} y={pctY(0.30)} width={20} height={pctY(0.40)} fill="url(#fo_trunk)" opacity={0.8} />
        <Ellipse cx={195} cy={pctY(0.33)} rx={50} ry={36} fill="url(#fo_canopy)" opacity={0.8} />
        <Ellipse cx={178} cy={pctY(0.38)} rx={34} ry={24} fill="url(#fo_canopy)" opacity={0.75} />
        <Ellipse cx={212} cy={pctY(0.37)} rx={32} ry={22} fill="url(#fo_canopy)" opacity={0.75} />

        {/* Mushrooms */}
        {[
          { cx: 100, cy: pctY(0.72), rx: 14, ry: 8, color: "#dc2626" },
          { cx: 112, cy: pctY(0.74), rx: 10, ry: 6, color: "#ef4444" },
          { cx: 270, cy: pctY(0.73), rx: 12, ry: 7, color: "#dc2626" },
          { cx: 280, cy: pctY(0.75), rx: 9,  ry: 5, color: "#b91c1c" },
        ].map((m, i) => (
          <G key={i}>
            <Rect x={m.cx - 3} y={m.cy} width={6} height={12} rx={3} fill="#f5f5f5" />
            <Ellipse cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill={m.color} />
            <Ellipse cx={m.cx} cy={m.cy} rx={m.rx * 0.55} ry={m.ry * 0.5} fill="white" opacity={0.4} />
          </G>
        ))}

        {/* Ferns */}
        {[130, 145, 155, 230, 245, 258].map((fx, i) => (
          <Path
            key={i}
            d={`M${fx},${pctY(0.73)} Q${fx - 14},${pctY(0.67)} ${fx - 22},${pctY(0.70)}`}
            stroke="#16a34a"
            strokeWidth={2.5}
            fill="none"
            opacity={0.8}
          />
        ))}

        {/* Atmospheric mist at ground */}
        <Rect x="0" y={pctY(0.68)} width={VW} height={pctY(0.06)} fill="#312e81" opacity={0.18} />
      </Svg>

      {/* ── Fireflies ── */}
      {[
        { left: width * 0.15, top: height * 0.50, delay: 0,    dur: 4000 },
        { left: width * 0.30, top: height * 0.42, delay: 700,  dur: 3500 },
        { left: width * 0.55, top: height * 0.55, delay: 1400, dur: 4200 },
        { left: width * 0.70, top: height * 0.45, delay: 600,  dur: 3800 },
        { left: width * 0.85, top: height * 0.52, delay: 1100, dur: 4100 },
        { left: width * 0.42, top: height * 0.62, delay: 300,  dur: 3700 },
        { left: width * 0.62, top: height * 0.65, delay: 900,  dur: 4300 },
      ].map((f, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 0 }}
          animate={{ opacity: [0, 0.9, 0.6, 0], translateY: [0, -16, -8, -22] }}
          transition={{ loop: true, duration: f.dur, delay: f.delay, type: "timing" }}
          style={[styles.firefly, { left: f.left, top: f.top }]}
        />
      ))}

      {/* ── Drifting leaf ── */}
      {[
        { left: width * 0.35, startTop: height * 0.20, delay: 0,    dur: 8000 },
        { left: width * 0.65, startTop: height * 0.15, delay: 3500, dur: 9000 },
      ].map((l, i) => (
        <MotiView
          key={`leaf-${i}`}
          from={{ translateY: 0, translateX: 0, rotate: "0deg", opacity: 0.8 }}
          animate={{ translateY: height * 0.55, translateX: 30 * (i % 2 === 0 ? 1 : -1), rotate: i % 2 === 0 ? "360deg" : "-360deg", opacity: 0 }}
          transition={{ loop: true, duration: l.dur, delay: l.delay, type: "timing" }}
          style={[styles.leaf, { left: l.left, top: l.startTop }]}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. JUNGLE SCENE — "Jungle Temple"
//    Deep emerald green, dense canopy overhead, ancient stone temple ruins,
//    hanging vines, ferns, sun shafts piercing the canopy.
//    Ambience: vine sway, sun shaft pulse, distant bird.
// ─────────────────────────────────────────────────────────────────────────────

export function JungleScene() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.fill}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Sky visible through canopy gap */}
          <LinearGradient id="jg_sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#022c22" />
            <Stop offset="30%" stopColor="#064e3b" />
            <Stop offset="60%" stopColor="#065f46" />
            <Stop offset="85%" stopColor="#059669" />
            <Stop offset="100%" stopColor="#34d399" />
          </LinearGradient>
          {/* Ground */}
          <LinearGradient id="jg_ground" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#14532d" />
            <Stop offset="100%" stopColor="#052e16" />
          </LinearGradient>
          {/* Temple stone */}
          <LinearGradient id="jg_stone" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#6b7280" />
            <Stop offset="100%" stopColor="#374151" />
          </LinearGradient>
          {/* Sun shaft */}
          <LinearGradient id="jg_shaft" x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0%" stopColor="#fde68a" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </LinearGradient>
          {/* Vine */}
          <LinearGradient id="jg_vine" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#166534" />
            <Stop offset="100%" stopColor="#14532d" />
          </LinearGradient>
          {/* Canopy foliage */}
          <LinearGradient id="jg_canopy" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#14532d" />
            <Stop offset="60%" stopColor="#166534" />
            <Stop offset="100%" stopColor="#16a34a" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect x="0" y="0" width={VW} height={VH} fill="url(#jg_sky)" />

        {/* Sun shafts through canopy */}
        <Path
          d={`M${pctX(0.38)},0 L${pctX(0.28)},${pctY(0.65)} L${pctX(0.46)},${pctY(0.65)} Z`}
          fill="url(#jg_shaft)"
        />
        <Path
          d={`M${pctX(0.60)},0 L${pctX(0.52)},${pctY(0.55)} L${pctX(0.68)},${pctY(0.55)} Z`}
          fill="url(#jg_shaft)"
          opacity={0.7}
        />
        <Path
          d={`M${pctX(0.20)},0 L${pctX(0.12)},${pctY(0.50)} L${pctX(0.28)},${pctY(0.50)} Z`}
          fill="url(#jg_shaft)"
          opacity={0.5}
        />

        {/* Ground */}
        <Rect x="0" y={pctY(0.72)} width={VW} height={pctY(0.28)} fill="url(#jg_ground)" />

        {/* Ground texture — mossy patches */}
        {[
          [40, 0.74, 30, 8],
          [120, 0.76, 25, 7],
          [220, 0.73, 35, 9],
          [310, 0.75, 28, 8],
          [80, 0.82, 20, 6],
          [260, 0.80, 22, 7],
          [160, 0.85, 18, 5],
        ].map(([x, yPct, rx, ry], i) => (
          <Ellipse key={i} cx={x as number} cy={pctY(yPct as number)} rx={rx as number} ry={ry as number} fill="#16a34a" opacity={0.45} />
        ))}

        {/* ── Temple / stone ruins ── */}
        {/* Main temple body */}
        <Rect x={120} y={pctY(0.40)} width={150} height={pctY(0.32)} fill="url(#jg_stone)" />
        {/* Temple steps */}
        <Rect x={108} y={pctY(0.59)} width={174} height={pctY(0.06)} fill="#4b5563" />
        <Rect x={116} y={pctY(0.55)} width={158} height={pctY(0.05)} fill="#4b5563" />
        {/* Columns */}
        {[130, 170, 210, 250].map((cx, i) => (
          <G key={i}>
            <Rect x={cx} y={pctY(0.37)} width={16} height={pctY(0.25)} fill="#6b7280" />
            {/* Column fluting */}
            <Line x1={cx + 5} y1={pctY(0.37)} x2={cx + 5} y2={pctY(0.62)} stroke="#9ca3af" strokeWidth={1} opacity={0.4} />
            <Line x1={cx + 10} y1={pctY(0.37)} x2={cx + 10} y2={pctY(0.62)} stroke="#9ca3af" strokeWidth={1} opacity={0.4} />
            {/* Capital */}
            <Rect x={cx - 2} y={pctY(0.37)} width={20} height={8} rx={2} fill="#9ca3af" />
          </G>
        ))}
        {/* Temple roof / pediment */}
        <Rect x={110} y={pctY(0.35)} width={170} height={14} fill="#6b7280" />
        <Polygon
          points={`110,${pctY(0.35)} 195,${pctY(0.27)} 280,${pctY(0.35)}`}
          fill="#4b5563"
        />
        {/* Temple entrance dark arch */}
        <Path
          d={`M170,${pctY(0.59)} L170,${pctY(0.46)} Q195,${pctY(0.40)} 220,${pctY(0.46)} L220,${pctY(0.59)} Z`}
          fill="#111827"
        />
        {/* Carved relief lines on temple */}
        <Line x1={120} y1={pctY(0.44)} x2={270} y2={pctY(0.44)} stroke="#9ca3af" strokeWidth={1} opacity={0.35} />
        <Line x1={120} y1={pctY(0.50)} x2={270} y2={pctY(0.50)} stroke="#9ca3af" strokeWidth={1} opacity={0.35} />
        {/* Moss on temple */}
        <Rect x={120} y={pctY(0.40)} width={150} height={5} fill="#166534" opacity={0.5} />
        <Rect x={120} y={pctY(0.55)} width={60} height={4} fill="#16a34a" opacity={0.4} />
        <Rect x={230} y={pctY(0.53)} width={40} height={4} fill="#16a34a" opacity={0.4} />

        {/* ── Side ruins / stone blocks ── */}
        <Rect x={0} y={pctY(0.56)} width={85} height={pctY(0.16)} fill="#4b5563" rx={2} />
        <Rect x={0} y={pctY(0.50)} width={60} height={pctY(0.08)} fill="#6b7280" rx={2} />
        <Rect x={20} y={pctY(0.63)} width={40} height={pctY(0.05)} fill="#374151" rx={2} />
        <Rect x={305} y={pctY(0.56)} width={85} height={pctY(0.16)} fill="#4b5563" rx={2} />
        <Rect x={330} y={pctY(0.50)} width={60} height={pctY(0.08)} fill="#6b7280" rx={2} />

        {/* ── Vines hanging from top ── */}
        {[18, 55, 95, 300, 342, 375].map((vx, i) => (
          <G key={i}>
            <Path
              d={`M${vx},0 Q${vx + 8},${pctY(0.25)} ${vx - 4},${pctY(0.45)} Q${vx + 6},${pctY(0.60)} ${vx},${pctY(0.68)}`}
              stroke="url(#jg_vine)"
              strokeWidth={3}
              fill="none"
            />
            {/* Leaf clusters on vines */}
            <Ellipse cx={vx + 5} cy={pctY(0.18)} rx={9} ry={6} fill="#22c55e" opacity={0.8} />
            <Ellipse cx={vx - 3} cy={pctY(0.35)} rx={8} ry={5} fill="#16a34a" opacity={0.8} />
            <Ellipse cx={vx + 4} cy={pctY(0.52)} rx={7} ry={5} fill="#22c55e" opacity={0.75} />
          </G>
        ))}

        {/* ── Dense canopy overhead ── */}
        {/* Far canopy layer */}
        <Path
          d={`M0,${pctY(0.08)} Q30,${pctY(0.02)} 60,${pctY(0.06)} Q90,${pctY(0.00)} 120,${pctY(0.05)} Q150,${pctY(0.01)} 180,${pctY(0.06)} Q210,${pctY(0.00)} 240,${pctY(0.05)} Q270,${pctY(0.02)} 300,${pctY(0.07)} Q330,${pctY(0.01)} 360,${pctY(0.06)} Q380,${pctY(0.03)} ${VW},${pctY(0.08)} L${VW},0 L0,0 Z`}
          fill="url(#jg_canopy)"
        />
        {/* Mid canopy */}
        <Path
          d={`M0,${pctY(0.16)} Q25,${pctY(0.08)} 55,${pctY(0.14)} Q80,${pctY(0.06)} 110,${pctY(0.13)} Q140,${pctY(0.09)} 160,${pctY(0.15)} Q185,${pctY(0.05)} 215,${pctY(0.13)} Q245,${pctY(0.08)} 270,${pctY(0.16)} Q300,${pctY(0.05)} 330,${pctY(0.14)} Q360,${pctY(0.08)} ${VW},${pctY(0.16)} L${VW},0 L0,0 Z`}
          fill="#14532d"
          opacity={0.9}
        />
        {/* Near canopy */}
        <Path
          d={`M0,${pctY(0.22)} Q20,${pctY(0.14)} 50,${pctY(0.20)} Q75,${pctY(0.12)} 100,${pctY(0.19)} Q130,${pctY(0.14)} 155,${pctY(0.21)} Q175,${pctY(0.11)} 200,${pctY(0.20)} Q230,${pctY(0.14)} 255,${pctY(0.22)} Q275,${pctY(0.12)} 305,${pctY(0.20)} Q330,${pctY(0.14)} 355,${pctY(0.22)} Q375,${pctY(0.14)} ${VW},${pctY(0.22)} L${VW},0 L0,0 Z`}
          fill="#166534"
          opacity={0.85}
        />

        {/* ── Ferns at ground level ── */}
        {[
          [10, pctY(0.73)], [40, pctY(0.74)], [320, pctY(0.73)], [355, pctY(0.74)],
          [100, pctY(0.74)], [270, pctY(0.75)], [180, pctY(0.74)],
        ].map(([fx, fy], i) => (
          <G key={i}>
            <Path d={`M${fx},${fy} Q${fx - 18},${fy - 28} ${fx - 28},${fy - 22}`} stroke="#16a34a" strokeWidth={2.5} fill="none" />
            <Path d={`M${fx},${fy} Q${fx + 18},${fy - 28} ${fx + 28},${fy - 22}`} stroke="#22c55e" strokeWidth={2.5} fill="none" />
            <Path d={`M${fx},${fy} Q${fx},${fy - 32} ${fx - 6},${fy - 36}`} stroke="#16a34a" strokeWidth={2} fill="none" />
          </G>
        ))}

        {/* Atmospheric depth haze */}
        <Rect x="0" y={pctY(0.60)} width={VW} height={pctY(0.15)} fill="#064e3b" opacity={0.25} />
      </Svg>

      {/* ── Vine sway (left cluster) ── */}
      <MotiView
        from={{ rotate: "0deg" }}
        animate={{ rotate: ["0deg", "4deg", "0deg", "-4deg", "0deg"] }}
        transition={{ loop: true, duration: 5000, type: "timing" }}
        style={{ position: "absolute", left: 0, top: 0, transformOrigin: "top center" }}
      >
        <View style={{ width: 80, height: height * 0.70, opacity: 0 }} />
      </MotiView>

      {/* ── Sun shaft pulse ── */}
      {[
        { left: width * 0.25, top: 0, w: width * 0.22, h: height * 0.65, delay: 0,    dur: 5000 },
        { left: width * 0.50, top: 0, w: width * 0.18, h: height * 0.55, delay: 2000, dur: 6000 },
      ].map((s, i) => (
        <MotiView
          key={`shaft-${i}`}
          from={{ opacity: 0.06 }}
          animate={{ opacity: [0.06, 0.22, 0.06] }}
          transition={{ loop: true, duration: s.dur, delay: s.delay, type: "timing" }}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.w,
            height: s.h,
            backgroundColor: "#fde68a",
            transform: [{ skewX: "8deg" }],
          }}
          pointerEvents="none"
        />
      ))}

      {/* ── Distant bird silhouette ── */}
      <MotiView
        from={{ translateX: -40, opacity: 0 }}
        animate={{ translateX: [width * -0.1, width * 1.1], opacity: [0, 1, 1, 0] }}
        transition={{ loop: true, duration: 14000, delay: 3000, type: "timing" }}
        style={{ position: "absolute", top: height * 0.30 }}
      >
        <View style={styles.birdSilhouette} />
      </MotiView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },

  // Bakery
  smokePuff: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(220,210,200,0.75)",
  },

  // Fountain
  waterDrop: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#7dd3fc",
  },

  // Farm
  cloudGroup: { flexDirection: "row", position: "relative" },
  cloudPuff: {
    position: "absolute",
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.78)",
  },

  // Forest
  firefly: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fde68a",
    shadowColor: "#fde68a",
    shadowRadius: 6,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  leaf: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#16a34a",
    transform: [{ rotate: "35deg" }],
  },

  // Jungle
  birdSilhouette: {
    width: 24,
    height: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "#052e16",
    opacity: 0.7,
  },
});
