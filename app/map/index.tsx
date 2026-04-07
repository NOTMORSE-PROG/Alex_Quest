import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { BottomNav } from "@/components/ui/BottomNav";
import { MapPath, NODE_POSITIONS, CANVAS_HEIGHT, CANVAS_WIDTH } from "@/components/map/MapPath";
import { MapDecorations } from "@/components/map/MapDecorations";
import { MapTerrain } from "@/components/map/MapTerrain";
import { MapClouds } from "@/components/map/MapClouds";
import { StageNode } from "@/components/map/StageNode";
import { MapZoneLabel } from "@/components/map/MapZoneLabel";
import { MapAlexPin } from "@/components/map/MapAlexPin";
import { MapHeader } from "@/components/map/MapHeader";
import { MapJumpButton } from "@/components/map/MapJumpButton";
import { MapChapterPopup } from "@/components/map/MapChapterPopup";
import { StageProgressRing } from "@/components/map/StageProgressRing";

import { chapters } from "@/lib/chaptersData";
import type { Chapter } from "@/lib/chaptersData";
import { useGameStore, isChapterUnlocked, type ChapterId } from "@/store/gameStore";
import { useAudio } from "@/hooks/useAudio";

const { height: SCREEN_H } = Dimensions.get("window");

// Gradient colors from top (Stage 5 — The Jungle's Edge) to bottom (Stage 1 — Bakery)
const BG_COLORS: [string, string, ...string[]] = [
  "#1a0533",  // very top — deep jungle canopy
  "#052e16",  // jungle canopy green
  "#065f46",  // countryside forest transition
  "#166534",  // farmlands (rooster/scarecrow zone)
  "#1d4ed8",  // sky-blue tinge (fountain entry)
  "#0369a1",  // fountain blue
  "#0c4a6e",  // fountain deep
  "#78350f",  // bakery amber-brown
  "#d97706",  // bakery amber
  "#fef3c7",  // bakery cream (very bottom)
];

const BG_LOCATIONS: [number, number, ...number[]] = [0, 0.07, 0.18, 0.28, 0.38, 0.48, 0.56, 0.70, 0.85, 1.0];

// Memoized wrapper so the container View + ring + node don't re-render during scroll
interface NodeRowProps {
  chapter: Chapter;
  isUnlocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
  ringProgress: number;
  onPress: (chapter: Chapter) => void;
}
const NodeRow = memo(function NodeRow({ chapter, isUnlocked, isActive, isCompleted, ringProgress, onPress }: NodeRowProps) {
  const nodePos = NODE_POSITIONS[chapter.id - 1];
  return (
    <View
      style={{
        position: "absolute",
        left: nodePos.x - 54,
        top: nodePos.y - 54,
        width: 108,
        alignItems: "center",
      }}
    >
      {(isActive || isCompleted) && (
        <StageProgressRing
          progress={ringProgress}
          color={chapter.accentColorHex}
        />
      )}
      <StageNode
        chapter={chapter}
        isUnlocked={isUnlocked}
        isActive={isActive}
        isCompleted={isCompleted}
        onPress={onPress}
      />
    </View>
  );
});

export default function MapPage() {
  const router = useRouter();
  const { playSFX } = useAudio();

  const {
    currentChapter,
    chapterProgress,
    setCurrentChapter,
    activeChapterId,
    activeQuestionIndex,
  } = useGameStore();

  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const [headerBgOpacity, setHeaderBgOpacity] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Count completed segments (each completed chapter colors one path segment)
  const completedSegments = (Object.keys(chapterProgress) as unknown as ChapterId[]).filter(
    (id) => chapterProgress[id].completed
  ).length;

  // Auto-scroll to current chapter node on mount
  useEffect(() => {
    const nodePos = NODE_POSITIONS[currentChapter - 1];
    const targetY = Math.max(0, nodePos.y - SCREEN_H * 0.5);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 400);
  }, [currentChapter]);

  const currentNodeY = NODE_POSITIONS[currentChapter - 1].y;

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollYRef.current = y;

    // Only update jump button state when visibility actually changes
    const isVisible = y < currentNodeY + 80 && y + SCREEN_H > currentNodeY - 80;
    setShowJumpBtn((prev) => {
      const next = !isVisible;
      return prev === next ? prev : next;
    });

    // Only update header opacity when in the 0-80 scroll range (quantized)
    const newOpacity = Math.round(Math.min(y / 80, 1) * 0.72 * 20) / 20;
    setHeaderBgOpacity((prev) => (prev === newOpacity ? prev : newOpacity));
  }, [currentNodeY]);

  const handleNodePress = useCallback((chapter: Chapter) => {
    playSFX("click");
    setSelectedChapter(chapter);
  }, [playSFX]);

  const handlePopupStart = useCallback(() => {
    if (!selectedChapter) return;
    const id = selectedChapter.id as ChapterId;
    setSelectedChapter(null);
    setCurrentChapter(id);
    router.push(`/lesson/${id}`);
  }, [selectedChapter, setCurrentChapter, router]);

  const jumpToCurrent = useCallback(() => {
    const nodePos = NODE_POSITIONS[currentChapter - 1];
    const targetY = Math.max(0, nodePos.y - SCREEN_H * 0.5);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [currentChapter]);

  const getChapterProgress = useCallback((chId: number): number => {
    const ch = chapters.find((c) => c.id === chId);
    if (!ch) return 0;
    if (chapterProgress[chId as ChapterId]?.completed) return 1;
    if (activeChapterId === chId) {
      return activeQuestionIndex / ch.questions.length;
    }
    return 0;
  }, [chapterProgress, activeChapterId, activeQuestionIndex]);

  return (
    <View style={styles.root}>
      {/* Scrollable world canvas */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT + 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={BG_COLORS}
          locations={BG_LOCATIONS}
          style={[StyleSheet.absoluteFill, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}
        />

        {/* Terrain zone dividers */}
        <MapTerrain />

        {/* Animated clouds */}
        <MapClouds />

        {/* Winding bezier path */}
        <MapPath completedSegments={completedSegments} />

        {/* Themed emoji decorations (rendered before labels so labels appear on top) */}
        <MapDecorations />

        {/* Zone name ribbon labels */}
        <MapZoneLabel />

        {/* Stage nodes */}
        {chapters.map((ch) => {
          const id = ch.id as ChapterId;
          const unlocked = isChapterUnlocked(id, chapterProgress);
          const progress = chapterProgress[id];
          const isActive = id === currentChapter && unlocked && !progress.completed;
          const isCompleted = progress.completed;
          const ringProgress = getChapterProgress(id);

          return (
            <NodeRow
              key={ch.id}
              chapter={ch}
              isUnlocked={unlocked}
              isActive={isActive}
              isCompleted={isCompleted}
              ringProgress={ringProgress}
              onPress={handleNodePress}
            />
          );
        })}

        {/* Alex pin on current active stage */}
        {(() => {
          const pos = NODE_POSITIONS[currentChapter - 1];
          return <MapAlexPin x={pos.x} y={pos.y} />;
        })()}
      </ScrollView>

      {/* Floating header (outside scroll so it stays fixed) */}
      <MapHeader bgOpacity={headerBgOpacity} />

      {/* Jump to current button */}
      <MapJumpButton visible={showJumpBtn} onPress={jumpToCurrent} />

      {/* Chapter popup */}
      <MapChapterPopup
        chapter={selectedChapter}
        isUnlocked={
          selectedChapter
            ? isChapterUnlocked(selectedChapter.id as ChapterId, chapterProgress)
            : false
        }
        onClose={() => setSelectedChapter(null)}
        onStart={handlePopupStart}
      />

      {/* Bottom nav sits at the very bottom */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a0533",
  },
  scroll: {
    flex: 1,
  },
});
