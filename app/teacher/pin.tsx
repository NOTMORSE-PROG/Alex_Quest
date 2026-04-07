import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import { TEACHER_PIN } from "@/lib/teacherRubricData";
import { useState } from "react";

type DotState = "entering" | "correct" | "incorrect";

export default function PinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [pin, setPin] = useState("");
  const [dotState, setDotState] = useState<DotState>("entering");
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (text: string) => {
    if (dotState !== "entering") return;
    const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(digits);

    if (digits.length === 4) {
      if (digits === TEACHER_PIN) {
        setDotState("correct");
        setTimeout(() => router.replace("/teacher"), 400);
      } else {
        setDotState("incorrect");
        setShakeKey((k) => k + 1);
        setTimeout(() => {
          setPin("");
          setDotState("entering");
          inputRef.current?.clear();
          inputRef.current?.focus();
        }, 600);
      }
    }
  };

  const dotColor =
    dotState === "correct"
      ? colors.success
      : dotState === "incorrect"
        ? colors.danger
        : colors.gold;

  return (
    <Pressable
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      onPress={() => {
        inputRef.current?.blur();
        setTimeout(() => inputRef.current?.focus(), 50);
      }}
    >
      <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Teacher Access</Text>
        <Text style={styles.subtitle}>Enter PIN to continue</Text>

        <MotiView
          key={shakeKey}
          from={shakeKey > 0 ? { translateX: -15 } : undefined}
          animate={{ translateX: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          style={styles.dotsRow}
        >
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i < pin.length ? dotColor : "transparent",
                  borderColor: i < pin.length ? dotColor : "rgba(255,255,255,0.3)",
                },
              ]}
            />
          ))}
        </MotiView>

        <Text style={styles.hint}>Tap to open keyboard</Text>
      </View>

      {/* Offscreen input that drives the keyboard.
          Note: opacity:0 prevents the Android soft keyboard from opening,
          so we position it offscreen instead. */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        onChangeText={handleChange}
        value={pin}
        caretHidden
        autoFocus
        showSoftInputOnFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  cancelBtn: {
    padding: 16,
    alignSelf: "flex-start",
  },
  cancelText: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: fonts.body,
    fontSize: 15,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  title: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    marginBottom: 36,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  hint: {
    color: "rgba(255,255,255,0.2)",
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
  },
  hiddenInput: {
    position: "absolute",
    top: -1000,
    left: 0,
    width: 40,
    height: 40,
    color: "transparent",
  },
});
