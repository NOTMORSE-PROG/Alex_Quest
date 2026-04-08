/**
 * MapCompletionBurst — fires a confetti burst when a chapter is newly completed.
 * Mounts an overlay outside the ScrollView, fires the cannon at the node's
 * screen position (canvas Y − scrollOffset), then unmounts after the burst.
 */
import { useEffect, useRef, useState, useCallback, type MutableRefObject } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import type { ChapterId } from "@/store/gameStore";

const { width: SW, height: SH } = Dimensions.get("window");

interface BurstTarget {
  chapterId: ChapterId;
  screenX: number;
  screenY: number;
}

interface Props {
  /** Current chapter progress snapshot — compare previous to detect new completions. */
  completedIds: ChapterId[];
  /** Canvas Y positions of each node (index = chapterId - 1). */
  nodeCanvasYs: number[];
  /** Current scroll offset from the ScrollView. */
  scrollOffsetRef: MutableRefObject<number>;
}

export function MapCompletionBurst({ completedIds, nodeCanvasYs, scrollOffsetRef }: Props) {
  const prevCompletedRef = useRef<ChapterId[]>([]);
  const [burst, setBurst] = useState<BurstTarget | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearBurst = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBurst(null);
  }, []);

  useEffect(() => {
    const prev = prevCompletedRef.current;
    const newlyCompleted = completedIds.filter((id) => !prev.includes(id));

    if (newlyCompleted.length > 0) {
      const id = newlyCompleted[0];
      const canvasY = nodeCanvasYs[id - 1] ?? 0;
      const scrollY = scrollOffsetRef.current ?? 0;
      const screenY = canvasY - scrollY;

      // Only burst if node is on screen
      if (screenY > 0 && screenY < SH) {
        setBurst({ chapterId: id, screenX: SW / 2, screenY });
        timerRef.current = setTimeout(clearBurst, 4000);
      }
    }

    prevCompletedRef.current = [...completedIds];
  }, [completedIds, nodeCanvasYs, scrollOffsetRef, clearBurst]);

  if (!burst) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <ConfettiCannon
        count={120}
        origin={{ x: burst.screenX, y: burst.screenY }}
        autoStart
        fadeOut
        explosionSpeed={380}
        fallSpeed={3200}
        colors={["#FBBF24", "#F87171", "#60A5FA", "#4ADE80", "#C084FC", "#FB923C", "#FFFFFF"]}
      />
    </View>
  );
}
