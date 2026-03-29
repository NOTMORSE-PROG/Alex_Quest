import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import { WaveformVisualizer } from "@/components/animations/WaveformVisualizer";
import type { SpeechState } from "@/hooks/useSpeechRecognition";

interface Props {
  state: SpeechState;
  transcript: string;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
}

export function SpeechInput({ state, transcript, interimTranscript, onStart, onStop, error }: Props) {
  const isRecording = state === "recording";
  const isProcessing = state === "processing";

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
        <MotiView
          animate={{
            scale: isRecording ? [1, 1.05, 1] : 1,
            backgroundColor: isRecording ? colors.danger : isProcessing ? colors.warning : colors.sky,
          }}
          transition={
            isRecording
              ? { loop: true, duration: 800, type: "timing" }
              : { duration: 300 }
          }
          style={styles.button}
        >
          {/* Pulse ring when recording */}
          {isRecording && (
            <MotiView
              from={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ loop: true, duration: 1200, type: "timing" }}
              style={[StyleSheet.absoluteFill, styles.pulseRing]}
            />
          )}
          <Text style={styles.micIcon}>
            {isRecording ? "⏹️" : isProcessing ? "⏳" : "🎤"}
          </Text>
        </MotiView>
      </Pressable>

      {isRecording && (
        <View style={styles.waveform}>
          <WaveformVisualizer active color="white" />
        </View>
      )}

      <Text style={styles.hint}>
        {isRecording ? "Tap to stop" : isProcessing ? "Processing..." : "Tap to speak"}
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
  pulseRing: {
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.danger,
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
});
