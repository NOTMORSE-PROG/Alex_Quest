import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

interface Props {
  contentScore: number;
  pronunciationScore: number;
  fluencyScore: number;
}

/** Color based on score: green 80+, yellow 60-79, orange 40-59, red 0-39. */
function scoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return "#FFD900";
  if (score >= 40) return colors.warning;
  return colors.danger;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score);
  const clampedPercent = Math.min(Math.max(score, 0), 100);

  return (
    <View style={styles.barRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <MotiView
          from={{ width: "0%" as unknown as number }}
          animate={{ width: `${clampedPercent}%` as unknown as number }}
          transition={{ type: "timing", duration: 800 }}
          style={[styles.fill, { backgroundColor: color }]}
        />
      </View>
      <Text style={[styles.percent, { color }]}>{score}%</Text>
    </View>
  );
}

export function ScoreBars({
  contentScore,
  pronunciationScore,
  fluencyScore,
}: Props) {
  return (
    <View style={styles.container}>
      <ScoreBar label="Content" score={contentScore} />
      <ScoreBar label="Pronunciation" score={pronunciationScore} />
      <ScoreBar label="Fluency" score={fluencyScore} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    width: 100,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.navy,
  },
  track: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: `${colors.navy}1A`,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 6,
  },
  percent: {
    width: 40,
    textAlign: "right",
    fontFamily: fonts.body,
    fontSize: 13,
  },
});
