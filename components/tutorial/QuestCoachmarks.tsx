/**
 * QuestCoachmarks — one-time overlay shown the first time a child enters a chapter.
 * Walks through 4 steps explaining the UI elements they'll use.
 */
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

interface Props {
  visible: boolean;
  onDone: () => void;
}

const STEPS = [
  {
    emoji: "👂",
    title: "Listen First",
    body: 'Tap the "👂" button to hear the question read out loud. You can tap it as many times as you need!',
  },
  {
    emoji: "📖",
    title: "Check the Story",
    body: 'Tap the "📖" icon at the top of the question card to re-read the chapter story anytime you forget what\'s happening.',
  },
  {
    emoji: "🎤",
    title: "Speak Your Answer",
    body: "Press and hold the big microphone button, say your answer out loud, then let go. Alex will score your answer!",
  },
  {
    emoji: "⭐",
    title: "Keep Going!",
    body: "Answer all the questions to complete the chapter. Even if you get one wrong, you can try again. Good luck!",
  },
];

export function QuestCoachmarks({ visible, onDone }: Props) {
  const [step, setStep] = useState(0);
  // Clamp step in case state is preserved across hot-reloads or STEPS length changes
  const safeStep = Math.min(step, STEPS.length - 1);
  const current = STEPS[safeStep];
  const isLast = safeStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDone();
    } else {
      setStep(safeStep + 1);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <MotiView
          key={safeStep}
          from={{ opacity: 0, scale: 0.92, translateY: 16 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          style={styles.card}
        >
          <Text style={styles.emoji}>{current.emoji}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>

          {/* Dots */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === safeStep && styles.dotActive]}
              />
            ))}
          </View>

          <Pressable onPress={handleNext} style={styles.btn}>
            <Text style={styles.btnText}>
              {isLast ? "Got it! Let's play!" : "Next"}
            </Text>
          </Pressable>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,10,30,0.78)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 28,
    width: "100%",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 14,
  },
  emoji: {
    fontSize: 52,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.navy,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: `${colors.navy}BB`,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.navy}22`,
  },
  dotActive: {
    backgroundColor: colors.gold,
    width: 22,
  },
  btn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 100,
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: "white",
  },
});
