import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/lib/theme";
import { WaveformVisualizer } from "@/components/animations/WaveformVisualizer";
import type { SpeechState } from "@/hooks/useSpeechRecognition";
import type { QuestionType } from "@/lib/chaptersData";

const SPEECH_LABELS: Record<QuestionType, string> = {
  identify: "Say YES or NO",
  build: "Say the full sentence",
  choice: "Say the correct sentence",
  speak: "Say the sentence",
  rival: "Say the correct version",
};

interface Props {
  state: SpeechState;
  transcript: string;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
  questionType?: QuestionType;
  isAnalyzing?: boolean;
  analyzePhase?: "transcribing" | "scoring" | null;
}

export function SpeechInput({ state, transcript, interimTranscript, onStart, onStop, error, questionType, isAnalyzing, analyzePhase }: Props) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing" || isAnalyzing;

  return (
    <View style={styles.container}>
      {/* Transcript display */}
      {(transcript || interimTranscript) ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcript}>
            {transcript || interimTranscript}
          </Text>
        </View>
      ) : null}

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Mic button */}
      <Pressable
        onPress={isRecording ? onStop : onStart}
        disabled={isProcessing}
        style={styles.buttonWrapper}
      >
        <View
          style={[styles.button, { backgroundColor: isRecording ? colors.danger : isProcessing ? colors.warning : colors.sky }]}
        >
          <Text style={styles.micIcon}>
            {isRecording ? "⏹️" : isProcessing ? "⏳" : "🎤"}
          </Text>
        </View>
      </Pressable>

      {isRecording && (
        <View style={styles.waveform}>
          <WaveformVisualizer active color="white" />
        </View>
      )}

      {/* Question type instruction badge */}
      {questionType && !isRecording && !isProcessing && (
        <View style={styles.instructionBadge}>
          <Text style={styles.instructionText}>{SPEECH_LABELS[questionType]}</Text>
        </View>
      )}

      <Text style={styles.hint}>
        {isRecording
          ? "Tap to stop"
          : analyzePhase === "transcribing"
            ? "Listening to your speech…"
            : analyzePhase === "scoring"
              ? "Scoring your answer…"
              : isAnalyzing
                ? "Analyzing…"
                : isProcessing
                  ? "Processing…"
                  : "Tap to speak"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  transcriptBox: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: 300,
    width: "100%",
  },
  transcript: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.navy,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
  buttonWrapper: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  micIcon: {
    fontSize: 30,
  },
  waveform: {
    height: 40,
    justifyContent: "center",
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  instructionBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  instructionText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
});
