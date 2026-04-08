/**
 * MapZoneMarker — wooden signpost zone labels replacing bare text badges.
 * Each sign has a post, a shaped board, and the zone name + emoji.
 */
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect, Path, Line } from "react-native-svg";
import { fonts } from "@/lib/theme";

interface ZoneMarkerData {
  label: string;
  emoji: string;
  y: number;
  accentColor: string;
  alignRight?: boolean;
}

export const ZONE_MARKERS: ZoneMarkerData[] = [
  { label: "Bakery District",     emoji: "🥐", y: 1665, accentColor: "#D97706", alignRight: false },
  { label: "Fountain Square",     emoji: "⛲", y: 1285, accentColor: "#0EA5E9", alignRight: true  },
  { label: "Countryside Forest",  emoji: "🌲", y: 895,  accentColor: "#16A34A", alignRight: false },
  { label: "Farmlands of Plenty", emoji: "🌾", y: 515,  accentColor: "#CA8A04", alignRight: true  },
  { label: "The Jungle's Edge",   emoji: "🌴", y: 210,  accentColor: "#22C55E", alignRight: false },
];

const SIGN_W = 215;
const SIGN_H = 46;

// POST_H — how far the post extends below the sign board
const POST_H = 28;

function SignPost({ accentColor, alignRight }: { accentColor: string; alignRight: boolean }) {
  const postX = alignRight ? SIGN_W - 14 : 14;
  // Total SVG height: sign board on top, post below
  const totalH = SIGN_H + POST_H;
  return (
    <Svg width={SIGN_W} height={totalH} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgGradient id={`wood_${accentColor.replace("#","")}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#7c4522" />
          <Stop offset="0.4" stopColor="#a0632e" />
          <Stop offset="1" stopColor="#7c4522" />
        </SvgGradient>
        <SvgGradient id={`board_${accentColor.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#92400e" />
          <Stop offset="1" stopColor="#6b3a1f" />
        </SvgGradient>
      </Defs>

      {/* Sign board shape at TOP (y=0 to SIGN_H), arrow tip points away from post */}
      {alignRight ? (
        <Path
          d={`M 0 0 L ${SIGN_W - 22} 0 L ${SIGN_W} ${SIGN_H / 2} L ${SIGN_W - 22} ${SIGN_H} L 0 ${SIGN_H} Z`}
          fill={`url(#board_${accentColor.replace("#","")})`}
        />
      ) : (
        <Path
          d={`M 22 0 L ${SIGN_W} 0 L ${SIGN_W} ${SIGN_H} L 22 ${SIGN_H} L 0 ${SIGN_H / 2} Z`}
          fill={`url(#board_${accentColor.replace("#","")})`}
        />
      )}

      {/* Board inset border */}
      {alignRight ? (
        <Path
          d={`M 2 2 L ${SIGN_W - 24} 2 L ${SIGN_W - 2} ${SIGN_H / 2} L ${SIGN_W - 24} ${SIGN_H - 2} L 2 ${SIGN_H - 2} Z`}
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
          opacity={0.45}
        />
      ) : (
        <Path
          d={`M 24 2 L ${SIGN_W - 2} 2 L ${SIGN_W - 2} ${SIGN_H - 2} L 24 ${SIGN_H - 2} L 2 ${SIGN_H / 2} Z`}
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
          opacity={0.45}
        />
      )}

      {/* Nail dots on the board */}
      {(alignRight
        ? [[8, 8], [8, SIGN_H - 8]]
        : [[SIGN_W - 8, 8], [SIGN_W - 8, SIGN_H - 8]]
      ).map(([nx, ny], i) => (
        <Rect key={i} x={nx - 2} y={ny - 2} width={4} height={4} rx={2} fill="rgba(255,255,255,0.3)" />
      ))}

      {/* Post extends DOWN from sign board */}
      <Rect x={postX - 4} y={SIGN_H} width={8} height={POST_H} rx={3}
        fill={`url(#wood_${accentColor.replace("#","")})`} />
      {/* Wood grain */}
      <Line x1={postX - 2} y1={SIGN_H + 4}  x2={postX - 2} y2={SIGN_H + 18} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
      <Line x1={postX + 1} y1={SIGN_H + 8}  x2={postX + 1} y2={SIGN_H + 24} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
    </Svg>
  );
}

export const MapZoneMarker = memo(function MapZoneMarker() {
  return (
    <>
      {ZONE_MARKERS.map((item, i) => {
        const leftPos = item.alignRight ? undefined : 10;
        const rightPos = item.alignRight ? 10 : undefined;

        return (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: item.alignRight ? 40 : -40 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: i * 140 + 500, type: "spring", stiffness: 160, damping: 20 }}
            style={[
              styles.markerWrap,
              {
                top: item.y,
                left: leftPos,
                right: rightPos,
                width: SIGN_W,
              },
            ]}
          >
            {/* SVG fills the wrapper — post below, board on top */}
            <SignPost accentColor={item.accentColor} alignRight={!!item.alignRight} />

            {/* Text overlaid on the board (top SIGN_H rows) */}
            <View
              style={[
                styles.textWrap,
                {
                  paddingLeft: item.alignRight ? 14 : 30,
                  paddingRight: item.alignRight ? 30 : 14,
                },
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.label, { color: item.accentColor }]}>
                {item.label}
              </Text>
            </View>
          </MotiView>
        );
      })}
    </>
  );
});

const styles = StyleSheet.create({
  markerWrap: {
    position: "absolute",
    // SIGN_H (board) + POST_H (post below) — SVG fills this exactly
    height: SIGN_H + 28,
  },
  textWrap: {
    // Absolutely overlaid on the board portion (top SIGN_H px)
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SIGN_H,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  emoji: {
    fontSize: 15,
    flexShrink: 0,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 0.2,
    flexShrink: 1,
    color: "white",
  },
});
