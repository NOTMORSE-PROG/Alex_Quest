import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";
import { badges } from "@/lib/badgesData";
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

  return (
    <View style={styles.screen}>
      <GameHeader transparent />

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400 }}
        style={styles.progressContainer}
      >
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
      </MotiView>

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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
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
    paddingBottom: 100,
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
});
