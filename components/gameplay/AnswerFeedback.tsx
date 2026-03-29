import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

interface Props {
  correct: boolean | null; // null = not answered yet
  correctAnswer?: string;
}

export function AnswerFeedback({ correct, correctAnswer }: Props) {
  if (correct === null) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      style={[styles.banner, correct ? styles.correct : styles.wrong]}
    >
      <Text style={styles.icon}>{correct ? "✅" : "❌"}</Text>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{correct ? "Correct! 🎉" : "Not quite..."}</Text>
        {!correct && correctAnswer && (
          <Text style={styles.answer}>Answer: {correctAnswer}</Text>
        )}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
  },
  correct: {
    backgroundColor: `${colors.success}20`,
    borderWidth: 2,
    borderColor: colors.success,
  },
  wrong: {
    backgroundColor: `${colors.danger}20`,
    borderWidth: 2,
    borderColor: colors.danger,
  },
  icon: {
    fontSize: 28,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.navy,
  },
  answer: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: `${colors.navy}99`,
    marginTop: 2,
  },
});
