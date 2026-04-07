import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts, shadows } from "@/lib/theme";

interface Props {
  question: string;
  directions?: string;
  hint?: string;
  questionNumber: number;
  total: number;
  /** For 'choice' type: read-only options displayed as numbered list */
  options?: string[];
  /** For 'build' type: sentence with blank to display */
  blank?: string;
  /** For 'speak' type: the target sentence shown for the student to read and repeat */
  targetSentence?: string;
}

export function QuestionCard({ question, directions, hint, questionNumber, total, options, blank, targetSentence }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={[styles.card, shadows.card]}
    >
      <Text style={styles.counter}>{questionNumber} / {total}</Text>
      <Text style={styles.question}>{question}</Text>

      {/* Build type: show sentence with blank highlighted */}
      {blank && (
        <View style={styles.blankBox}>
          <Text style={styles.blankText}>
            {blank.split("___").map((part, i, arr) => (
              <Text key={i}>
                {part}
                {i < arr.length - 1 && (
                  <Text style={styles.blankHighlight}> _____ </Text>
                )}
              </Text>
            ))}
          </Text>
        </View>
      )}

      {/* Choice type: show options as read-only numbered items */}
      {options && options.length > 0 && (
        <View style={styles.optionsList}>
          {options.map((opt, i) => (
            <View key={opt} style={styles.optionItem}>
              <Text style={styles.optionNumber}>{i + 1}.</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Speak type: target sentence for student to read and repeat */}
      {targetSentence && (
        <View style={styles.targetBox}>
          <Text style={styles.targetLabel}>📢 Say this</Text>
          <Text style={styles.targetText}>{targetSentence}</Text>
        </View>
      )}

      {directions && (
        <View style={styles.directionsBox}>
          <Text style={styles.directionsLabel}>🎤 Directions</Text>
          <Text style={styles.directions}>{directions}</Text>
        </View>
      )}
      {hint && <Text style={styles.hint}>💡 {hint}</Text>}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 12,
  },
  counter: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: `${colors.navy}66`,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 30,
  },
  targetBox: {
    backgroundColor: `${colors.sky}18`,
    borderRadius: 14,
    padding: 14,
    width: "100%",
    borderWidth: 1.5,
    borderColor: `${colors.sky}40`,
    alignItems: "center",
    gap: 6,
  },
  targetLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.sky,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  targetText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 26,
  },
  directionsBox: {
    backgroundColor: `${colors.navy}0D`,
    borderRadius: 12,
    padding: 10,
    width: "100%",
  },
  directionsLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: `${colors.navy}88`,
    marginBottom: 4,
  },
  directions: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}BB`,
    lineHeight: 19,
  },
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.sky,
    textAlign: "center",
  },
  blankBox: {
    backgroundColor: `${colors.sky}15`,
    borderRadius: 12,
    padding: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: `${colors.sky}30`,
  },
  blankText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 24,
  },
  blankHighlight: {
    color: colors.sky,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  optionsList: {
    width: "100%",
    gap: 6,
    backgroundColor: `${colors.navy}08`,
    borderRadius: 12,
    padding: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 4,
  },
  optionNumber: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: `${colors.navy}88`,
    minWidth: 18,
  },
  optionText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.navy,
    flex: 1,
    lineHeight: 20,
  },
});
