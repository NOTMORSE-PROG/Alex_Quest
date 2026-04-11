import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import * as Speech from "expo-speech";
import { type Chapter } from "@/lib/chaptersData";
import { colors, fonts } from "@/lib/theme";


interface Props {
  chapter: Chapter;
  onStart: () => void;
  /** Wrong sentence the rival says — triggers cutscene when provided */
  rivalLine?: string;
  /** Emoji for the rival character (e.g. "🦨") */
  rivalEmoji?: string;
}

/**
 * Rival cutscene phases:
 * 0 = idle (not started)
 * 1 = overlay + bars fading in
 * 2 = rival emoji bounces up
 * 3 = typing indicator shown
 * 4 = speech bubble + TTS
 * 5 = cutscene done, Start button unlocked
 */
type RivalPhase = 0 | 1 | 2 | 3 | 4 | 5;

export function ChapterIntroScene({ chapter, onStart, rivalLine, rivalEmoji }: Props) {
  const insets = useSafeAreaInsets();
  const [showContinuation, setShowContinuation] = useState(false);
  const [rivalPhase, setRivalPhase] = useState<RivalPhase>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hasRival = !!rivalLine && !!rivalEmoji;

  // Auto-start rival cutscene 1200ms after mount (once the Start button has animated in)
  useEffect(() => {
    if (!hasRival) return;
    const kickoff = setTimeout(() => startCutscene(), 1200);
    return () => {
      clearTimeout(kickoff);
      timersRef.current.forEach(clearTimeout);
      Speech.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRival]);

  function startCutscene() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setRivalPhase(1); // accent-color screen fades in

    timersRef.current.push(setTimeout(() => setRivalPhase(2), 800));   // emoji bounces in
    timersRef.current.push(setTimeout(() => setRivalPhase(3), 2000));  // typing dots (1.2s of just emoji)
    timersRef.current.push(setTimeout(() => {
      setRivalPhase(4);                                                  // bubble + TTS
      if (rivalLine) {
        Speech.speak(rivalLine, { language: "en-US", rate: 0.80 });
      }
    }, 3600));                                                           // 1.6s of typing dots
    timersRef.current.push(setTimeout(() => {
      Speech.stop();
      setRivalPhase(5);                                                  // cutscene done
    }, 8000));                                                           // 4.4s to read + hear TTS
  }

  function skipCutscene() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    Speech.stop();
    setRivalPhase(5);
  }

  const handleAnimalTap = () => {
    const next = !showContinuation;
    setShowContinuation(next);
    if (next) {
      Speech.speak(chapter.story.continuation, { language: "en-US", rate: 0.85 });
    } else {
      Speech.stop();
    }
  };

  const handleStart = () => {
    Speech.stop();
    onStart();
  };

  const startBtnDisabled = hasRival && rivalPhase < 5;
  const startBtnLabel = hasRival && rivalPhase >= 5
    ? "Accept the Challenge ⚔️"
    : "Start Adventure  ▶";

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: chapter.accentColorHex }]} />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      {/* Chapter badge */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 100 }}
        style={styles.badge}
      >
        <Text style={styles.badgeEmoji}>{chapter.animalEmoji}</Text>
        <View>
          <Text style={styles.badgeTitle}>{chapter.title}</Text>
          <Text style={styles.badgeLo}>{chapter.learningObjective}</Text>
        </View>
      </MotiView>

      {/* Center: animal + thought bubble */}
      <View style={styles.centerArea}>
        {/* Thought bubble on tap */}
        <AnimatePresence>
          {showContinuation && (
            <MotiView
              from={{ opacity: 0, scale: 0.85, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={styles.thoughtBubble}
            >
              <Text style={styles.thoughtText}>{chapter.story.continuation}</Text>
            </MotiView>
          )}
        </AnimatePresence>

        {/* Animal character */}
        <Pressable onPress={handleAnimalTap}>
          <View>
            <Text style={styles.animalEmoji}>{chapter.animalEmoji}</Text>
          </View>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: showContinuation ? 0 : 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.tapHint}
          >
            <Text style={styles.tapHintText}>👆 Tap to hear their story</Text>
          </MotiView>
        </Pressable>

        {/* Story problem speech bubble */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 300 }}
          style={styles.speechBubble}
        >
          <Text style={styles.speechText}>{chapter.story.problem}</Text>
        </MotiView>
      </View>

      {/* Start button */}
      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 500 }}
        style={styles.btnWrapper}
      >
        <Pressable
          onPress={handleStart}
          disabled={startBtnDisabled}
          style={[
            styles.startBtn,
            startBtnDisabled && styles.startBtnDisabled,
            hasRival && rivalPhase >= 5 && styles.startBtnChallenge,
          ]}
        >
          <Text style={styles.startBtnText}>{startBtnLabel}</Text>
        </Pressable>
      </MotiView>

      {/* ── RIVAL CUTSCENE OVERLAY ── */}
      <AnimatePresence>
        {rivalPhase >= 1 && rivalPhase <= 4 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 500 }}
            style={[StyleSheet.absoluteFill, styles.cutsceneRoot, { backgroundColor: chapter.accentColorHex }]}
          >
            {/* Cinematic bar — top */}
            <View style={styles.barTop} />

            {/* Cinematic bar — bottom */}
            <View style={styles.barBottom} />

            {/* Skip button — inside top bar */}
            <Pressable
              onPress={skipCutscene}
              style={[styles.skipBtn, { top: insets.top + 18 }]}
            >
              <Text style={styles.skipText}>Skip  ▶</Text>
            </Pressable>

            {/* Centred content between bars */}
            <View style={styles.cutsceneContent}>
              {/* Rival emoji */}
              <AnimatePresence>
                {rivalPhase >= 2 && (
                  <MotiView
                    from={{ translateY: 40, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    exit={{ translateY: 40, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  >
                    <Text style={styles.rivalEmojiLarge}>{rivalEmoji}</Text>
                  </MotiView>
                )}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {rivalPhase === 3 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    style={styles.typingBubble}
                  >
                    <TypingDots />
                  </MotiView>
                )}
              </AnimatePresence>

              {/* Rival speech bubble */}
              <AnimatePresence>
                {rivalPhase >= 4 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    style={styles.rivalSpeechBubble}
                  >
                    <Text style={styles.rivalSpeechText}>{rivalLine}</Text>
                    <Text style={styles.rivalSpeechHint}>Can you say it correctly?</Text>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

/** Three animated dots for the typing indicator */
function TypingDots() {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ translateY: 0, opacity: 0.4 }}
          animate={{ translateY: -6, opacity: 1 }}
          transition={{
            loop: true,
            type: "timing",
            duration: 400,
            delay: i * 150,
            repeatReverse: true,
          }}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: "white",
  },
  badgeLo: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },
  centerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
  },
  thoughtBubble: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    maxWidth: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    position: "absolute",
    top: -20,
    zIndex: 10,
  },
  thoughtText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 21,
  },
  animalEmoji: {
    fontSize: 96,
    textAlign: "center",
  },
  tapHint: {
    alignItems: "center",
    marginTop: 4,
  },
  tapHintText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  speechBubble: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    width: "100%",
  },
  speechText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: "white",
    textAlign: "center",
    lineHeight: 23,
  },
  btnWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: colors.gold,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  startBtnDisabled: {
    opacity: 0.4,
  },
  startBtnChallenge: {
    backgroundColor: "#E53935",
    shadowColor: "#E53935",
  },
  startBtnText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: "white",
  },

  // ── Cutscene ──
  // Background color is set inline from chapter.accentColorHex
  cutsceneRoot: {},
  barTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#000",
  },
  barBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: "#000",
  },
  skipBtn: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 20,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  // Flexbox column centred in the visible area between bars
  cutsceneContent: {
    position: "absolute",
    top: 80,
    bottom: 88,
    left: 24,
    right: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  rivalEmojiLarge: {
    fontSize: 96,
    textAlign: "center",
  },
  typingBubble: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.navy,
  },
  rivalSpeechBubble: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  rivalSpeechText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.navy,
    textAlign: "center",
    lineHeight: 26,
  },
  rivalSpeechHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}88`,
    textAlign: "center",
    fontStyle: "italic",
  },
});
