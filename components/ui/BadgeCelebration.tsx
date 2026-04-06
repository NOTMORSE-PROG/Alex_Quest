import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { colors, fonts, shadows } from "@/lib/theme";
import { useGameStore } from "@/store/gameStore";
import { getBadgeById } from "@/lib/badgesData";
import { ConfettiBlast } from "@/components/animations/ConfettiBlast";

const AUTO_DISMISS_MS = 6000;

export function BadgeCelebration() {
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

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    dismissBadgeNotification();
  };

  return (
    <View
      style={styles.container}
      pointerEvents={badge ? "auto" : "box-none"}
    >
      <AnimatePresence>
        {badge && (
          <MotiView
            key={currentBadgeId}
            style={styles.overlay}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 250 }}
          >
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={handleDismiss} />

            {/* Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
              style={styles.cardWrapper}
            >
              <View style={styles.card}>
                {/* Emoji with bounce */}
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                    delay: 200,
                  }}
                >
                  <Text style={styles.emoji}>{badge.emoji}</Text>
                </MotiView>

                <Text style={styles.header}>Congratulations!</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.description}>{badge.description}</Text>

                <Pressable
                  onPress={handleDismiss}
                  style={styles.button}
                  accessibilityLabel="Dismiss badge notification"
                >
                  <Text style={styles.buttonText}>Awesome!</Text>
                </Pressable>
              </View>
            </MotiView>

            {/* Confetti */}
            <ConfettiBlast key={`confetti-${currentBadgeId}`} fire />
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  cardWrapper: {
    zIndex: 1,
  },
  card: {
    backgroundColor: colors.navy,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.gold,
    paddingVertical: 32,
    paddingHorizontal: 36,
    alignItems: "center",
    maxWidth: 300,
    ...shadows.glowGold,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  header: {
    fontSize: 24,
    fontFamily: fonts.display,
    color: colors.gold,
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 20,
    fontFamily: fonts.display,
    color: colors.cream,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.bodyRegular,
    color: `${colors.cream}CC`,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 36,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.bodyBold,
    color: colors.navy,
  },
});
