import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts, shadows } from "@/lib/theme";

interface Props {
  question: string;
  hint?: string;
  questionNumber: number;
  total: number;
}

export function QuestionCard({ question, hint, questionNumber, total }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={[styles.card, shadows.card]}
    >
      <Text style={styles.counter}>{questionNumber} / {total}</Text>
      <Text style={styles.question}>{question}</Text>
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
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.sky,
    textAlign: "center",
  },
});
