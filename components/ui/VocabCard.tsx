import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts, shadows } from "@/lib/theme";

interface Props {
  word: string;
  translation: string;
  example?: string;
  emoji?: string;
  onPress?: () => void;
}

export function VocabCard({ word, translation, example, emoji, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={[styles.card, shadows.card]}
      >
        <View style={styles.header}>
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          <Text style={styles.word}>{word}</Text>
        </View>
        <Text style={styles.translation}>{translation}</Text>
        {example && <Text style={styles.example}>"{example}"</Text>}
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginVertical: 6,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  emoji: {
    fontSize: 28,
  },
  word: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.navy,
  },
  translation: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.sky,
    marginBottom: 4,
  },
  example: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}99`,
    fontStyle: "italic",
  },
});
