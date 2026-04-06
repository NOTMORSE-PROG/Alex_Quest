import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import type { BandDescriptor, BandScore, CriterionDefinition } from "@/types/teacherAssessment";

interface Props {
  criterion: CriterionDefinition;
  descriptors: BandDescriptor[];
  selectedBand: BandScore | null;
  onSelectBand: (band: BandScore) => void;
}

const BANDS: BandScore[] = [9, 8, 7, 6, 5, 4, 3, 2, 1];

export function CriterionCard({
  criterion,
  descriptors,
  selectedBand,
  onSelectBand,
}: Props) {
  const [expandedBand, setExpandedBand] = useState<BandScore | null>(null);

  const handleBandPress = (band: BandScore) => {
    onSelectBand(band);
    setExpandedBand(expandedBand === band ? null : band);
  };

  const activeDescriptor = descriptors.find((d) => d.band === expandedBand);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.label}>{criterion.label}</Text>
        <Text style={styles.weight}>{Math.round(criterion.weight * 100)}%</Text>
      </View>

      {/* Band buttons */}
      <View style={styles.bandsRow}>
        {BANDS.map((band) => {
          const isSelected = selectedBand === band;
          const isExpanded = expandedBand === band;
          return (
            <Pressable
              key={band}
              onPress={() => handleBandPress(band)}
              style={[
                styles.bandBtn,
                isSelected && styles.bandBtnSelected,
                isExpanded && !isSelected && styles.bandBtnExpanded,
              ]}
            >
              <Text
                style={[
                  styles.bandText,
                  isSelected && styles.bandTextSelected,
                ]}
              >
                {band}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Expanded descriptor */}
      {activeDescriptor && (
        <MotiView
          from={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 200 }}
          style={styles.descriptorBox}
        >
          <Text style={styles.descriptorBand}>Band {activeDescriptor.band}</Text>
          <Text style={styles.descriptorText}>{activeDescriptor.description}</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: "white",
    fontFamily: fonts.body,
    fontSize: 15,
    flex: 1,
  },
  weight: {
    color: colors.gold,
    fontFamily: fonts.body,
    fontSize: 14,
    marginLeft: 8,
  },
  bandsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  bandBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bandBtnSelected: {
    backgroundColor: colors.gold,
  },
  bandBtnExpanded: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  bandText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: fonts.body,
    fontSize: 14,
  },
  bandTextSelected: {
    color: colors.navy,
  },
  descriptorBox: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 12,
  },
  descriptorBand: {
    color: colors.gold,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 4,
  },
  descriptorText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
  },
});
