import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { AlexCharacter } from "@/components/AlexCharacter";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { colors, fonts } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";

const STEPS = [
  {
    title: "Meet Alex! 🦜",
    body: "Alex is your English learning companion. Tap him to see his reactions!",
    mood: "happy" as const,
    emoji: "👋",
  },
  {
    title: "Speak to Learn",
    body: "Answer questions by speaking out loud. Alex will score your pronunciation!",
    mood: "thinking" as const,
    emoji: "🎤",
  },
  {
    title: "Earn Stars ⭐",
    body: "Complete chapters to earn 1–3 stars. Collect XP and level up your streak!",
    mood: "cheer" as const,
    emoji: "🏆",
  },
  {
    title: "Ready to Quest?",
    body: "Help Alex navigate through 5 exciting chapters. Let's go!",
    mood: "cheer" as const,
    emoji: "🗺️",
  },
];

export default function TutorialPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { completeTutorial } = useGameStore();

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = () => {
    if (isLast) {
      completeTutorial();
      router.replace("/home");
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.bg]} />

      <MotiView
        key={step}
        from={{ opacity: 0, translateX: 40 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={styles.content}
      >
        <Text style={styles.emoji}>{current.emoji}</Text>
        <AlexCharacter mood={current.mood} variant="home" />
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
      </MotiView>

      <View style={styles.footer}>
        <ProgressDots total={STEPS.length} current={step} />
        <Pressable onPress={handleNext} style={styles.btn}>
          <Text style={styles.btnText}>{isLast ? "Let's Go! 🚀" : "Next →"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { backgroundColor: colors.navy },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  emoji: { fontSize: 48 },
  title: { fontFamily: fonts.display, fontSize: 26, color: "white", textAlign: "center" },
  body: { fontFamily: fonts.body, fontSize: 15, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 24 },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: "center",
    gap: 20,
  },
  btn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 100,
    width: "100%",
    alignItems: "center",
  },
  btnText: { fontFamily: fonts.display, fontSize: 18, color: "white" },
});
