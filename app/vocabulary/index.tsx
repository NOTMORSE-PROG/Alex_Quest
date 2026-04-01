import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "@/components/ui/BottomNav";
import { GameHeader } from "@/components/ui/GameHeader";
import { VocabCard } from "@/components/ui/VocabCard";
import { chapters } from "@/lib/chaptersData";
import { colors, fonts } from "@/lib/theme";

export default function VocabularyPage() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bg]} />
      <GameHeader transparent />

      <View style={styles.header}>
        <Text style={styles.title}>📚 Vocabulary</Text>
        <Text style={styles.subtitle}>Words from Alex's journey</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {chapters.map((chapter, ci) => (
          <View key={chapter.id}>
            {/* Chapter header */}
            <View style={[styles.chapterHeader, { borderLeftColor: chapter.accentColorHex }]}>
              <Text style={styles.chapterEmoji}>{chapter.animalEmoji}</Text>
              <View>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterLo}>{chapter.learningObjective}</Text>
              </View>
            </View>

            {/* Vocab cards */}
            {chapter.vocabulary.map((entry) => (
              <VocabCard
                key={entry.word}
                word={entry.word}
                translation={`${entry.phonetic} — ${entry.meaning}`}
                example={entry.storyUse}
                emoji={chapter.animalEmoji}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { backgroundColor: colors.navy },
  header: { alignItems: "center", paddingVertical: 8 },
  title: { fontFamily: fonts.display, fontSize: 22, color: "white" },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  scroll: { paddingTop: 12 },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderRadius: 2,
  },
  chapterEmoji: { fontSize: 24 },
  chapterTitle: { fontFamily: fonts.display, fontSize: 16, color: "white" },
  chapterLo: { fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 },
});
