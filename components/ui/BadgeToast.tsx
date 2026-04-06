import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, shadows } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";
import { getBadgeById } from "@/lib/badgesData";

const AUTO_DISMISS_MS = 3000;

export function BadgeToast() {
  const insets = useSafeAreaInsets();
  const pendingBadgeNotifications = useGameStore(
    (s) => s.pendingBadgeNotifications
  );
  const dismissBadgeNotification = useGameStore(
    (s) => s.dismissBadgeNotification
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentBadgeId = pendingBadgeNotifications[0] ?? null;
  const badge = currentBadgeId ? getBadgeById(currentBadgeId) : null;

  useEffect(() => {
    if (!currentBadgeId) return;

    timerRef.current = setTimeout(() => {
      dismissBadgeNotification();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentBadgeId, dismissBadgeNotification]);

  const handlePress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismissBadgeNotification();
  };

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      <AnimatePresence>
        {badge && (
          <MotiView
            key={currentBadgeId}
            from={{ opacity: 0, translateY: -60, scale: 0.8 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: -60, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Pressable onPress={handlePress} style={styles.toast}>
              <Text style={styles.emoji}>{badge.emoji}</Text>
              <View style={styles.textContainer}>
                <Text style={styles.label}>Badge Earned!</Text>
                <Text style={styles.name}>{badge.name}</Text>
              </View>
            </Pressable>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.navy,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    gap: 12,
    ...shadows.glowGold,
  },
  emoji: {
    fontSize: 28,
  },
  textContainer: {
    alignItems: "flex-start",
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodyRegular,
    color: `${colors.gold}CC`,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.display,
    color: colors.gold,
  },
});
