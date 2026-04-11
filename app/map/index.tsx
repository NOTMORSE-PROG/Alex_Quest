import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRef, useState, useCallback, useEffect, memo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { AlexCharacter } from "@/components/AlexCharacter";

import { BottomNav } from "@/components/ui/BottomNav";
import { NODE_POSITIONS, CANVAS_HEIGHT, CANVAS_WIDTH } from "@/components/map/MapPath";
import { MapScrollProvider } from "@/components/map/MapScrollContext";
import { MapParallaxLayer } from "@/components/map/MapParallaxLayer";
import { MapSky } from "@/components/map/MapSky";
import { MapBiome, ZONE_BOUNDS } from "@/components/map/MapBiome";
import type { BiomeState } from "@/components/map/MapBiome";
import { MapPathV2 } from "@/components/map/MapPathV2";
import { MapAmbient } from "@/components/map/MapAmbient";
import { MapZoneMarker } from "@/components/map/MapZoneMarker";
import { StageNodeV2 } from "@/components/map/StageNodeV2";
import { StageProgressRingV2 } from "@/components/map/StageProgressRingV2";
import { MapAlexPinV2 } from "@/components/map/MapAlexPinV2";
import { MapHeader } from "@/components/map/MapHeader";
import { MapJumpButton } from "@/components/map/MapJumpButton";
import { MapChapterPopup } from "@/components/map/MapChapterPopup";
import { MapCompletionBurst } from "@/components/map/MapCompletionBurst";

import { MotiView } from "moti";
import { fonts } from "@/lib/theme";
import { chapters } from "@/lib/chaptersData";
import type { Chapter } from "@/lib/chaptersData";
import { useGameStore, isChapterUnlocked, type ChapterId } from "@/store/gameStore";
import { useAudio } from "@/hooks/useAudio";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";

const { height: SCREEN_H } = Dimensions.get("window");
const AnimatedScrollView = Animated.ScrollView;

const CHAPTER_NAMES: Record<number, string> = {
  1: "The Bakery District",
  2: "The Fountain Square",
  3: "The Forest Trail",
  4: "The Farm Fields",
  5: "The Enchanted Forest",
};

// Chapter accent colors for passing to MapAlexPinV2
const CHAPTER_ACCENTS: Record<number, string> = {
  1: "#D97706",
  2: "#0EA5E9",
  3: "#16A34A",
  4: "#CA8A04",
  5: "#22C55E",
};

// ─────────────────────────────────────────────────────────────────────────────
// Memoized node row — prevents re-render during scroll
// ─────────────────────────────────────────────────────────────────────────────
interface NodeRowProps {
  chapter: Chapter;
  isUnlocked: boolean;
  isActive: boolean;
  isCompleted: boolean;
  ringProgress: number;
  onPress: (chapter: Chapter) => void;
}

const NodeRow = memo(function NodeRow({
  chapter,
  isUnlocked,
  isActive,
  isCompleted,
  ringProgress,
  onPress,
}: NodeRowProps) {
  const nodePos = NODE_POSITIONS[chapter.id - 1];
  return (
    <View
      style={{
        position: "absolute",
        left: nodePos.x - 56,
        top: nodePos.y - 56,
        width: 112,
        alignItems: "center",
      }}
    >
      {(isActive || isCompleted) && (
        <StageProgressRingV2
          progress={ringProgress}
          color={chapter.accentColorHex}
          size={112}
        />
      )}
      <StageNodeV2
        chapter={chapter}
        isUnlocked={isUnlocked}
        isActive={isActive}
        isCompleted={isCompleted}
        onPress={onPress}
      />
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function MapPage() {
  const router = useRouter();
  const { from: fromParam } = useLocalSearchParams<{ from?: string }>();
  const { playSFX } = useAudio();
  const { playTrack } = useMusicPlayer();

  useEffect(() => {
    playTrack("map");
  }, [playTrack]);

  const {
    currentChapter,
    chapterProgress,
    setCurrentChapter,
    setHomeLocation,
    activeChapterId,
    activeQuestionIndex,
  } = useGameStore();

  // ── Walking cutscene (runs on the live map instead of a separate screen) ──
  const fromChapterId = fromParam ? Number(fromParam) : null;
  const [walkPhase, setWalkPhase] = useState<"idle" | "walking" | "arrived">(
    fromChapterId ? "walking" : "idle"
  );
  const [walkReady, setWalkReady] = useState(false);
  const walkX = useSharedValue(0);
  const walkY = useSharedValue(0);

  const walkStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: 0,
    top: 0,
    transform: [
      { translateX: walkX.value - 24 },
      { translateY: walkY.value - 52 },
    ],
  }));

  // Reanimated shared value for parallax
  const scrollY = useSharedValue(0);
  const scrollOffsetRef = useRef<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollRef = useRef<any>(null);
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const [headerBgOpacity, setHeaderBgOpacity] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // JS callbacks for state updates (called via runOnJS from worklet)
  const updateScrollState = useCallback((y: number) => {
    scrollOffsetRef.current = y;
    const currentNodeY = NODE_POSITIONS[currentChapter - 1].y;
    const isVisible = y < currentNodeY + 80 && y + SCREEN_H > currentNodeY - 80;
    setShowJumpBtn((prev) => {
      const next = !isVisible;
      return prev === next ? prev : next;
    });
    const newOpacity = Math.round(Math.min(y / 80, 1) * 0.72 * 20) / 20;
    setHeaderBgOpacity((prev) => (prev === newOpacity ? prev : newOpacity));
  }, [currentChapter]);

  // Animated scroll handler (runs on UI thread, updates sharedValue + JS state)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      "worklet";
      scrollY.value = event.contentOffset.y;
      runOnJS(updateScrollState)(event.contentOffset.y);
    },
  });

  // Auto-scroll to current chapter node on mount (skip when walking cutscene handles it)
  useEffect(() => {
    if (fromChapterId) return;
    const nodePos = NODE_POSITIONS[currentChapter - 1];
    const targetY = Math.max(0, nodePos.y - SCREEN_H * 0.5);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 450);
  }, [currentChapter]); // eslint-disable-line

  // Walking cutscene: animate Alex from old pin to new pin on the live map
  useEffect(() => {
    if (!fromChapterId) return;
    const fromPos = NODE_POSITIONS[fromChapterId - 1];
    const toPos = NODE_POSITIONS[currentChapter - 1];

    const midCanvasY = (fromPos.y + toPos.y) / 2;
    const scrollTop = Math.max(0, midCanvasY - SCREEN_H * 0.55);

    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: scrollTop, animated: false });
    }, 60);

    const fromSX = fromPos.x;
    const fromSY = fromPos.y - scrollTop;
    const toSX = toPos.x;
    const toSY = toPos.y - scrollTop;

    walkX.value = fromSX;
    walkY.value = fromSY;
    setWalkReady(true);

    const t = setTimeout(() => {
      walkX.value = withTiming(toSX, { duration: 2200 });
      walkY.value = withTiming(toSY, { duration: 2200 }, (finished) => {
        if (finished) runOnJS(setWalkPhase)("arrived");
      });
    }, 500);

    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  // After "arrived" toast shows, clean up and scroll to current node
  useEffect(() => {
    if (walkPhase !== "arrived") return;
    const t = setTimeout(() => {
      setWalkPhase("idle");
      const nodePos = NODE_POSITIONS[currentChapter - 1];
      const targetY = Math.max(0, nodePos.y - SCREEN_H * 0.5);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 2600);
    return () => clearTimeout(t);
  }, [walkPhase, currentChapter]);

  const jumpToCurrent = useCallback(() => {
    const nodePos = NODE_POSITIONS[currentChapter - 1];
    const targetY = Math.max(0, nodePos.y - SCREEN_H * 0.5);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [currentChapter]);

  const handleNodePress = useCallback((chapter: Chapter) => {
    playSFX("click");
    setSelectedChapter(chapter);
  }, [playSFX]);

  const handlePopupStart = useCallback(() => {
    if (!selectedChapter) return;
    const id = selectedChapter.id as ChapterId;
    setSelectedChapter(null);
    setCurrentChapter(id);
    setHomeLocation(id); // Update home background to reflect the accepted quest's location
    router.push(`/lesson/${id}`);
  }, [selectedChapter, setCurrentChapter, setHomeLocation, router]);

  const completedSegments = (Object.keys(chapterProgress) as unknown as ChapterId[]).filter(
    (id) => chapterProgress[id].completed
  ).length;

  const getChapterProgress = useCallback((chId: number): number => {
    const ch = chapters.find((c) => c.id === chId);
    if (!ch) return 0;
    if (chapterProgress[chId as ChapterId]?.completed) return 1;
    if (activeChapterId === chId) return activeQuestionIndex / ch.questions.length;
    return 0;
  }, [chapterProgress, activeChapterId, activeQuestionIndex]);

  const getBiomeState = useCallback((zoneIndex: number): BiomeState => {
    // zoneIndex 0=Bakery(ch1)...4=Jungle(ch5); chapters are 1-indexed
    const chapterId = (zoneIndex + 1) as ChapterId;
    if (chapterProgress[chapterId]?.completed) return "completed";
    const unlocked = isChapterUnlocked(chapterId, chapterProgress);
    if (unlocked) return "active";
    return "locked";
  }, [chapterProgress]);

  // Collect completed IDs for CompletionBurst
  const completedIds = (Object.keys(chapterProgress) as unknown as ChapterId[]).filter(
    (id) => chapterProgress[id].completed
  );

  const nodeCanvasYs = NODE_POSITIONS.map((p) => p.y);

  const currentPos = NODE_POSITIONS[currentChapter - 1];

  return (
    <MapScrollProvider value={scrollY}>
      <View style={styles.root}>
        {/* ─── Scrollable world canvas ─── */}
        <AnimatedScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT + 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* ── Sky background (very subtle parallax — scrolls 8% slower than content) ── */}
          <MapParallaxLayer factor={0.92}>
            <MapSky />
          </MapParallaxLayer>

          {/* ── Biome illustrated zones (normal scroll, no drift) ── */}
          {ZONE_BOUNDS.map((z) => (
            <MapBiome
              key={z.zone}
              zone={z.zone}
              state={getBiomeState(z.zone)}
              y={z.y}
              height={z.height}
            />
          ))}

          {/* ── Quest path ── */}
          <MapPathV2 completedSegments={completedSegments} />

          {/* ── Ambient loops (fireflies, smoke, birds, leaves, drops) ── */}
          <MapAmbient />

          {/* ── Zone name signposts ── */}
          <MapZoneMarker />

          {/* ── Stage nodes ── */}
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

          {/* ── Alex pin on current stage (hidden during walk cutscene) ── */}
          {walkPhase === "idle" && (
            <MapAlexPinV2
              x={currentPos.x}
              y={currentPos.y}
              accentColor={CHAPTER_ACCENTS[currentChapter]}
            />
          )}
        </AnimatedScrollView>

        {/* ─── Fixed overlays (outside scroll) ─── */}
        <MapHeader bgOpacity={headerBgOpacity} />
        <MapJumpButton visible={walkPhase === "idle" && showJumpBtn} onPress={jumpToCurrent} />

        {/* ─── Walking cutscene overlay ─── */}
        {walkPhase !== "idle" && walkReady && (
          <Animated.View style={walkStyle} pointerEvents="none">
            <AlexCharacter
              mood={walkPhase === "arrived" ? "cheer" : "happy"}
              variant="small"
            />
          </Animated.View>
        )}

        {/* ─── Stage unlocked toast (shown when Alex arrives) ─── */}
        {walkPhase === "arrived" && fromChapterId && (
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            style={styles.journeyToast}
            pointerEvents="none"
          >
            <Text style={styles.journeyToastEmoji}>🎉</Text>
            <Text style={styles.journeyToastTitle}>
              Stage {Math.min(fromChapterId + 1, 5)} Unlocked!
            </Text>
            <Text style={styles.journeyToastSub}>
              {CHAPTER_NAMES[Math.min(fromChapterId + 1, 5)]}
            </Text>
          </MotiView>
        )}

        {/* ─── Chapter popup ─── */}
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

        {/* ─── Completion confetti burst ─── */}
        <MapCompletionBurst
          completedIds={completedIds}
          nodeCanvasYs={nodeCanvasYs}
          scrollOffsetRef={scrollOffsetRef}
        />

        {/* ─── Bottom nav ─── */}
        <BottomNav />
      </View>
    </MapScrollProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b001f",
  },
  scroll: {
    flex: 1,
  },
  journeyToast: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 12,
    zIndex: 100,
  },
  journeyToastEmoji: { fontSize: 36 },
  journeyToastTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: "#1F2937",
    textAlign: "center",
  },
  journeyToastSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});
