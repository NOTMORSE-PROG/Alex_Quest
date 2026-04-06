import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";

interface Decoration {
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotate: string;
  delay: number;
}

const DECORATIONS: Decoration[] = [
  // Stage 1 — Bakery zone (y: 1400–1760)
  { emoji: "🧁", x: 48,  y: 1700, size: 32, rotate: "-15deg", delay: 0 },
  { emoji: "🍞", x: 316, y: 1740, size: 28, rotate: "10deg",  delay: 80 },
  { emoji: "🎂", x: 155, y: 1480, size: 36, rotate: "-5deg",  delay: 160 },
  { emoji: "🥐", x: 340, y: 1565, size: 26, rotate: "20deg",  delay: 240 },
  { emoji: "🥖", x: 55,  y: 1620, size: 28, rotate: "-8deg",  delay: 320 },
  { emoji: "🍪", x: 310, y: 1650, size: 24, rotate: "12deg",  delay: 400 },

  // Stage 2 — Fountain zone (y: 1050–1400)
  { emoji: "💧", x: 55,  y: 1190, size: 24, rotate: "-5deg",  delay: 0 },
  { emoji: "💧", x: 322, y: 1145, size: 20, rotate: "8deg",   delay: 80 },
  { emoji: "🐦", x: 75,  y: 1080, size: 30, rotate: "-10deg", delay: 160 },
  { emoji: "🪙", x: 345, y: 1310, size: 26, rotate: "15deg",  delay: 240 },
  { emoji: "⛲", x: 165, y: 1390, size: 38, rotate: "0deg",   delay: 320 },
  { emoji: "🌊", x: 38,  y: 1340, size: 28, rotate: "-8deg",  delay: 400 },

  // Stage 3 — Forest zone (y: 700–1050)
  { emoji: "🌲", x: 28,  y: 800,  size: 40, rotate: "-3deg",  delay: 0 },
  { emoji: "🌲", x: 338, y: 950,  size: 36, rotate: "5deg",   delay: 80 },
  { emoji: "🍄", x: 282, y: 818,  size: 28, rotate: "-12deg", delay: 160 },
  { emoji: "🍂", x: 98,  y: 730,  size: 22, rotate: "45deg",  delay: 240 },
  { emoji: "🐿️", x: 52,  y: 1005, size: 32, rotate: "0deg",   delay: 320 },
  { emoji: "🌿", x: 340, y: 750,  size: 26, rotate: "-20deg", delay: 400 },

  // Stage 4 — Farm zone (y: 350–700)
  { emoji: "🌾", x: 42,  y: 450,  size: 34, rotate: "-5deg",  delay: 0 },
  { emoji: "🌾", x: 328, y: 600,  size: 34, rotate: "8deg",   delay: 80 },
  { emoji: "🐄", x: 318, y: 420,  size: 36, rotate: "0deg",   delay: 160 },
  { emoji: "🌻", x: 75,  y: 678,  size: 32, rotate: "-3deg",  delay: 240 },
  { emoji: "🪣", x: 348, y: 580,  size: 26, rotate: "18deg",  delay: 320 },
  { emoji: "🐓", x: 52,  y: 545,  size: 30, rotate: "-8deg",  delay: 400 },

  // Stage 5 — Enchanted Forest zone (y: 0–350)
  { emoji: "🦋", x: 58,  y: 200,  size: 30, rotate: "-10deg", delay: 0 },
  { emoji: "✨", x: 312, y: 148,  size: 28, rotate: "0deg",   delay: 80 },
  { emoji: "🌙", x: 330, y: 60,   size: 34, rotate: "12deg",  delay: 160 },
  { emoji: "🍃", x: 168, y: 298,  size: 24, rotate: "30deg",  delay: 240 },
  { emoji: "🌟", x: 48,  y: 105,  size: 26, rotate: "-5deg",  delay: 320 },
  { emoji: "🔮", x: 318, y: 280,  size: 28, rotate: "8deg",   delay: 400 },
];

export const MapDecorations = memo(function MapDecorations() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {DECORATIONS.map((d, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 16, scale: 0.6 }}
          animate={{ opacity: 0.88, translateY: 0, scale: 1 }}
          transition={{ delay: d.delay + 300, type: "spring", stiffness: 160, damping: 18 }}
          style={[
            styles.item,
            {
              left: d.x,
              top: d.y,
              transform: [{ rotate: d.rotate }],
            },
          ]}
        >
          <Text style={{ fontSize: d.size }}>{d.emoji}</Text>
        </MotiView>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  item: {
    position: "absolute",
  },
});
