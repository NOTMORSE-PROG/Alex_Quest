import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView, AnimatePresence } from "moti";
import { type Chapter } from "@/lib/chaptersData";
import { colors, fonts } from "@/lib/theme";

interface Props {
  chapter: Chapter;
  onStart: () => void;
}

export function ChapterIntroScene({ chapter, onStart }: Props) {
  const insets = useSafeAreaInsets();
  const [showContinuation, setShowContinuation] = useState(false);

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
        <Pressable onPress={() => setShowContinuation((v) => !v)}>
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
        <Pressable onPress={onStart} style={styles.startBtn}>
          <Text style={styles.startBtnText}>Start Adventure →</Text>
        </Pressable>
      </MotiView>
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
  startBtnText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: "white",
  },
});
