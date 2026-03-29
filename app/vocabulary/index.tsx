import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
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

      <MotiView
        from={{ opacity: 0, translateY: -12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 400, type: "timing" }}
        style={styles.header}
      >
        <Text style={styles.title}>📚 Vocabulary</Text>
        <Text style={styles.subtitle}>Words from Alex's journey</Text>
      </MotiView>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {chapters.map((chapter, ci) => (
          <MotiView
            key={chapter.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: ci * 80, type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Chapter header */}
            <View style={[styles.chapterHeader, { borderLeftColor: chapter.accentColorHex }]}>
              <Text style={styles.chapterEmoji}>{chapter.animalEmoji}</Text>
              <View>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterLo}>{chapter.learningObjective}</Text>
              </View>
            </View>

            {/* Vocab cards */}
            {chapter.vocabulary.map((entry, vi) => (
              <MotiView
                key={entry.word}
                from={{ opacity: 0, translateX: -16 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: ci * 80 + vi * 60, type: "spring", stiffness: 200, damping: 20 }}
              >
                <VocabCard
                  word={entry.word}
                  translation={`${entry.phonetic} — ${entry.meaning}`}
                  example={entry.storyUse}
                  emoji={chapter.animalEmoji}
                />
              </MotiView>
            ))}
          </MotiView>
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
