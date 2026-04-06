import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { fonts } from "@/lib/theme";
import type { Chapter } from "@/lib/chaptersData";

interface Props {
  chapter: Chapter | null;
  isUnlocked: boolean;
  onClose: () => void;
  onStart: () => void;
}

export function MapChapterPopup({ chapter, isUnlocked, onClose, onStart }: Props) {
  if (!chapter) return null;

  return (
    <Modal
      visible={!!chapter}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropInner} />
      </Pressable>

      {/* Sheet */}
      <MotiView
        from={{ translateY: 320, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        exit={{ translateY: 320, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        style={[styles.sheet, { borderColor: chapter.accentColorHex }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Chapter emoji & title */}
        <View style={styles.titleRow}>
          <View style={[styles.emojiCircle, { backgroundColor: chapter.accentColorHex + "33" }]}>
            <Text style={styles.bigEmoji}>{chapter.animalEmoji}</Text>
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
            <View style={[styles.locationPill, { backgroundColor: chapter.accentColorHex + "25" }]}>
              <Text style={[styles.locationText, { color: chapter.accentColorHex }]}>
                📍 {chapter.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Learning objective */}
        <View style={styles.loBox}>
          <Text style={styles.loLabel}>Learning Objective</Text>
          <Text style={styles.loDesc}>{chapter.loDescription}</Text>
        </View>

        {/* CTA button */}
        <Pressable
          onPress={isUnlocked ? onStart : undefined}
          style={[
            styles.ctaBtn,
            isUnlocked
              ? { backgroundColor: chapter.accentColorHex }
              : styles.ctaBtnLocked,
          ]}
        >
          <Text style={[styles.ctaText, !isUnlocked && styles.ctaTextLocked]}>
            {isUnlocked ? "▶  START LESSON" : "🔒 Complete Previous Stage First"}
          </Text>
        </Pressable>
      </MotiView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  backdropInner: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111827",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 30,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  emojiCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  bigEmoji: {
    fontSize: 36,
  },
  titleInfo: {
    flex: 1,
    gap: 6,
  },
  chapterTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: "white",
    lineHeight: 24,
  },
  locationPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  locationText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  loBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  loLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  loDesc: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
  ctaBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaBtnLocked: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  ctaText: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: "white",
    letterSpacing: 0.5,
  },
  ctaTextLocked: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
});
