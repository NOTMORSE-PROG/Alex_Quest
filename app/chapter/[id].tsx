import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system/legacy";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { Audio } from "expo-av";
import { AlexCharacter } from "@/components/AlexCharacter";
import { QuestionCard } from "@/components/gameplay/QuestionCard";
import { SpeechInput } from "@/components/gameplay/SpeechInput";
import { AnswerFeedback } from "@/components/gameplay/AnswerFeedback";
import { RivalChat, type RivalMessage } from "@/components/gameplay/RivalChat";
import { ChapterIntroScene } from "@/components/gameplay/ChapterIntroScene";
import { QuestCoachmarks } from "@/components/tutorial/QuestCoachmarks";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { MuteButton } from "@/components/ui/GameHeader";
import { getChapter } from "@/lib/chaptersData";
import { useAudioRecorder, cleanupAudioFile } from "@/hooks/useAudioRecorder";
import { useAlexAnimation } from "@/hooks/useAlexAnimation";
import { useAudio } from "@/hooks/useAudio";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { loadDictionary } from "@/lib/cmuDictionary";
import { assessAnswer, buildSimpleResult } from "@/lib/assessmentEngine";
import { useGameStore, type ChapterId } from "@/store/gameStore";
import { useWhisper, getLastTranscribe } from "@/hooks/useWhisper";
import { colors, fonts } from "@/lib/theme";
import { RECORDING_TIMEOUT_MS } from "@/lib/config";
import type { AssessmentResult } from "@/types/assessment";

const TAG = "[ChapterPage]";

/**
 * Returns a device-specific settings path hint for the no-speech error banner.
 * Uses the Android device model string to infer the manufacturer.
 */
function getOEMPermissionHint(): string {
  if (Platform.OS !== "android") return "";
  const model = ((Platform.constants as { Model?: string }).Model ?? "").toLowerCase();
  if (model.includes("oppo") || model.includes("reno") || model.includes("realme")) {
    return "On Oppo/realme: Settings \u2192 Privacy \u2192 Permission manager \u2192 Microphone";
  }
  if (model.includes("xiaomi") || model.includes("redmi") || model.includes("poco")) {
    return "On Xiaomi: Security app \u2192 Permissions \u2192 Microphone";
  }
  if (model.includes("vivo")) {
    return "On Vivo: Settings \u2192 Privacy \u2192 Permissions \u2192 Microphone";
  }
  if (model.startsWith("sm-") || model.includes("samsung") || model.includes("galaxy")) {
    return "On Samsung: Settings \u2192 Apps \u2192 Alex\u2019s Quest \u2192 Permissions";
  }
  return "Settings \u2192 Apps \u2192 Alex\u2019s Quest \u2192 Permissions";
}

export default function ChapterPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chapterId = Number(id) as ChapterId;
  const chapter = getChapter(chapterId);

  const { mood, celebrate, worry, resetMood } = useAlexAnimation();
  const { playSFX, playCompliment } = useAudio();
  const { playTrack, pauseTrack, resumeTrack } = useMusicPlayer();
  const {
    completeChapter,
    saveQuestionScore,
    incrementAttemptCount,
    attemptCounts,
    saveRecordingPath,
    activeQuestionIndex,
    activeChapterId,
    setActiveQuestion,
    questTutorialSeen,
    markQuestTutorialSeen,
  } = useGameStore();

  const recorder = useAudioRecorder();
  const whisper = useWhisper();

  // Resume if we have saved progress for this exact chapter
  const isResuming = activeChapterId === chapterId && activeQuestionIndex > 0;

  const [introComplete, setIntroComplete] = useState(isResuming);
  const [qIndex, setQIndex] = useState(isResuming ? activeQuestionIndex : 0);
  const [feedback, setFeedback] = useState<AssessmentResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  // "no-speech" shown when Whisper returns empty — user must try again
  const [noSpeechError, setNoSpeechError] = useState(false);
  // Multi-phase loading label during assessment
  type AnalyzePhase = "transcribing" | "scoring" | null;
  const [analyzePhase, setAnalyzePhase] = useState<AnalyzePhase>(null);

  // Auto-stop recording after timeout
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quest coachmarks: show once when intro is done and tutorial hasn't been seen
  const [showCoachmarks, setShowCoachmarks] = useState(false);

  useEffect(() => {
    if (introComplete && !questTutorialSeen) {
      setShowCoachmarks(true);
    }
  }, [introComplete, questTutorialSeen]);

  // Rival chat conversation thread
  const [rivalMessages, setRivalMessages] = useState<RivalMessage[]>([]);
  const [rivalOpeningTyping, setRivalOpeningTyping] = useState(false);
  const [rivalPromptVisible, setRivalPromptVisible] = useState(false);

  // Derive question data
  const questions = chapter?.questions ?? [];
  const currentQ = questions[qIndex];
  const isLast = qIndex === questions.length - 1;
  const attemptKey = `${chapterId}-${currentQ?.id ?? 0}`;
  const currentAttemptCount = attemptCounts[attemptKey] ?? 0;

  // Orchestrated reveal: typing → wrong sentence bubble → centre popup
  useEffect(() => {
    if (currentQ?.type !== "rival" || !currentQ.rivalLine) return;

    setRivalMessages([]);
    setRivalOpeningTyping(true);
    setRivalPromptVisible(false);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Beat 1: after 1600ms of typing, drop the wrong sentence
    timers.push(setTimeout(() => {
      setRivalMessages([{ role: "rival", text: currentQ.rivalLine! }]);
      setRivalOpeningTyping(false);
    }, 1600));

    // Beat 2: 1000ms after the bubble lands, show the centre popup
    timers.push(setTimeout(() => {
      setRivalPromptVisible(true);
    }, 2600));

    // Beat 3: auto-dismiss after 5s of being visible
    timers.push(setTimeout(() => {
      setRivalPromptVisible(false);
    }, 7600));

    return () => timers.forEach(clearTimeout);
  }, [currentQ?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start background music when chapter begins
  useEffect(() => {
    if (introComplete) {
      playTrack("quest");
    }
  }, [introComplete, playTrack]);

  // Request mic permissions and load dictionary when chapter starts
  useEffect(() => {
    if (!introComplete) return;

    async function setup() {
      console.log(`${TAG} setup — requesting mic permission`);

      // Check current permission state first (Android 11+ can auto-revoke
      // or permanently deny without showing a dialog on subsequent requests).
      const [existingSpeech, existingAv] = await Promise.all([
        ExpoSpeechRecognitionModule.getPermissionsAsync(),
        Audio.getPermissionsAsync(),
      ]);

      const permanentlyDenied =
        (existingSpeech.status === "denied" && !existingSpeech.canAskAgain) ||
        (existingAv.status === "denied" && !existingAv.canAskAgain);

      if (permanentlyDenied) {
        // Permission was permanently denied or auto-revoked (Android 12+).
        // requestPermissionsAsync() won't show a dialog, so guide the user
        // to system Settings instead.
        Alert.alert(
          "Microphone Required",
          "Microphone access was turned off. Please enable it in Settings \u2192 Apps \u2192 Alex\u2019s Quest \u2192 Permissions.",
          [
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            { text: "Go Back", onPress: () => router.back() },
          ]
        );
        return;
      }

      // Request BOTH expo-speech-recognition and expo-av mic permissions.
      // On stricter Android ROMs (Oppo ColorOS, MIUI, FunTouch) a grant to one
      // native module does not always propagate to the other, so the recorder
      // (expo-av) can still be denied even after the speech module is granted.
      const [{ status }, avPerm] = await Promise.all([
        ExpoSpeechRecognitionModule.requestPermissionsAsync(),
        Audio.requestPermissionsAsync(),
      ]);
      if (status !== "granted" || !avPerm.granted) {
        Alert.alert(
          "Microphone Required",
          "Please allow microphone access in Settings so you can speak your answers.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }
      console.log(`${TAG} mic permission granted`);
      loadDictionary();

      // Ensure recordings directory exists
      const dir = `${FileSystem.documentDirectory}recordings/`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }

    setup();
    // NOTE: clearSessionScores() intentionally NOT called here.
    // Question scores are keyed by chapterId-questionId so replaying a chapter
    // naturally overwrites. Clearing all scores would destroy cross-chapter badge data.
  }, [introComplete, router]);

  // Cleanup recording timeout on unmount
  useEffect(() => {
    return () => {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  // Get current hint based on attempt count
  const getCurrentHint = useCallback(() => {
    if (!currentQ) return undefined;
    if (currentAttemptCount >= 3) return currentQ.hint3 ?? currentQ.hint2 ?? currentQ.hint;
    if (currentAttemptCount >= 2) return currentQ.hint2 ?? currentQ.hint;
    if (currentAttemptCount >= 1) return currentQ.hint;
    return undefined;
  }, [currentQ, currentAttemptCount]);

  // ── Core assessment handler ───────────────────────────────────────
  const handleAssess = useCallback(async (audioUri: string | null) => {
    if (!currentQ || feedback) return;

    // ── Guard: no audio captured ──
    if (!audioUri) {
      setNoSpeechError(true);
      return;
    }

    // ── Guard: audio file too small to contain real speech ──
    // Android m4a @64kbps ≈ 8KB/s; iOS WAV @16kHz ≈ 32KB/s.
    // Under 8KB means a failed or sub-0.5s recording — skip Whisper.
    try {
      const info = await FileSystem.getInfoAsync(audioUri);
      if (info.exists && "size" in info && typeof info.size === "number" && info.size < 8_000) {
        console.warn(`${TAG} audio file too small (${info.size} bytes), profile=${recorder.profileUsed} — marking profile failed`);
        // Mark this recording profile as broken on this device so the next
        // attempt automatically uses the next fallback (e.g. WAV instead of M4A).
        recorder.markProfileFailed();
        setNoSpeechError(true);
        cleanupAudioFile(audioUri);
        return;
      }
    } catch { /* non-critical — proceed to assess */ }

    setIsAnalyzing(true);
    setNoSpeechError(false);
    console.log(`${TAG} handleAssess — qType=${currentQ.type} audioUri=${audioUri}`);

    const expected =
      currentQ.type === "build" && currentQ.fullSentenceExpected
        ? currentQ.fullSentenceExpected
        : currentQ.expectedAnswer;

    // Whisper transcription with 15-second timeout to prevent hangs on slow devices
    const transcribeWithTimeout = (uri: string, opts?: { prompt?: string; permissive?: boolean }) =>
      Promise.race([
        whisper.transcribe(uri, opts),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Transcription timed out")), 15_000)
        ),
      ]);

    // Whisper MUST be ready to evaluate any answer. Without a working speech-
    // recognition context every comparison runs against an empty transcript and
    // marks the user wrong even when they answered correctly. Surface a
    // no-speech-style error and don't burn an attempt.
    if (!whisper.isReady) {
      console.warn(`${TAG} whisper not ready (error=${whisper.error ?? "loading"}) — aborting assess`);
      setIsAnalyzing(false);
      setAnalyzePhase(null);
      setNoSpeechError(true);
      cleanupAudioFile(audioUri);
      return;
    }

    let result: AssessmentResult;
    let rivalTranscript = ""; // captured for chat update on rival questions

    try {
      // ── identify: simple YES/NO check, no phoneme assessment ──
      if (currentQ.type === "identify") {
        setAnalyzePhase("transcribing");
        // Permissive mode + "yes no" prompt — single-syllable answers need
        // looser thresholds and a hint to avoid being classified as silence.
        const wr = await transcribeWithTimeout(audioUri, {
          prompt: "yes no",
          permissive: true,
        });
        const transcript = wr?.text ?? "";
        console.log(`${TAG} identify transcript="${transcript}" expected="${expected}"`);

        // Empty transcript — Whisper couldn't hear it. Don't burn an attempt
        // and don't pretend the user answered wrong. Show the no-speech UI.
        if (!transcript.trim()) {
          const fInfo = await FileSystem.getInfoAsync(audioUri).catch(() => null);
          console.warn(`${TAG} identify Whisper returned empty — fileSize=${fInfo && 'size' in fInfo ? fInfo.size : '?'} profile=${recorder.profileUsed} peakDb=${recorder.peakDb}`);
          setIsAnalyzing(false);
          setAnalyzePhase(null);
          setNoSpeechError(true);
          cleanupAudioFile(audioUri);
          return;
        }

        // We have content — increment attempt and score.
        incrementAttemptCount(chapterId, currentQ.id);
        const spoken = transcript.toLowerCase().trim();
        const exp = expected.toLowerCase().trim();
        const passed =
          (spoken.includes("yes") && exp === "yes") ||
          (spoken.includes("no") && exp === "no") ||
          spoken === exp;
        result = buildSimpleResult(passed, transcript, expected);
        console.log(`${TAG} identify result — passed=${passed}`);
      }
      // ── all other types: full phoneme assessment ──
      else {
        console.log(`${TAG} using Whisper for assessment`);
        setAnalyzePhase("transcribing");
        const whisperResult = await transcribeWithTimeout(audioUri);

        // Empty transcript — Whisper couldn't hear speech. Don't count as attempt.
        if (!whisperResult || !whisperResult.text.trim()) {
          const fInfo2 = await FileSystem.getInfoAsync(audioUri).catch(() => null);
          console.warn(`${TAG} Whisper returned empty — fileSize=${fInfo2 && 'size' in fInfo2 ? fInfo2.size : '?'} profile=${recorder.profileUsed} peakDb=${recorder.peakDb}`);
          setIsAnalyzing(false);
          setAnalyzePhase(null);
          setNoSpeechError(true);
          cleanupAudioFile(audioUri);
          return;
        }

        // Capture transcript for the rival chat thread
        if (currentQ.type === "rival") rivalTranscript = whisperResult.text.trim();

        // We have content — increment attempt and score
        setAnalyzePhase("scoring");
        const newAttemptCount = incrementAttemptCount(chapterId, currentQ.id);
        result = assessAnswer(
          whisperResult,
          expected,
          currentQ.acceptableAnswers,
          currentQ.type,
          newAttemptCount - 1
        );
        console.log(`${TAG} Whisper assessment — passed=${result.passed} score=${result.overallScore}`);
      }
    } catch (e) {
      console.error(`${TAG} assessment threw:`, e);
      // Don't burn an attempt on a technical failure — show no-speech UI.
      setIsAnalyzing(false);
      setAnalyzePhase(null);
      setNoSpeechError(true);
      cleanupAudioFile(audioUri);
      return;
    } finally {
      setIsAnalyzing(false);
      setAnalyzePhase(null);
    }

    // Save recording for playback
    if (audioUri) {
      try {
        const destPath = `${FileSystem.documentDirectory}recordings/${chapterId}_q${currentQ.id}.m4a`;
        await FileSystem.copyAsync({ from: audioUri, to: destPath });
        setRecordingUri(destPath);
        saveRecordingPath(chapterId, currentQ.id, destPath);
        console.log(`${TAG} recording saved to ${destPath}`);
      } catch (e) {
        console.warn(`${TAG} failed to save recording:`, e);
        setRecordingUri(audioUri); // use temp uri as fallback
      }
      cleanupAudioFile(audioUri);
    }

    saveQuestionScore(chapterId, currentQ.id, result);

    if (currentQ.type === "rival" && rivalTranscript) {
      // Step 1 (immediate): student bubble animates in
      setRivalMessages(prev => [
        ...prev,
        { role: "student", text: rivalTranscript },
      ]);

      // Step 2 (1000ms): rival starts typing
      setTimeout(() => setRivalOpeningTyping(true), 1000);

      // Step 3 (2600ms): rival reaction pops in after ~1.6s of typing
      setTimeout(() => {
        setRivalMessages(prev => [
          ...prev,
          {
            role: "rival",
            text: result.passed
              ? (currentQ.rivalReactPass ?? "Okay, you're right.")
              : (currentQ.rivalReactFail ?? "Ha! Try again."),
          },
        ]);
        setRivalOpeningTyping(false);
      }, 2600);

      // Step 4 (3200ms): assessment shows after rival has finished reacting
      setTimeout(() => setFeedback(result), 3200);
    } else {
      setFeedback(result);
    }

    if (result.passed) {
      playSFX("correct");
      celebrate();
      setTimeout(() => playCompliment(), 400);
    } else {
      playSFX("wrong");
      worry();
    }
  }, [
    currentQ, feedback, whisper, recorder, chapterId,
    incrementAttemptCount, saveQuestionScore, saveRecordingPath,
    playSFX, playCompliment, celebrate, worry,
  ]);

  // ── Recording controls ────────────────────────────────────────────
  const handleStartRecording = useCallback(async () => {
    if (isRecording || isAnalyzing) return;
    console.log(`${TAG} handleStartRecording`);
    setRecordingUri(null);
    setNoSpeechError(false);
    pauseTrack();
    await recorder.startRecording();
    setIsRecording(true);

    // Auto-stop after timeout so kids don't get stuck with mic open
    recordingTimeoutRef.current = setTimeout(() => {
      console.log(`${TAG} recording auto-timeout reached`);
      handleStopRecordingRef.current?.();
    }, RECORDING_TIMEOUT_MS);
  }, [isRecording, isAnalyzing, recorder, pauseTrack]);

  // Use a ref so the timeout callback always calls the latest version
  const handleStopRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const handleStopRecording = useCallback(async () => {
    if (!isRecording) return;
    console.log(`${TAG} handleStopRecording`);

    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    setIsRecording(false);
    const audioUri = await recorder.stopRecording();
    console.log(`${TAG} audio captured — uri=${audioUri}`);
    await handleAssess(audioUri);
    resumeTrack();
  }, [isRecording, recorder, handleAssess, resumeTrack]);

  // Keep ref in sync with latest callback
  useEffect(() => {
    handleStopRecordingRef.current = handleStopRecording;
  }, [handleStopRecording]);

  // ── Try Again ─────────────────────────────────────────────────────
  const handleTryAgain = useCallback(() => {
    setFeedback(null);
    setRecordingUri(null);
    setNoSpeechError(false);
    resetMood();
  }, [resetMood]);

  // ── Listen (TTS) ──────────────────────────────────────────────────
  const handleListen = useCallback(() => {
    if (!currentQ) return;
    const text =
      currentQ.type === "build" && currentQ.fullSentenceExpected
        ? currentQ.fullSentenceExpected
        : currentQ.expectedAnswer;
    Speech.speak(text, { language: "en-US", rate: 0.85 });
  }, [currentQ]);

  // ── Advance to next question or finish chapter ─────────────────────
  const handleNext = useCallback(() => {
    setFeedback(null);
    setRecordingUri(null);
    setNoSpeechError(false);
    if (isLast) {
      completeChapter(chapterId);
      setActiveQuestion(0, chapterId);
      router.replace(`/reward/${chapterId}`);
    } else {
      const next = qIndex + 1;
      setQIndex(next);
      setActiveQuestion(next, chapterId);
      resetMood();
    }
  }, [isLast, qIndex, chapterId, completeChapter, setActiveQuestion, router, resetMood]);

  // ── Back button with confirmation ─────────────────────────────────
  const handleBack = useCallback(async () => {
    if (isRecording) {
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      await recorder.stopRecording();
      setIsRecording(false);
    }
    Alert.alert(
      "Leave Chapter?",
      "Your progress is saved. You can continue later.",
      [
        { text: "Stay", style: "cancel" },
        { text: "Leave", style: "destructive", onPress: () => router.back() },
      ]
    );
  }, [isRecording, recorder, router]);

  // Derive speech state for SpeechInput display
  const speechState = isAnalyzing ? "processing" : isRecording ? "recording" : "idle";

  // ── Render ────────────────────────────────────────────────────────

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: chapter.accentColorHex + "CC" }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.navy, opacity: 0.5 }]} />

      {/* Header row */}
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <AlexCharacter mood={mood} variant="small" />
        <View style={styles.topBarRight}>
          <MuteButton />
          <View style={styles.chapterBadge}>
            <Text style={styles.chapterEmoji}>{chapter.animalEmoji}</Text>
          </View>
        </View>
      </View>

      <ProgressDots total={questions.length} current={qIndex} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Rival questions: chat conversation UI */}
        {currentQ.type === "rival" ? (
          <>
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={styles.rivalChatHeader}
            >
              <View style={styles.rivalChatDirectionsRow}>
                <Text style={styles.rivalChatDirectionsIcon}>🎤</Text>
                <Text style={styles.rivalChatDirections}>{currentQ.directions}</Text>
              </View>
            </MotiView>
            <RivalChat
              messages={rivalMessages}
              chapterId={chapterId}
              isWaiting={rivalOpeningTyping}
              isStudentProcessing={isAnalyzing}
            />
          </>
        ) : (
          <QuestionCard
            question={currentQ.prompt}
            directions={currentQ.directions}
            questionNumber={qIndex + 1}
            total={questions.length}
            options={currentQ.type === "choice" ? currentQ.options : undefined}
            blank={currentQ.type === "build" ? currentQ.blank : undefined}
            targetSentence={currentQ.targetSentence}
            listenText={
              currentQ.type === "build" && currentQ.fullSentenceExpected
                ? currentQ.fullSentenceExpected
                : currentQ.expectedAnswer
            }
            story={chapter.story}
          />
        )}

        {/* Assessment Feedback */}
        <AnswerFeedback
          result={feedback}
          hint={getCurrentHint()}
          recordingUri={recordingUri}
          onTryAgain={feedback && !feedback.passed ? handleTryAgain : undefined}
          onListen={
            feedback && !feedback.passed &&
            (currentQ?.type === 'identify' || currentAttemptCount >= 2)
              ? handleListen
              : undefined
          }
          onNext={feedback?.passed ? handleNext : undefined}
          isLastQuestion={isLast}
        />

        {/* Speech Input — hidden while feedback is showing */}
        {feedback === null && (
          <View style={styles.speechArea}>
            {/* Whisper status banner */}
            {whisper.isLoading && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.whisperBanner}
              >
                <Text style={styles.whisperBannerText}>Setting up speech engine…</Text>
              </MotiView>
            )}
            {!whisper.isReady && !whisper.isLoading && whisper.error && (
              <Pressable onPress={whisper.retry} style={styles.whisperBanner}>
                <Text style={styles.whisperBannerText}>
                  Speech engine failed to load. Tap to retry.
                </Text>
              </Pressable>
            )}

            {/* No-speech error */}
            {noSpeechError && (
              <MotiView
                from={{ opacity: 0, translateY: -6 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={styles.noSpeechBanner}
              >
                <Text style={styles.noSpeechText}>
                  We couldn't hear you — please speak louder and try again!
                </Text>

                {/* Android 12+ microphone privacy toggle — the system silences
                    recording without error when the Quick Settings mic toggle is
                    off. checkSelfPermission() still returns GRANTED. */}
                {Platform.OS === "android" && recorder.peakDb < -50 && (
                  <Text style={styles.noSpeechDebug}>
                    Tip: Swipe down from the top of your screen. If you see a
                    microphone icon with a line through it, tap it to unmute
                    your microphone.
                  </Text>
                )}

                {/* OEM-specific permissions path */}
                <Text style={styles.noSpeechDebug}>
                  {recorder.error
                    ? `Mic blocked — ${getOEMPermissionHint()}`
                    : getOEMPermissionHint()}
                </Text>

                {/* Dev diagnostic */}
                {__DEV__ && recorder.profileUsed ? (
                  <Text style={styles.noSpeechDebug}>
                    Profile: {recorder.profileUsed} | Peak: {recorder.peakDb.toFixed(0)}dB
                    {'\n'}Whisper: {getLastTranscribe()?.outcome ?? 'n/a'} — "{getLastTranscribe()?.text ?? ''}"
                  </Text>
                ) : null}
              </MotiView>
            )}

            {/* Real-time silence warning — shown while recording if mic hears nothing */}
            {isRecording && recorder.silenceDetected && !noSpeechError && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.silenceHint}
              >
                <Text style={styles.silenceHintText}>
                  Speak a bit louder!
                </Text>
              </MotiView>
            )}

            <SpeechInput
              state={speechState}
              transcript=""
              interimTranscript=""
              onStart={handleStartRecording}
              onStop={handleStopRecording}
              error={recorder.error}
              questionType={currentQ.type}
              isAnalyzing={isAnalyzing}
              analyzePhase={analyzePhase}
            />
          </View>
        )}
      </ScrollView>

      {/* Rival prompt popup — floats in the centre of the screen */}
      {currentQ.type === "rival" && rivalPromptVisible && (
        <MotiView
          from={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          style={styles.rivalPromptOverlay}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.rivalPromptCard}
            onPress={() => setRivalPromptVisible(false)}
          >
            <Text style={styles.rivalPromptEmoji}>⚔️</Text>
            <Text style={styles.rivalPromptText}>{currentQ.prompt}</Text>
            <Text style={styles.rivalPromptSub}>Tap to dismiss</Text>
          </Pressable>
        </MotiView>
      )}

      <QuestCoachmarks
        visible={showCoachmarks}
        onDone={() => {
          setShowCoachmarks(false);
          markQuestTutorialSeen();
        }}
      />
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
  topBarRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  chapterBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  chapterEmoji: { fontSize: 22 },
  rivalChatHeader: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: colors.navy,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 12,
  },
  rivalChatDirectionsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  rivalChatDirectionsIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  rivalChatDirections: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: "rgba(26,26,46,0.6)",
    lineHeight: 19,
  },
  scroll: { paddingTop: 16, gap: 16 },
  rivalPromptOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  rivalPromptCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: "center",
    gap: 10,
    marginHorizontal: 32,
    shadowColor: colors.navy,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  rivalPromptEmoji: {
    fontSize: 36,
  },
  rivalPromptText: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 24,
  },
  rivalPromptSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: "rgba(26,26,46,0.4)",
  },
  speechArea: { paddingHorizontal: 16, alignItems: "center", gap: 10 },
  whisperBanner: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "stretch",
  },
  whisperBannerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  noSpeechBanner: {
    backgroundColor: "rgba(255,180,0,0.18)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,180,0,0.4)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "stretch",
  },
  noSpeechText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#FFD966",
    textAlign: "center",
  },
  noSpeechDebug: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: "rgba(255,217,102,0.6)",
    textAlign: "center",
    marginTop: 6,
  },
  silenceHint: {
    backgroundColor: "rgba(255,180,0,0.12)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
  },
  silenceHintText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#FFD966",
    textAlign: "center",
  },
});
