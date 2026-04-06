import { useEffect, useCallback } from "react";
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import * as NavigationBar from "expo-navigation-bar";
import { fonts } from "@/lib/theme";

interface VideoPlayerProps {
  source: number; // require() asset
  onEnd: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function VideoPlayer({ source, onEnd, onSkip, showSkip = true }: VideoPlayerProps) {
  const player = useVideoPlayer(source, (p) => {
    p.play();
  });

  const stableOnEnd = useCallback(onEnd, [onEnd]);

  // Enter immersive mode on mount, restore on unmount
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
    return () => {
      if (Platform.OS === "android") {
        NavigationBar.setVisibilityAsync("visible");
      }
    };
  }, []);

  useEffect(() => {
    const sub = player.addListener("playToEnd", () => {
      stableOnEnd();
    });
    return () => sub.remove();
  }, [player, stableOnEnd]);

  return (
    <View style={styles.container}>
      <StatusBar hidden translucent />
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
      />

      {showSkip && onSkip && (
        <Pressable onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 100,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "white",
  },
});
