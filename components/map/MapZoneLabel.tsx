import { memo } from "react";
import { StyleSheet, Text } from "react-native";
import { MotiView } from "moti";
import { fonts } from "@/lib/theme";

interface ZoneLabelData {
  label: string;
  emoji: string;
  y: number;
  accentColor: string;
  alignRight?: boolean;
}

export const ZONE_LABELS: ZoneLabelData[] = [
  { label: "Bakery District",   emoji: "🥐", y: 1650, accentColor: "#D97706", alignRight: false },
  { label: "Fountain Square",   emoji: "⛲", y: 1270, accentColor: "#0EA5E9", alignRight: true  },
  { label: "Greenwood Forest",  emoji: "🌲", y: 890,  accentColor: "#16A34A", alignRight: false },
  { label: "Sunfield Farm",     emoji: "🌾", y: 510,  accentColor: "#CA8A04", alignRight: true  },
  { label: "Enchanted Forest",  emoji: "✨", y: 130,  accentColor: "#15803D", alignRight: false },
];

interface Props {
  labels?: ZoneLabelData[];
}

export const MapZoneLabel = memo(function MapZoneLabel({ labels = ZONE_LABELS }: Props) {
  return (
    <>
      {labels.map((item, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateX: item.alignRight ? 30 : -30 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: i * 120 + 400, type: "spring", stiffness: 180, damping: 20 }}
          style={[
            styles.label,
            {
              top: item.y,
              left: item.alignRight ? undefined : 12,
              right: item.alignRight ? 12 : undefined,
              borderColor: item.accentColor,
              transform: [{ rotate: item.alignRight ? "2deg" : "-2deg" }],
            },
          ]}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <Text style={[styles.text, { color: item.accentColor }]}>{item.label}</Text>
        </MotiView>
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backdropFilter: "blur(4px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 14,
  },
  text: {
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
