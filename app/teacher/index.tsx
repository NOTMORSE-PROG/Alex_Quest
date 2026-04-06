import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import {
  ASSESSMENT_TOPICS,
  CRITERIA,
  BAND_DESCRIPTORS,
  calculateWeightedScore,
  getScoreLabel,
} from "@/lib/teacherRubricData";
import { useTeacherStore } from "@/store/teacherStore";
import { CriterionCard } from "@/components/teacher/CriterionCard";
import type {
  AssessmentTopic,
  BandScore,
  CriterionKey,
} from "@/types/teacherAssessment";

type Step = 1 | 2 | 3;

export default function TeacherAssessmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const saveAssessment = useTeacherStore((s) => s.saveAssessment);

  const [step, setStep] = useState<Step>(1);
  const [selectedTopic, setSelectedTopic] = useState<AssessmentTopic | null>(null);
  const [studentName, setStudentName] = useState("");
  const [scores, setScores] = useState<Partial<Record<CriterionKey, BandScore>>>({});

  const allScored = CRITERIA.every((c) => scores[c.key] != null);
  const scoredCount = CRITERIA.filter((c) => scores[c.key] != null).length;
  const fullScores = scores as Record<CriterionKey, BandScore>;
  const weightedOverall = allScored ? calculateWeightedScore(fullScores) : 0;
  const scoreInfo = getScoreLabel(weightedOverall);

  const handleSelectBand = (key: CriterionKey, band: BandScore) => {
    setScores((prev) => ({ ...prev, [key]: band }));
  };

  const handleSave = () => {
    if (!selectedTopic || !allScored) return;
    saveAssessment(selectedTopic, fullScores, studentName.trim() || undefined);
    router.replace("/teacher/history");
  };

  // Back navigates to the previous step; Cancel (step 1) exits entirely.
  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>
            {step === 1 ? "Cancel" : "← Back"}
          </Text>
        </Pressable>

        {/* Step dots */}
        <View style={styles.stepsRow}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[styles.stepDot, step >= s && styles.stepDotActive]}
            />
          ))}
        </View>

        {/* History shortcut */}
        <Pressable
          onPress={() => router.push("/teacher/history")}
          style={styles.topBarBtn}
        >
          <Text style={styles.topBarBtnText}>History</Text>
        </Pressable>
      </View>

      {/* Step 1: Topic + Student Name */}
      {step === 1 && (
        <MotiView
          key="step1"
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 250 }}
          style={styles.stepContainer}
        >
          <Text style={styles.stepTitle}>Select Topic</Text>
          <Text style={styles.stepSubtitle}>
            Choose the speaking topic for this assessment
          </Text>

          {/* Optional student name */}
          <View style={styles.nameInputRow}>
            <TextInput
              style={styles.nameInput}
              placeholder="Student name (optional)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={studentName}
              onChangeText={setStudentName}
              returnKeyType="done"
              autoCapitalize="words"
            />
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.topicGrid}
            showsVerticalScrollIndicator={false}
          >
            {ASSESSMENT_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <Pressable
                  key={topic}
                  onPress={() => setSelectedTopic(topic)}
                  style={[
                    styles.topicChip,
                    isSelected && styles.topicChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.topicText,
                      isSelected && styles.topicTextSelected,
                    ]}
                  >
                    {topic}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => selectedTopic && setStep(2)}
            style={[
              styles.nextBtn,
              !selectedTopic && styles.nextBtnDisabled,
              { marginBottom: Math.max(insets.bottom, 24) },
            ]}
            disabled={!selectedTopic}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </Pressable>
        </MotiView>
      )}

      {/* Step 2: Rubric Grading */}
      {step === 2 && (
        <MotiView
          key="step2"
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 250 }}
          style={styles.stepContainer}
        >
          {/* Topic + student badge row */}
          <View style={styles.badgeRow}>
            <View style={styles.topicBadge}>
              <Text style={styles.topicBadgeText}>{selectedTopic}</Text>
            </View>
            {studentName.trim() ? (
              <View style={styles.studentBadge}>
                <Text style={styles.studentBadgeText}>{studentName.trim()}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.stepTitle}>Grade Assessment</Text>
          <Text style={styles.stepSubtitle}>
            Tap a band score (1-9) for each criterion. Tap again to see the
            descriptor.{" "}
            <Text style={styles.scoredCount}>
              ({scoredCount}/{CRITERIA.length} scored)
            </Text>
          </Text>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.rubricList}
            showsVerticalScrollIndicator={false}
          >
            {CRITERIA.map((criterion) => (
              <CriterionCard
                key={criterion.key}
                criterion={criterion}
                descriptors={BAND_DESCRIPTORS[criterion.key]}
                selectedBand={scores[criterion.key] ?? null}
                onSelectBand={(band) => handleSelectBand(criterion.key, band)}
              />
            ))}
          </ScrollView>

          <View style={[styles.bottomBtns, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Pressable onPress={() => setStep(1)} style={styles.backStepBtn}>
              <Text style={styles.backStepText}>Back</Text>
            </Pressable>
            <Pressable
              onPress={() => allScored && setStep(3)}
              style={[
                styles.nextBtn,
                styles.nextBtnFlex,
                !allScored && styles.nextBtnDisabled,
              ]}
              disabled={!allScored}
            >
              <Text style={styles.nextBtnText}>Review</Text>
            </Pressable>
          </View>
        </MotiView>
      )}

      {/* Step 3: Results Summary */}
      {step === 3 && (
        <MotiView
          key="step3"
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 250 }}
          style={styles.stepContainer}
        >
          <View style={styles.badgeRow}>
            <View style={styles.topicBadge}>
              <Text style={styles.topicBadgeText}>{selectedTopic}</Text>
            </View>
            {studentName.trim() ? (
              <View style={styles.studentBadge}>
                <Text style={styles.studentBadgeText}>{studentName.trim()}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.stepTitle}>Assessment Summary</Text>

          {/* Overall score */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={styles.overallCard}
          >
            <Text style={[styles.overallScore, { color: scoreInfo.color }]}>
              {weightedOverall}
            </Text>
            <Text style={[styles.overallLabel, { color: scoreInfo.color }]}>
              {scoreInfo.label}
            </Text>
          </MotiView>

          {/* Per-criterion breakdown */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.summaryList}
            showsVerticalScrollIndicator={false}
          >
            {CRITERIA.map((criterion) => (
              <View key={criterion.key} style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryLabel}>{criterion.label}</Text>
                  <Text style={styles.summaryWeight}>
                    {Math.round(criterion.weight * 100)}% weight
                  </Text>
                </View>
                <View style={styles.summaryScoreBadge}>
                  <Text style={styles.summaryScoreText}>
                    {scores[criterion.key]}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.bottomBtns, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Pressable onPress={() => setStep(2)} style={styles.backStepBtn}>
              <Text style={styles.backStepText}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.nextBtn, styles.nextBtnFlex]}
            >
              <Text style={styles.nextBtnText}>Save Assessment</Text>
            </Pressable>
          </View>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarBtn: {
    padding: 8,
    minWidth: 60,
  },
  topBarBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: fonts.body,
    fontSize: 14,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  stepDotActive: {
    backgroundColor: colors.gold,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 24,
    marginBottom: 6,
  },
  stepSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    marginBottom: 20,
  },
  scoredCount: {
    color: colors.gold,
    fontFamily: fonts.body,
  },
  scrollArea: {
    flex: 1,
  },

  // Student name input
  nameInputRow: {
    marginBottom: 16,
  },
  nameInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    fontFamily: fonts.body,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  // Topic grid
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 20,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  topicChipSelected: {
    backgroundColor: colors.gold,
  },
  topicText: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: fonts.body,
    fontSize: 14,
  },
  topicTextSelected: {
    color: colors.navy,
  },

  // Badge row (steps 2 & 3)
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  topicBadge: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  topicBadgeText: {
    color: colors.navy,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  studentBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  studentBadgeText: {
    color: "white",
    fontFamily: fonts.body,
    fontSize: 13,
  },

  // Rubric list
  rubricList: {
    paddingBottom: 20,
  },

  // Buttons
  nextBtn: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnFlex: {
    flex: 1,
  },
  nextBtnDisabled: {
    opacity: 0.35,
  },
  nextBtnText: {
    color: colors.navy,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  bottomBtns: {
    flexDirection: "row",
    gap: 12,
  },
  backStepBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  backStepText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: fonts.body,
    fontSize: 16,
  },

  // Summary
  overallCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  overallScore: {
    fontFamily: fonts.display,
    fontSize: 56,
  },
  overallLabel: {
    fontFamily: fonts.body,
    fontSize: 18,
    marginTop: 4,
  },
  summaryList: {
    gap: 10,
    paddingBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: 14,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    color: "white",
    fontFamily: fonts.body,
    fontSize: 14,
  },
  summaryWeight: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 2,
  },
  summaryScoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryScoreText: {
    color: colors.navy,
    fontFamily: fonts.body,
    fontSize: 18,
  },
});
