/**
 * MapAmbient — per-zone looping ambient animations.
 * Bakery: chimney smoke. Fountain: water droplets. Forest: falling leaves.
 * Farm: swooping birds. Jungle: firefly glows.
 * All use Moti loop animations and render at fixed canvas positions.
 */
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { MotiView } from "moti";

// ─────────────────────────────────────────────────────────────────────────────
// Bakery — chimney smoke puffs (3 chimneys)
// ─────────────────────────────────────────────────────────────────────────────
const SMOKE_PUFFS = [
  { x: 109, baseY: 1726, delay: 0,    dur: 3000 },
  { x: 110, baseY: 1728, delay: 500,  dur: 3200 },
  { x: 111, baseY: 1730, delay: 1000, dur: 2800 },
];

function BakerySmoke() {
  return (
    <>
      {SMOKE_PUFFS.map((p, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.55, 0.3, 0], translateY: [-30, -60, -95], scale: [0.5, 1.2, 1.8] }}
          transition={{ loop: true, duration: p.dur, delay: p.delay, type: "timing" }}
          style={[styles.smokePuff, { left: p.x, top: p.baseY }]}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fountain — water drop particles
// ─────────────────────────────────────────────────────────────────────────────
const WATER_DROPS = [
  { x: 172, y: 1160, delay: 0,   dur: 900 },
  { x: 185, y: 1155, delay: 120, dur: 950 },
  { x: 198, y: 1162, delay: 240, dur: 870 },
  { x: 210, y: 1158, delay: 360, dur: 1000 },
  { x: 175, y: 1168, delay: 480, dur: 920 },
  { x: 205, y: 1165, delay: 600, dur: 880 },
];

function FountainDrops() {
  return (
    <>
      {WATER_DROPS.map((d, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.8, 0], translateY: [0, 40, 80], scale: [0.6, 0.9, 0.3] }}
          transition={{ loop: true, duration: d.dur, delay: d.delay, type: "timing" }}
          style={[styles.waterDrop, { left: d.x, top: d.y }]}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Forest — falling leaves
// ─────────────────────────────────────────────────────────────────────────────
const LEAVES = [
  { x: 38,  startY: 680, dur: 4200, delay: 0,    dx: 20,  color: "#16a34a" },
  { x: 80,  startY: 720, dur: 3800, delay: 600,  dx: -15, color: "#15803d" },
  { x: 135, startY: 695, dur: 4500, delay: 1200, dx: 25,  color: "#4ade80" },
  { x: 200, startY: 710, dur: 3600, delay: 300,  dx: -20, color: "#22c55e" },
  { x: 260, startY: 688, dur: 4100, delay: 900,  dx: 18,  color: "#166534" },
  { x: 325, startY: 700, dur: 3900, delay: 1500, dx: -12, color: "#4ade80" },
];

function ForestLeaves() {
  return (
    <>
      {LEAVES.map((l, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 0, translateX: 0, rotate: "0deg" }}
          animate={{
            opacity: [0, 0.8, 0.7, 0],
            translateY: [0, 120, 250, 380],
            translateX: [0, l.dx, l.dx * 0.5, l.dx * 1.5],
            rotate: ["0deg", "120deg", "240deg", "360deg"],
          }}
          transition={{ loop: true, duration: l.dur, delay: l.delay, type: "timing" }}
          style={[styles.leaf, { left: l.x, top: l.startY, backgroundColor: l.color }]}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Farm — birds sweeping across sky
// ─────────────────────────────────────────────────────────────────────────────
const BIRDS = [
  { startX: -30, y: 360, dur: 7000, delay: 0,    size: 10 },
  { startX: -30, y: 385, dur: 7800, delay: 1200, size: 8  },
  { startX: -30, y: 372, dur: 7400, delay: 600,  size: 9  },
  { startX: 420, y: 420, dur: 8000, delay: 2000, size: 8  }, // right-to-left
];

function FarmBirds() {
  return (
    <>
      {BIRDS.map((b, i) => {
        const toLeft = b.startX > 200;
        return (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: toLeft ? 50 : -50 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], translateX: toLeft ? -460 : 460 }}
            transition={{ loop: true, duration: b.dur, delay: b.delay, type: "timing" }}
            style={[styles.birdGroup, { left: b.startX, top: b.y }]}
          >
            {/* Simple bird V shape */}
            <MotiView
              animate={{ rotate: ["0deg", "8deg", "0deg", "-8deg", "0deg"] }}
              transition={{ loop: true, duration: 600, type: "timing" }}
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <View style={[styles.wing, { width: b.size, height: b.size * 0.5 }]} />
              <View style={[styles.wingR, { width: b.size, height: b.size * 0.5 }]} />
            </MotiView>
          </MotiView>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Jungle — firefly glow pulses
// ─────────────────────────────────────────────────────────────────────────────
const FIREFLIES = [
  { x: 28,  y: 55,  dur: 2200, delay: 0,    color: "#fde68a", r: 4 },
  { x: 88,  y: 165, dur: 2600, delay: 400,  color: "#a78bfa", r: 3 },
  { x: 145, y: 95,  dur: 1900, delay: 800,  color: "#86efac", r: 3.5 },
  { x: 220, y: 188, dur: 2400, delay: 200,  color: "#fde68a", r: 4 },
  { x: 285, y: 70,  dur: 2100, delay: 600,  color: "#c4b5fd", r: 3 },
  { x: 345, y: 148, dur: 2700, delay: 1000, color: "#6ee7b7", r: 3.5 },
  { x: 60,  y: 225, dur: 1800, delay: 300,  color: "#fbbf24", r: 2.5 },
  { x: 195, y: 248, dur: 2300, delay: 900,  color: "#a78bfa", r: 3 },
  { x: 318, y: 215, dur: 2000, delay: 500,  color: "#86efac", r: 2.5 },
];

function JungleFireflies() {
  return (
    <>
      {FIREFLIES.map((f, i) => (
        <MotiView
          key={i}
          animate={{
            opacity: [0.1, 0.9, 0.1],
            scale: [0.6, 1.4, 0.6],
            translateX: [0, 6, -4, 0],
            translateY: [0, -5, 3, 0],
          }}
          transition={{ loop: true, duration: f.dur, delay: f.delay, type: "timing" }}
          style={[
            styles.firefly,
            {
              left: f.x,
              top: f.y,
              width: f.r * 2,
              height: f.r * 2,
              borderRadius: f.r,
              backgroundColor: f.color,
              shadowColor: f.color,
            },
          ]}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export const MapAmbient = memo(function MapAmbient() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BakerySmoke />
      <FountainDrops />
      <ForestLeaves />
      <FarmBirds />
      <JungleFireflies />
    </View>
  );
});

const styles = StyleSheet.create({
  smokePuff: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(220,220,220,0.7)",
  },
  waterDrop: {
    position: "absolute",
    width: 5,
    height: 9,
    borderRadius: 3,
    backgroundColor: "#7dd3fc",
  },
  leaf: {
    position: "absolute",
    width: 10,
    height: 8,
    borderRadius: 4,
    transform: [{ skewX: "15deg" }],
  },
  birdGroup: {
    position: "absolute",
  },
  wing: {
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: "#475569",
    transform: [{ rotate: "-20deg" }],
  },
  wingR: {
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: "#475569",
    transform: [{ rotate: "20deg" }],
  },
  firefly: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
