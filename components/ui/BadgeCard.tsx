import { StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts, shadows } from "@/lib/theme";
import type { BadgeDefinition, EarnedBadge } from "@/types/badges";

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned?: EarnedBadge;
}

export function BadgeCard({ badge, earned }: BadgeCardProps) {
  const isEarned = !!earned;
  const isSecret = badge.secret && !isEarned;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={[styles.card, isEarned && styles.cardEarned]}
    >
      <View style={styles.emojiContainer}>
        <Text style={[styles.emoji, !isEarned && styles.emojiLocked]}>
          {isSecret ? "❓" : badge.emoji}
        </Text>
        {!isEarned && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.name, isEarned ? styles.nameEarned : styles.nameLocked]}
        numberOfLines={1}
      >
        {isSecret ? "???" : badge.name}
      </Text>

      <Text
        style={[
          styles.description,
          isEarned ? styles.descriptionEarned : styles.descriptionLocked,
        ]}
        numberOfLines={2}
      >
        {isSecret ? "Keep playing to discover!" : badge.description}
      </Text>

      {isEarned && (
        <Text style={styles.earnedDate}>
          {new Date(earned.earnedAt).toLocaleDateString()}
        </Text>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: `${colors.navy}CC`,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardEarned: {
    backgroundColor: `${colors.navy}EE`,
    borderColor: `${colors.gold}40`,
    ...shadows.glowGold,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emoji: {
    fontSize: 32,
  },
  emojiLocked: {
    opacity: 0.3,
  },
  lockOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  lockIcon: {
    fontSize: 14,
  },
  name: {
    fontSize: 14,
    fontFamily: fonts.display,
    textAlign: "center",
    marginBottom: 4,
  },
  nameEarned: {
    color: colors.gold,
  },
  nameLocked: {
    color: "rgba(255,255,255,0.4)",
  },
  description: {
    fontSize: 11,
    fontFamily: fonts.bodyRegular,
    textAlign: "center",
    lineHeight: 15,
  },
  descriptionEarned: {
    color: "rgba(255,255,255,0.7)",
  },
  descriptionLocked: {
    color: "rgba(255,255,255,0.25)",
  },
  earnedDate: {
    fontSize: 10,
    fontFamily: fonts.bodyRegular,
    color: `${colors.gold}99`,
    marginTop: 6,
  },
});
