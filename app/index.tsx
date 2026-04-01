import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { colors, fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";

export default function SplashScreen() {
  const router = useRouter();
  const { tutorialCompleted } = useGameStore();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(tutorialCompleted ? "/home" : "/tutorial");
    }, 2800);
    return () => clearTimeout(t);
  }, [tutorialCompleted, router]);

  return (
    <View style={styles.container}>
      {/* Sky gradient background */}
      <View style={[StyleSheet.absoluteFill, styles.bg]} />

      {/* Title */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 200, duration: 600, type: "timing" }}
        style={styles.titleBlock}
      >
        <Text style={styles.title}>Alex's Quest</Text>
        <Text style={styles.subtitle}>Learn English the fun way!</Text>
      </MotiView>

      {/* Alex greeting entrance */}
      <MotiView
        from={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 300, duration: 500, type: "timing" }}
        style={styles.alexWrapper}
      >
        <AlexCharacter mood="idle" variant="falling" />
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700, duration: 400, type: "timing" }}
        >
          <Text style={styles.helloText}>Hello! 👋</Text>
        </MotiView>
      </MotiView>

      {/* Loading dots */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ loop: true, duration: 1200, delay: 800, type: "timing" }}
        style={styles.dots}
      >
        <Text style={styles.dotsText}>● ● ●</Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  bg: {
    backgroundColor: colors.sky,
  },
  titleBlock: {
    alignItems: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: "white",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  alexWrapper: {
    alignItems: "center",
    gap: 8,
  },
  helloText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: "white",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    position: "absolute",
    bottom: 60,
  },
  dotsText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    letterSpacing: 6,
  },
});
