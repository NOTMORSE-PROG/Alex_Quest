import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";

interface TrainerEntry {
  label: string;
  value: string;
  emoji?: string;
}

interface Props {
  title?: string;
  entries: TrainerEntry[];
}

export function TrainerScroll({ title, entries }: Props) {
  return (
    <View style={styles.parchment}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {entries.map((entry, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: i * 60, type: "timing", duration: 300 }}
            style={styles.row}
          >
            {entry.emoji && <Text style={styles.emoji}>{entry.emoji}</Text>}
            <View style={styles.textBlock}>
              <Text style={styles.label}>{entry.label}</Text>
              <Text style={styles.value}>{entry.value}</Text>
            </View>
          </MotiView>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parchment: {
    backgroundColor: "#fdf6e3",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#8B5A2B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.navy,
    marginBottom: 12,
    textAlign: "center",
  },
  scroll: {
    maxHeight: 260,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139,90,43,0.1)",
  },
  emoji: {
    fontSize: 22,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.navy,
  },
  value: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: `${colors.navy}99`,
  },
});
