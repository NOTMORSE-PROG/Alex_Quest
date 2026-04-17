import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import type { ProblemSound } from "@/types/assessment";

interface Props {
  problemSounds: ProblemSound[];
}

export const ProblemSounds = memo(function ProblemSounds({ problemSounds }: Props) {
  if (problemSounds.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sounds to practice</Text>

      {problemSounds.map((ps, i) => (
        <MotiView
          key={`${ps.phoneme}-${ps.word}-${i}`}
          from={{ opacity: 0, translateX: -12 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 350, delay: i * 100 }}
          style={styles.row}
        >
          {/* Big IPA symbol */}
          <View style={styles.phonemeBadge}>
            <Text style={styles.phonemeText}>/{ps.phoneme}/</Text>
          </View>

          {/* Details */}
          <View style={styles.details}>
            <Text style={styles.substitutionText}>
              You said{" "}
              <Text style={styles.highlight}>/{ps.soundMostLike}/</Text>
              {" "}in{" "}
              <Text style={styles.highlight}>{ps.actualWord ?? ps.word}</Text>
            </Text>
            <Text style={styles.tipText}>{ps.tip}</Text>
          </View>
        </MotiView>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.navy,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: `${colors.warning}12`,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: `${colors.warning}30`,
  },
  phonemeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.warning}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  phonemeText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.warning,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  substitutionText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.navy,
  },
  highlight: {
    fontFamily: fonts.body,
    color: colors.warning,
  },
  tipText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: `${colors.navy}99`,
  },
});
