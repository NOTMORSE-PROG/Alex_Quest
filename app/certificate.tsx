/**
 * CertificateScreen — shown after the reunion cutscene when the game is complete.
 * Displays cert.jpg with the player's name overlaid, lets them edit their name,
 * download the certificate as JPEG or PNG, and continue to the map.
 */
import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { MotiView } from "moti";
import { useGameStore } from "@/store/gameStore";
import { colors, fonts } from "@/lib/theme";

const { width: SCREEN_W } = Dimensions.get("window");
const CERT_W = SCREEN_W - 32;              // 16px margin each side
const CERT_H = Math.round(CERT_W / 1.4144); // cert.jpg is 2000×1414 (landscape)

export default function CertificateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const certRef = useRef<View>(null);

  const certName = useGameStore((s) => s.certName);
  const setCertName = useGameStore((s) => s.setCertName);

  const [name, setName] = useState(certName ?? "");
  const [saving, setSaving] = useState(false);

  const handleNameChange = useCallback(
    (text: string) => {
      setName(text);
      setCertName(text);
    },
    [setCertName]
  );

  const handleDownload = useCallback(
    async (format: "jpg" | "png") => {
      if (!certRef.current) return;
      setSaving(true);
      try {
        const uri = await captureRef(certRef, {
          format,
          quality: format === "jpg" ? 0.9 : 1,
          result: "tmpfile",
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: format === "jpg" ? "image/jpeg" : "image/png",
            dialogTitle: "Save your certificate",
            UTI: format === "jpg" ? "public.jpeg" : "public.png",
          });
        } else {
          Alert.alert("Saved!", "Certificate saved.");
        }
      } catch (e) {
        console.error("Certificate capture error:", e);
        Alert.alert("Error", "Could not save certificate. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const handleContinue = useCallback(() => {
    router.replace("/map");
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.bgDark} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.header}
        >
          <Text style={styles.heading}>Certificate of Completion</Text>
          <Text style={styles.subheading}>Alex's Quest — English Adventure</Text>
        </MotiView>

        {/* Capturable certificate region */}
        <MotiView
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 20, delay: 150 }}
        >
          {/* collapsable={false} is required on Android for captureRef to work */}
          <View
            ref={certRef}
            collapsable={false}
            style={styles.certFrame}
          >
            <Image
              source={require("../cert.jpg")}
              style={styles.certImage}
              resizeMode="contain"
            />
            {/* Name overlay — centered ~57% down the cert image */}
            <View style={styles.nameOverlay} pointerEvents="none">
              <Text style={styles.nameText} numberOfLines={1}>
                {name || " "}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Name input */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
          style={styles.inputBlock}
        >
          <Text style={styles.inputLabel}>Your name on the certificate:</Text>
          <TextInput
            value={name}
            onChangeText={handleNameChange}
            style={styles.inputField}
            placeholder="Type your name…"
            placeholderTextColor="rgba(255,255,255,0.35)"
            maxLength={40}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </MotiView>

        {/* Download buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 450 }}
          style={styles.downloadRow}
        >
          <Pressable
            onPress={() => handleDownload("jpg")}
            style={({ pressed }) => [
              styles.downloadBtn,
              pressed && styles.downloadBtnPressed,
            ]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.gold} size="small" />
            ) : (
              <Text style={styles.downloadBtnText}>⬇ Save as JPEG</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => handleDownload("png")}
            style={({ pressed }) => [
              styles.downloadBtn,
              pressed && styles.downloadBtnPressed,
            ]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.gold} size="small" />
            ) : (
              <Text style={styles.downloadBtnText}>⬇ Save as PNG</Text>
            )}
          </Pressable>
        </MotiView>

        {/* Continue to Map */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 600 }}
          style={{ marginBottom: insets.bottom + 32 }}
        >
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueBtn,
              pressed && styles.continueBtnPressed,
            ]}
          >
            <Text style={styles.continueBtnText}>Continue to Map  →</Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  bgDark: {
    flex: 1,
    backgroundColor: "#0A0A0F",
  },

  scroll: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 20,
  },

  header: { alignItems: "center", gap: 4 },
  heading: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.gold,
    letterSpacing: 2,
    textShadowColor: "rgba(245,166,35,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: "center",
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },

  // Certificate image frame — capturable region (landscape orientation)
  certFrame: {
    width: CERT_W,
    height: CERT_H,
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.gold,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  certImage: {
    width: CERT_W,
    height: CERT_H,
  },
  // Name overlay: absolute positioned ~57% down the cert image
  nameOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "41%",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  nameText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: "#5A3A1A",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Name input
  inputBlock: { width: CERT_W, gap: 8 },
  inputLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  inputField: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    color: "white",
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  // Download buttons
  downloadRow: {
    flexDirection: "row",
    gap: 12,
    width: CERT_W,
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: "rgba(245,166,35,0.15)",
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  downloadBtnPressed: {
    backgroundColor: "rgba(245,166,35,0.30)",
  },
  downloadBtnText: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.gold,
  },

  // Continue button
  continueBtn: {
    backgroundColor: colors.gold,
    width: CERT_W,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
  },
  continueBtnPressed: {
    opacity: 0.85,
  },
  continueBtnText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: "white",
  },
});
