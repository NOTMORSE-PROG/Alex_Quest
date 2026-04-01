import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlexCharacter } from "@/components/AlexCharacter";
import { QuestionCard } from "@/components/gameplay/QuestionCard";
import { SpeechInput } from "@/components/gameplay/SpeechInput";
import { AnswerFeedback } from "@/components/gameplay/AnswerFeedback";
import { RivalCharacter } from "@/components/gameplay/RivalCharacter";
import { ChapterIntroScene } from "@/components/gameplay/ChapterIntroScene";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { FloatingXP } from "@/components/animations/FloatingXP";
import { getChapter } from "@/lib/chaptersData";
import { scoreAnswer } from "@/lib/speechScore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useAlexAnimation } from "@/hooks/useAlexAnimation";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore, type ChapterId } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

export default function ChapterPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chapterId = Number(id) as ChapterId;
  const chapter = getChapter(chapterId);

  const { mood, celebrate, worry, think, resetMood } = useAlexAnimation();
  const { playSFX } = useAudio();
  const { completeChapter, addXP, incrementWrongAttempts, resetWrongAttempts, wrongAttempts } = useGameStore();
  const speech = useSpeechRecognition();

  const [introComplete, setIntroComplete] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [xpGain, setXpGain] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Derive question data safely (may be undefined before chapter loads)
  const questions = chapter?.questions ?? [];
  const currentQ = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  const handleAnswer = (answer: string) => {
    if (!currentQ) return;
    const score = scoreAnswer(answer, currentQ.expectedAnswer);
    const correct = score >= 0.6;

    if (correct) {
      playSFX("correct");
      celebrate();
      const xp = currentQ.xpValue;
      addXP(xp);
      setTotalXP((t) => t + xp);
      setXpGain(xp);
      setFeedback(true);
      resetWrongAttempts();
      setWrongCount(0);
      setTimeout(() => {
        setXpGain(null);
        setFeedback(null);
        if (isLast) {
          const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
          completeChapter(chapterId, stars, totalXP + xp);
          router.replace(`/reward/${chapterId}`);
        } else {
          setQIndex((i) => i + 1);
          resetMood();
          speech.reset();
        }
      }, 1800);
    } else {
      playSFX("wrong");
      worry();
      setFeedback(false);
      incrementWrongAttempts();
      setWrongCount((w) => w + 1);
      setTimeout(() => {
        setFeedback(null);
        resetMood();
        speech.reset();
      }, 2200);
    }
  };

  const handleOptionPress = (option: string) => {
    if (feedback !== null) return;
    playSFX("tap");
    think();
    handleAnswer(option);
  };

  const handleAnswerRef = useRef(handleAnswer);
  handleAnswerRef.current = handleAnswer;

  useEffect(() => {
    if (speech.state === "done" && speech.transcript && introComplete) {
      handleAnswerRef.current(speech.transcript);
    }
  }, [speech.state, speech.transcript, introComplete]);

  // Early returns after all hooks
  if (!chapter) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Chapter not found.</Text>
      </View>
    );
  }

  if (!introComplete) {
    return <ChapterIntroScene chapter={chapter} onStart={() => setIntroComplete(true)} />;
  }

  const isSpeakType = currentQ.type === "speak" || currentQ.type === "rival";
  const isChoiceType = currentQ.type === "choice" || currentQ.type === "build" || currentQ.type === "identify";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: chapter.accentColorHex + "CC" }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.navy, opacity: 0.5 }]} />

      {/* Header row */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <AlexCharacter mood={mood} variant="small" />
        <View style={styles.chapterBadge}>
          <Text style={styles.chapterEmoji}>{chapter.animalEmoji}</Text>
        </View>
      </View>

      <ProgressDots total={questions.length} current={qIndex} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Rival display for rival-type questions */}
        {currentQ.type === "rival" && (
          <MotiView
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "spring" }}
            style={styles.rivalRow}
          >
            <RivalCharacter chapterId={chapterId} />
            <View style={styles.rivalBubble}>
              <Text style={styles.rivalText}>"{currentQ.rivalLine}"</Text>
            </View>
          </MotiView>
        )}

        <QuestionCard
          question={currentQ.prompt}
          directions={currentQ.directions}
          hint={feedback === false ? currentQ.hint : undefined}
          questionNumber={qIndex + 1}
          total={questions.length}
        />

        <AnswerFeedback
          correct={feedback}
          correctAnswer={feedback === false ? currentQ.expectedAnswer : undefined}
        />

        {/* Options (choice / build / identify) */}
        {isChoiceType && currentQ.options && feedback === null && (
          <View style={styles.options}>
            {currentQ.options.map((opt) => (
              <Pressable key={opt} onPress={() => handleOptionPress(opt)} style={styles.optionBtn}>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Speech input (speak / rival) */}
        {isSpeakType && feedback === null && (
          <View style={styles.speechArea}>
            <SpeechInput
              state={speech.state}
              transcript={speech.transcript}
              interimTranscript={speech.interimTranscript}
              onStart={speech.startRecording}
              onStop={speech.stopRecording}
              error={speech.error}
            />
          </View>
        )}
      </ScrollView>

      {/* Floating XP */}
      {xpGain !== null && (
        <View style={styles.xpOverlay} pointerEvents="none">
          <FloatingXP amount={xpGain} onDone={() => setXpGain(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  error: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontFamily: fonts.body, fontSize: 16, color: colors.navy },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { padding: 8 },
  backText: { fontFamily: fonts.body, fontSize: 14, color: "white" },
  chapterBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  chapterEmoji: { fontSize: 22 },
  scroll: { paddingTop: 16, gap: 16 },
  rivalRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16 },
  rivalBubble: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 12 },
  rivalText: { fontFamily: fonts.body, fontSize: 14, color: "white", fontStyle: "italic" },
  options: { paddingHorizontal: 16, gap: 10 },
  optionBtn: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  optionText: { fontFamily: fonts.body, fontSize: 16, color: "white", textAlign: "center" },
  speechArea: { paddingHorizontal: 16, alignItems: "center" },
  xpOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
