import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "@/components/ui/BottomNav";
import { LevelNode } from "@/components/ui/LevelNode";
import { GameHeader } from "@/components/ui/GameHeader";
import { chapters } from "@/lib/chaptersData";
import { useGameStore, isChapterUnlocked, type ChapterId } from "@/store/gameStore";
import { useAudio } from "@/hooks/useAudio";
import { colors, fonts } from "@/lib/theme";

export default function MapPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { playSFX } = useAudio();
  const { currentChapter, chapterProgress, setCurrentChapter } = useGameStore();

  const handleChapterPress = (id: ChapterId) => {
    playSFX("click");
    setCurrentChapter(id);
    router.push(`/chapter/${id}`);
  };

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
        <Text style={styles.title}>🗺️ Alex's Quest Map</Text>
        <Text style={styles.subtitle}>Choose your next chapter</Text>
      </MotiView>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {chapters.map((ch, i) => {
          const id = ch.id as ChapterId;
          const unlocked = isChapterUnlocked(id, chapterProgress);
          const progress = chapterProgress[id];
          const isActive = id === currentChapter && unlocked;

          return (
            <MotiView
              key={ch.id}
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: i * 100, type: "spring", stiffness: 200, damping: 20 }}
              style={styles.nodeRow}
            >
              {/* Connector line */}
              {i > 0 && (
                <View style={[styles.connector, { backgroundColor: unlocked ? colors.success : "rgba(255,255,255,0.2)" }]} />
              )}

              <LevelNode
                id={id}
                label={ch.title}
                icon={ch.animalEmoji}
                color={ch.accentColorHex}
                isUnlocked={unlocked}
                isActive={isActive}
                stars={progress.stars}
                onPress={() => handleChapterPress(id)}
              />

              <View style={styles.nodeInfo}>
                <Text style={styles.nodeObjective}>{ch.learningObjective}</Text>
              </View>
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
  header: { alignItems: "center", paddingVertical: 8 },
  title: { fontFamily: fonts.display, fontSize: 22, color: "white" },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  scroll: { paddingHorizontal: 32, paddingTop: 12, alignItems: "center", gap: 0 },
  nodeRow: { alignItems: "center", width: "100%" },
  connector: { width: 3, height: 32, borderRadius: 2 },
  nodeInfo: { marginTop: 4, alignItems: "center" },
  nodeObjective: { fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center" },
});
