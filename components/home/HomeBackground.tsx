/**
 * HomeBackground — full-screen backdrop for the home screen.
 *
 * Picks the correct location scene based on homeLocationChapterId from
 * the game store. When null the default CityBackground is shown (pre-quest).
 * Each chapter maps to the location Alex visits in the story:
 *   null → City (default)
 *   1    → Bakery District
 *   2    → Fountain Square
 *   3    → Golden Farm
 *   4    → Ancient Forest
 *   5    → Jungle Temple
 *
 * Scenes cross-fade (500ms opacity) when chapterId changes so the
 * transition feels cinematic, not like a hard swap.
 */

import { StyleSheet, View } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { CityBackground } from "@/components/CityBackground";
import {
  BakeryScene,
  FountainScene,
  FarmScene,
  ForestScene,
  JungleScene,
} from "./scenes";
import type { ChapterId } from "@/store/gameStore";

interface HomeBackgroundProps {
  chapterId: ChapterId | null;
}

function SceneForChapter({ chapterId }: HomeBackgroundProps) {
  switch (chapterId) {
    case 1: return <BakeryScene />;
    case 2: return <FountainScene />;
    case 3: return <FarmScene />;
    case 4: return <ForestScene />;
    case 5: return <JungleScene />;
    default: return <CityBackground />;
  }
}

export function HomeBackground({ chapterId }: HomeBackgroundProps) {
  // Use chapterId as AnimatePresence key so entering/exiting scenes animate.
  const sceneKey = chapterId === null ? "city" : `ch${chapterId}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <AnimatePresence>
        <MotiView
          key={sceneKey}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={StyleSheet.absoluteFill}
        >
          <SceneForChapter chapterId={chapterId} />
        </MotiView>
      </AnimatePresence>
    </View>
  );
}
