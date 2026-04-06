import { memo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");

const CLOUDS = [
  { x: SCREEN_W * 0.15, y: 180,  width: 90,  opacity: 0.22 },
  { x: SCREEN_W * 0.55, y: 550,  width: 70,  opacity: 0.18 },
  { x: SCREEN_W * 0.30, y: 960,  width: 80,  opacity: 0.20 },
  { x: SCREEN_W * 0.70, y: 1400, width: 65,  opacity: 0.16 },
];

function CloudShape({ width }: { width: number }) {
  const h = width * 0.5;
  const r = width * 0.2;

  return (
    <Svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}>
      {/* Main puff */}
      <Circle cx={width * 0.4} cy={h * 0.65} r={r * 1.2} fill="white" />
      {/* Left puff */}
      <Circle cx={width * 0.22} cy={h * 0.72} r={r * 0.9} fill="white" />
      {/* Right puff */}
      <Circle cx={width * 0.62} cy={h * 0.72} r={r * 0.85} fill="white" />
      {/* Top puff */}
      <Circle cx={width * 0.42} cy={h * 0.4} r={r * 0.95} fill="white" />
      {/* Base fill */}
      <Path
        d={`M${width * 0.1} ${h} L${width * 0.9} ${h} L${width * 0.9} ${h * 0.72} Q${width * 0.95} ${h * 0.72} ${width * 0.9} ${h * 0.72} L${width * 0.1} ${h * 0.72} Z`}
        fill="white"
      />
    </Svg>
  );
}

export const MapClouds = memo(function MapClouds() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CLOUDS.map((cloud, i) => (
        <View
          key={i}
          style={[styles.cloud, { top: cloud.y, left: cloud.x, opacity: cloud.opacity }]}
        >
          <CloudShape width={cloud.width} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  cloud: {
    position: "absolute",
  },
});
