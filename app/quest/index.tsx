import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { colors, fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";
import { useAudio } from "@/hooks/useAudio";

const STORY_BEATS = [
  {
    text: "Alex the parrot has crashed on a mysterious island far from home...",
    mood: "worried" as const,
  },
  {
    text: "The only way back is to master the local language — English!",
    mood: "thinking" as const,
  },
  {
    text: "Help Alex journey through 5 chapters and get him home!",
    mood: "happy" as const,
  },
];

export default function QuestPage() {
  const router = useRouter();
  const [beat, setBeat] = useState(0);
  const { startQuest } = useGameStore();
  const { playSFX } = useAudio();

  const isLast = beat === STORY_BEATS.length - 1;
  const current = STORY_BEATS[beat];

  const handleNext = () => {
    playSFX("tap");
    if (isLast) {
      startQuest();
      router.replace("/map");
    } else {
      setBeat((b) => b + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bg]} />

      {/* Stars background */}
      {["10%", "25%", "60%", "80%"].map((top, i) => (
        <MotiView
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ loop: true, duration: 2000 + i * 500, delay: i * 300, type: "timing" }}
          style={[styles.star, { top: top as any, left: `${20 + i * 20}%` as any }]}
        >
          <Text style={{ color: "white", fontSize: 12 }}>✦</Text>
        </MotiView>
      ))}

      <MotiView
        key={beat}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={styles.content}
      >
        <AlexCharacter mood={current.mood} variant="home" />

        <View style={styles.speechBox}>
          <Text style={styles.speechText}>{current.text}</Text>
        </View>

        <Text style={styles.beatCounter}>{beat + 1} / {STORY_BEATS.length}</Text>
      </MotiView>

      <Pressable onPress={handleNext} style={styles.btn}>
        <Text style={styles.btnText}>{isLast ? "Begin the Quest! →" : "Continue →"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { backgroundColor: "#0F0C29" },
  star: { position: "absolute" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 28,
  },
  speechBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  speechText: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: "white",
    textAlign: "center",
    lineHeight: 26,
  },
  beatCounter: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
  },
  btn: {
    backgroundColor: colors.gold,
    marginHorizontal: 32,
    marginBottom: 48,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: "center",
  },
  btnText: { fontFamily: fonts.display, fontSize: 18, color: "white" },
});
