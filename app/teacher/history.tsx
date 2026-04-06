import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { colors, fonts } from "@/lib/theme";
import { CRITERIA, getScoreLabel } from "@/lib/teacherRubricData";
import { useTeacherStore } from "@/store/teacherStore";
import type { TeacherAssessmentRecord } from "@/types/teacherAssessment";

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AssessmentRow({ item }: { item: TeacherAssessmentRecord }) {
  const [expanded, setExpanded] = useState(false);
  const deleteAssessment = useTeacherStore((s) => s.deleteAssessment);
  const scoreInfo = getScoreLabel(item.weightedOverall);

  const handleDelete = () => {
    Alert.alert(
      "Delete Assessment",
      `Remove this ${item.topic} assessment?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAssessment(item.id),
        },
      ]
    );
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 200 }}
      style={styles.row}
    >
      {/* Main info row */}
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.rowPressable}>
        <View style={styles.rowLeft}>
          {item.studentName ? (
            <Text style={styles.rowStudent}>{item.studentName}</Text>
          ) : null}
          <Text style={styles.rowTopic}>{item.topic}</Text>
          <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={[styles.rowScoreBadge, { backgroundColor: scoreInfo.color }]}>
          <Text style={styles.rowScoreText}>{item.weightedOverall}</Text>
        </View>
        {/* Visible delete button */}
        <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </Pressable>
      </Pressable>

      {/* Expanded detail */}
      {expanded && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 150 }}
          style={styles.detail}
        >
          {CRITERIA.map((c) => (
            <View key={c.key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{c.label}</Text>
              <Text style={styles.detailScore}>
                Band {item.scores[c.key]}
              </Text>
            </View>
          ))}
          <Text style={styles.savedLabel}>Saved · read-only</Text>
        </MotiView>
      )}
    </MotiView>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const assessments = useTeacherStore((s) => s.assessments);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.topBarBtn}>
          <Text style={styles.topBarBtnText}>Back</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>Assessment History</Text>
        <Pressable
          onPress={() => router.push("/teacher")}
          style={styles.topBarBtn}
        >
          <Text style={[styles.topBarBtnText, { color: colors.gold }]}>
            + New
          </Text>
        </Pressable>
      </View>

      {assessments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No assessments yet</Text>
          <Text style={styles.emptySubtitle}>
            Saved assessments will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AssessmentRow item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  topBarTitle: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 18,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  row: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 14,
  },
  rowPressable: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowLeft: {
    flex: 1,
  },
  rowStudent: {
    color: colors.gold,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 2,
  },
  rowTopic: {
    color: "white",
    fontFamily: fonts.body,
    fontSize: 16,
  },
  rowDate: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    marginTop: 2,
  },
  rowScoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowScoreText: {
    color: "white",
    fontFamily: fonts.body,
    fontSize: 16,
  },
  detail: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
  },
  detailScore: {
    color: colors.gold,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  savedLabel: {
    color: colors.success,
    fontFamily: fonts.body,
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,75,75,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  deleteBtnText: {
    color: "#FF4B4B",
    fontSize: 13,
    fontFamily: fonts.body,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: "white",
    fontFamily: fonts.display,
    fontSize: 20,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.4)",
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
  },
});
