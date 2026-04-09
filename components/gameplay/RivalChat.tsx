import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import type { ChapterId } from "@/store/gameStore";

export type RivalMessage = { role: "rival" | "student"; text: string };

const RIVAL_EMOJIS = ["🦨", "🐿️", "🐓", "🦉", "🦜"];

interface Props {
  messages: RivalMessage[];
  chapterId: ChapterId;
  isWaiting?: boolean;           // rival is typing (left side)
  isStudentProcessing?: boolean; // student voice is being processed (right side)
}

export function RivalChat({ messages, chapterId, isWaiting = false, isStudentProcessing = false }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const emoji = RIVAL_EMOJIS[(chapterId - 1) % RIVAL_EMOJIS.length];

  // Auto-scroll to bottom when messages change or either indicator appears
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, isWaiting, isStudentProcessing]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
    >
      {messages.map((msg, i) =>
        msg.role === "rival" ? (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 260 }}
            style={styles.rivalRow}
          >
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </View>
            <View style={styles.rivalBubble}>
              <Text style={styles.rivalText}>{msg.text}</Text>
            </View>
          </MotiView>
        ) : (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 260 }}
            style={styles.studentRow}
          >
            <View style={styles.studentBubble}>
              <Text style={styles.studentText}>{msg.text}</Text>
            </View>
            <View style={styles.youLabel}>
              <Text style={styles.youText}>You</Text>
            </View>
          </MotiView>
        )
      )}

      {/* Rival typing indicator — rival is composing a reply */}
      {isWaiting && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.rivalRow}
        >
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
          <View style={styles.rivalBubble}>
            <TypingDots />
          </View>
        </MotiView>
      )}

      {/* Student processing indicator — voice is being transcribed */}
      {isStudentProcessing && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.studentRow}
        >
          <View style={styles.studentBubble}>
            <TypingDots />
          </View>
          <View style={styles.youLabel}>
            <Text style={styles.youText}>You</Text>
          </View>
        </MotiView>
      )}
    </ScrollView>
  );
}

function TypingDots() {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "timing",
            duration: 500,
            loop: true,
            delay: i * 160,
          }}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 280,
    marginHorizontal: 16,
  },
  content: {
    gap: 10,
    paddingVertical: 4,
  },

  // Rival (left-aligned) rows
  rivalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    alignSelf: "flex-start",
    maxWidth: "85%",
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  rivalBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rivalText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.navy,
    lineHeight: 20,
  },

  // Student (right-aligned) rows
  studentRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 6,
    alignSelf: "flex-end",
    maxWidth: "85%",
  },
  youLabel: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  youText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  studentBubble: {
    backgroundColor: "white",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  studentText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.navy,
    lineHeight: 20,
  },

  // Typing indicator dots
  dotsRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingVertical: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(26,26,46,0.45)",
  },
});
