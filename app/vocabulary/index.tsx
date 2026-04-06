import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { MotiView } from "moti";
import { BottomNav } from "@/components/ui/BottomNav";
import { GameHeader } from "@/components/ui/GameHeader";
import { chapters } from "@/lib/chaptersData";
import { useGameStore, isChapterUnlocked } from "@/store/gameStore";
import type { ChapterId } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

export default function VocabularyPage() {
  const insets = useSafeAreaInsets();
  const { chapterProgress } = useGameStore();

  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const handleSpeak = useCallback(
    (word: string) => {
      Speech.stop();
      if (speakingWord === word) {
        setSpeakingWord(null);
        return;
      }
      setSpeakingWord(word);
      Speech.speak(word, {
        language: "en-US",
        rate: 0.85,
        onDone: () => setSpeakingWord(null),
        onStopped: () => setSpeakingWord(null),
        onError: () => setSpeakingWord(null),
      });
    },
    [speakingWord]
  );

  // Count unlocked words
  const unlockedCount = chapters.reduce((count, ch) => {
    if (isChapterUnlocked(ch.id as ChapterId, chapterProgress)) {
      return count + ch.vocabulary.length;
    }
    return count;
  }, 0);
  const totalCount = chapters.reduce((n, ch) => n + ch.vocabulary.length, 0);

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bg]} />
      <GameHeader transparent />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Vocabulary</Text>
          <Text style={styles.pageCounter}>
            {unlockedCount} / {totalCount} words
          </Text>
        </View>

        {/* Chapter sections */}
        {chapters.map((chapter, idx) => {
          const unlocked = isChapterUnlocked(
            chapter.id as ChapterId,
            chapterProgress
          );

          return (
            <MotiView
              key={chapter.id}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 350,
                delay: idx * 80,
              }}
              style={styles.chapterCard}
            >
              {/* Chapter header */}
              <View style={styles.chapterHeader}>
                <View
                  style={[
                    styles.chapterAccent,
                    {
                      backgroundColor: unlocked
                        ? chapter.accentColorHex
                        : `${colors.navy}30`,
                    },
                  ]}
                />
                <Text style={styles.chapterEmoji}>{chapter.animalEmoji}</Text>
                <View style={styles.chapterInfo}>
                  <Text
                    style={[
                      styles.chapterTitle,
                      !unlocked && styles.lockedText,
                    ]}
                  >
                    {chapter.title}
                  </Text>
                  <Text
                    style={[
                      styles.chapterLocation,
                      !unlocked && styles.lockedText,
                    ]}
                  >
                    {chapter.location}
                  </Text>
                </View>
                {!unlocked && (
                  <Text style={styles.lockIcon}>🔒</Text>
                )}
              </View>

              {unlocked ? (
                /* Unlocked: show vocab words */
                <View style={styles.vocabList}>
                  {chapter.vocabulary.map((vocab, vIdx) => (
                    <View key={vocab.word}>
                      {vIdx > 0 && <View style={styles.divider} />}
                      <View style={styles.vocabItem}>
                        <View style={styles.vocabContent}>
                          <View style={styles.vocabWordRow}>
                            <Text style={styles.vocabWord}>{vocab.word}</Text>
                            <Text style={styles.vocabPhonetic}>
                              {vocab.phonetic}
                            </Text>
                          </View>
                          <Text style={styles.vocabMeaning}>
                            {vocab.meaning}
                          </Text>
                          <Text style={styles.vocabStoryUse}>
                            "{vocab.storyUse}"
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleSpeak(vocab.word)}
                          style={[
                            styles.speakBtn,
                            speakingWord === vocab.word &&
                              styles.speakBtnActive,
                          ]}
                        >
                          <Text style={styles.speakIcon}>
                            {speakingWord === vocab.word ? "🔊" : "🔉"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* Locked: show placeholder */
                <View style={styles.lockedSection}>
                  <Text style={styles.lockedMessage}>
                    Complete{" "}
                    {chapter.id > 1
                      ? chapters[chapter.id - 2].title
                      : "the tutorial"}{" "}
                    to unlock
                  </Text>
                  <View style={styles.lockedSlots}>
                    {chapter.vocabulary.map((_, i) => (
                      <View key={i} style={styles.lockedSlot}>
                        <View style={styles.lockedBar} />
                        <View style={styles.lockedBarShort} />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </MotiView>
          );
        })}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { backgroundColor: colors.navy },

  scroll: { paddingTop: 8, paddingHorizontal: 16, gap: 14 },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: "white",
  },
  pageCounter: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  chapterCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  chapterAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  chapterEmoji: { fontSize: 28 },
  chapterInfo: { flex: 1, gap: 2 },
  chapterTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.navy,
  },
  chapterLocation: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: `${colors.navy}70`,
  },
  lockIcon: { fontSize: 18 },
  lockedText: { color: `${colors.navy}40` },

  vocabList: { paddingHorizontal: 16, paddingBottom: 16 },

  divider: {
    height: 1,
    backgroundColor: `${colors.navy}10`,
    marginVertical: 12,
  },

  vocabItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  vocabContent: { flex: 1, gap: 4 },
  vocabWordRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  vocabWord: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.navy,
  },
  vocabPhonetic: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: `${colors.navy}70`,
  },
  vocabMeaning: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.navy,
    lineHeight: 20,
  },
  vocabStoryUse: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}90`,
    fontStyle: "italic",
    lineHeight: 19,
  },

  speakBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.gold}18`,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  speakBtnActive: {
    backgroundColor: `${colors.gold}35`,
  },
  speakIcon: { fontSize: 20 },

  lockedSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    opacity: 0.5,
  },
  lockedMessage: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}60`,
    textAlign: "center",
  },
  lockedSlots: { gap: 10 },
  lockedSlot: { gap: 6 },
  lockedBar: {
    height: 14,
    width: "60%",
    backgroundColor: `${colors.navy}12`,
    borderRadius: 7,
  },
  lockedBarShort: {
    height: 10,
    width: "40%",
    backgroundColor: `${colors.navy}08`,
    borderRadius: 5,
  },
});
