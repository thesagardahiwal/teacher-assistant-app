import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { StudentDirectory } from "@/components/directory/StudentDirectory";
import { assessmentResultService } from "@/services/assessmentResult.service";
import { pdfService } from "@/services/local/pdf.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useStudents } from "@/store/hooks/useStudents";
import { pdfTemplates } from "@/utils/pdf/pdfTemplates";
import { toSafeFileName } from "@/utils/pdf/pdfUtils";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { getVaultRouteForRole } from "@/utils/vault";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

export default function StudentsIndex() {
  const router = useRouter();
  const { user } = useAuth();
  const institutionId = useInstitutionId();
  const { data: students } = useStudents();
  const [exporting, setExporting] = useState(false);
  const [vaultModalVisible, setVaultModalVisible] = useState(false);
  const [savedFileName, setSavedFileName] = useState("");

  const handleDownload = async () => {
    if (!institutionId || !user) return;
    if (!students.length) return;
    try {
      setExporting(true);
      const resultRes = await assessmentResultService.listByInstitution(institutionId);
      const results = resultRes.documents;

      const totals: Record<string, { totalScore: number; count: number }> = {};
      results.forEach((r) => {
        const studentId = typeof r.student === "object" ? r.student.$id : r.student;
        if (!studentId) return;
        const percentage = r.totalMarks > 0 ? (r.obtainedMarks / r.totalMarks) * 100 : 0;
        if (!totals[studentId]) totals[studentId] = { totalScore: 0, count: 0 };
        totals[studentId].totalScore += percentage;
        totals[studentId].count += 1;
      });

      const rows = students.map((s) => {
        const entry = totals[s.$id];
        const avgScore = entry && entry.count > 0 ? entry.totalScore / entry.count : 0;
        return {
          name: s.name || "Student",
          rollNumber: s.rollNumber,
          className: s.class?.name,
          avgScore,
          totalAssessments: entry?.count || 0,
        };
      });

      const institutionName =
        typeof user.institution === "object" ? user.institution?.name || "" : "";

      const html = pdfTemplates.allStudentsPerformance({
        institutionName,
        rows,
      });

      const fileName = `${toSafeFileName("All_Students_Performance")}_${new Date().toISOString().split("T")[0]}.pdf`;

      const saved = await pdfService.exportAndSave({
        html,
        fileName,
        addedByRole: user.role as any,
        tags: ["performance", "students"],
      });

      setSavedFileName(saved.file.fileName);
      setVaultModalVisible(true);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <StudentDirectory
        showAddButton={true}
        onItemPress={(id) => router.push(`/(admin)/students/${id}`)}
        rightAction={
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleDownload}
              className="bg-blue-600 p-2 rounded-full shadow-sm"
            >
              {exporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="download-outline" size={22} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/students/create")}
              className="bg-blue-600 p-2 rounded-full shadow-sm"
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          </View>
        }
      />
      <ConfirmationModal
        visible={vaultModalVisible}
        title="Saved to Study Vault"
        message={savedFileName ? `${savedFileName} was saved to your vault.` : "PDF saved to your vault."}
        confirmText="Open Vault"
        cancelText="Close"
        onConfirm={() => {
          setVaultModalVisible(false);
          router.push(getVaultRouteForRole(user?.role) as any);
        }}
        onCancel={() => setVaultModalVisible(false)}
      />
    </>
  );
}
