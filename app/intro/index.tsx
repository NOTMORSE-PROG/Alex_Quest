import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { VideoPlayer } from "@/components/VideoPlayer";
import { introVideo } from "@/lib/chaptersData";
import { useGameStore } from "@/store/gameStore";

export default function IntroPage() {
  const router = useRouter();
  const { watchIntro, tutorialCompleted } = useGameStore();

  const handleDone = useCallback(() => {
    watchIntro();
    router.replace(tutorialCompleted ? "/home" : "/tutorial");
  }, [watchIntro, tutorialCompleted, router]);

  return (
    <View style={styles.container}>
      <VideoPlayer
        source={introVideo}
        onEnd={handleDone}
        onSkip={handleDone}
        showSkip
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});
