import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import { useGameStore, type ChapterId } from "@/store/gameStore";
import { badges } from "@/lib/badgesData";
import { getChapter } from "@/lib/chaptersData";
import { BadgeCard } from "@/components/ui/BadgeCard";
import { GameHeader } from "@/components/ui/GameHeader";
import { BottomNav } from "@/components/ui/BottomNav";
import type { BadgeCategory } from "@/types/badges";

type FilterTab = "all" | BadgeCategory;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "progress", label: "Progress" },
  { key: "mastery", label: "Mastery" },
  { key: "streak", label: "Streak" },
  { key: "special", label: "Special" },
];

export default function BadgesPage() {
  const earnedBadges = useGameStore((s) => s.earnedBadges);
  const questionScores = useGameStore((s) => s.questionScores);
  const chapterProgress = useGameStore((s) => s.chapterProgress);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const earnedMap = useMemo(
    () => new Map(earnedBadges.map((b) => [b.id, b])),
    [earnedBadges]
  );

  const filtered = useMemo(
    () =>
      badges
        .filter((b) => activeTab === "all" || b.category === activeTab)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [activeTab]
  );

  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;

  const chapterProgressData = useMemo(
    () =>
      ([1, 2, 3, 4, 5] as ChapterId[]).map((id) => {
        const chapter = getChapter(id);
        const total = chapter?.questions.length ?? 0;
        const done =
          chapter?.questions.filter(
            (q) => questionScores[`${id}-${q.id}`] !== undefined
          ).length ?? 0;
        return {
          id,
          title: chapter?.title ?? `Chapter ${id}`,
          emoji: chapter?.animalEmoji ?? "⭐",
          percentage: total > 0 ? Math.round((done / total) * 100) : 0,
          completed: chapterProgress[id]?.completed ?? false,
        };
      }),
    [questionScores, chapterProgress]
  );

  const listHeader = (
    <>
      {/* Overall badge counter */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {earnedCount} / {totalCount} Badges Earned
        </Text>
        <View style={styles.progressBarBg}>
          <MotiView
            animate={{ width: `${(earnedCount / totalCount) * 100}%` as any }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            style={styles.progressBarFill}
          />
        </View>
      </View>

      {/* Chapter Progress */}
      <View style={styles.chapterProgressContainer}>
        <Text style={styles.chapterProgressTitle}>Chapter Progress</Text>
        {chapterProgressData.map((ch) => (
          <View key={ch.id} style={styles.chapterRow}>
            <Text style={styles.chapterEmoji}>{ch.emoji}</Text>
            <View style={styles.chapterInfo}>
              <View style={styles.chapterLabelRow}>
                <Text style={styles.chapterName} numberOfLines={1}>{ch.title}</Text>
                {ch.completed && <Text style={styles.chapterDone}> ✓</Text>}
              </View>
              <View style={styles.chapterBarBg}>
                <MotiView
                  animate={{ width: `${ch.percentage}%` as any }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  style={[
                    styles.chapterBarFill,
                    ch.completed && styles.chapterBarComplete,
                  ]}
                />
              </View>
            </View>
            <Text style={[styles.chapterPct, ch.completed && styles.chapterPctComplete]}>
              {ch.percentage}%
            </Text>
          </View>
        ))}
      </View>

      {/* Tab filters */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </>
  );

  return (
    <View style={styles.screen}>
      <GameHeader transparent />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 300,
              delay: index * 50,
            }}
            style={styles.gridItem}
          >
            <BadgeCard badge={item} earned={earnedMap.get(item.id)} />
          </MotiView>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No badges in this category yet</Text>
        }
      />

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  progressText: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.gold,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  tabsWrapper: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingVertical: 6,
  },
  tabsContainer: {
    paddingHorizontal: 10,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tabActive: {
    backgroundColor: `${colors.gold}30`,
  },
  tabText: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: "rgba(255,255,255,0.5)",
  },
  tabTextActive: {
    color: colors.gold,
  },
  grid: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 160,
  },
  gridItem: {
    flex: 1,
    maxWidth: "50%",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 40,
  },
  chapterProgressContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  chapterProgressTitle: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chapterEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  chapterInfo: {
    flex: 1,
    gap: 4,
  },
  chapterLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chapterName: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: "rgba(255,255,255,0.85)",
    flexShrink: 1,
  },
  chapterDone: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.gold,
  },
  chapterBarBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  chapterBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.sky,
  },
  chapterBarComplete: {
    backgroundColor: colors.gold,
  },
  chapterPct: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: "rgba(255,255,255,0.5)",
    width: 36,
    textAlign: "right",
  },
  chapterPctComplete: {
    color: colors.gold,
  },
});
