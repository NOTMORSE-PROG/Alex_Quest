import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import type { PhonemeResult, WordResult } from "@/types/assessment";

interface Props {
  wordResults: WordResult[];
}

/** Color based on quality score: green 80+, yellow 60-79, orange 40-59, red 0-39. */
function scoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return "#FFD900";
  if (score >= 40) return colors.warning;
  return colors.danger;
}

function PhonemePill({
  phoneme,
  index,
}: {
  phoneme: PhonemeResult;
  index: number;
}) {
  const [showTip, setShowTip] = useState(false);

  const isMissing = phoneme.status === "missing";
  const isExtra = phoneme.status === "extra";
  const color = isMissing ? "#B0B0B0" : scoreColor(phoneme.qualityScore);
  const hasTip =
    phoneme.status === "substitution" && phoneme.soundMostLike != null;

  return (
    <View style={styles.pillWrapper}>
      <Pressable
        onPress={hasTip ? () => setShowTip((v) => !v) : undefined}
        accessibilityRole="button"
        accessibilityLabel={`Phoneme ${phoneme.phoneme}, score ${phoneme.qualityScore}`}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300, delay: index * 50 }}
          style={[
            styles.pill,
            {
              backgroundColor: isMissing ? "transparent" : `${color}25`,
              borderColor: color,
              borderStyle: isMissing ? "dashed" : "solid",
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color },
              isExtra && styles.strikethrough,
            ]}
          >
            /{phoneme.phoneme}/
          </Text>
        </MotiView>
      </Pressable>

      {showTip && hasTip && (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.tooltip}
        >
          <Text style={styles.tooltipText}>
            You said /{phoneme.soundMostLike}/, try /{phoneme.phoneme}/
          </Text>
          {phoneme.tip != null && (
            <Text style={styles.tooltipTip}>{phoneme.tip}</Text>
          )}
        </MotiView>
      )}
    </View>
  );
}

export const PhonemeBreakdown = memo(function PhonemeBreakdown({ wordResults }: Props) {
  let pillIndex = 0;

  return (
    <View style={styles.container}>
      {wordResults.filter(w => w.status !== "missing").map((word, wi) => (
        <View key={`${word.word}-${wi}`} style={styles.wordGroup}>
          <Text style={styles.wordLabel}>{word.word}</Text>
          <View style={styles.phonemeRow}>
            {word.phonemes.map((ph, pi) => {
              const idx = pillIndex++;
              return (
                <PhonemePill
                  key={`${ph.phoneme}-${pi}`}
                  phoneme={ph}
                  index={idx}
                />
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingVertical: 8,
  },
  wordGroup: {
    alignItems: "center",
    gap: 4,
  },
  wordLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: `${colors.navy}80`,
    textTransform: "lowercase",
  },
  phonemeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  pillWrapper: {
    position: "relative",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  pillText: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  tooltip: {
    position: "absolute",
    top: "100%",
    left: -8,
    marginTop: 4,
    backgroundColor: colors.navy,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 10,
    minWidth: 140,
  },
  tooltipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "#FFFFFF",
  },
  tooltipTip: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: "#FFFFFFCC",
    marginTop: 2,
  },
});
