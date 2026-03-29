import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

const RIVAL_EMOJIS = ["🦊", "🐸", "🐼", "🦁", "🐯"];

interface Props {
  chapterId: number;
  score?: number;
}

export function RivalCharacter({ chapterId, score = 0 }: Props) {
  const emoji = RIVAL_EMOJIS[(chapterId - 1) % RIVAL_EMOJIS.length];

  return (
    <View style={styles.container}>
      <MotiView
        animate={{ scale: [1, 1.04, 1], rotate: ["0deg", "2deg", "0deg", "-2deg", "0deg"] }}
        transition={{ loop: true, duration: 3000, type: "timing" }}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </MotiView>
      <View style={styles.scoreBadge}>
        <Text style={styles.score}>{score} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  emoji: {
    fontSize: 52,
  },
  scoreBadge: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  score: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "white",
  },
});
