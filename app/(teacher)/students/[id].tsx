import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { StudentProfileView } from "@/components/directory/StudentProfileView";
import { pdfService } from "@/services/local/pdf.service";
import { studentService } from "@/services/student.service";
import { useAssessmentResults } from "@/store/hooks/useAssessmentResults";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { showAlert } from "@/utils/alert";
import { pdfTemplates } from "@/utils/pdf/pdfTemplates";
import { toSafeFileName } from "@/utils/pdf/pdfUtils";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { getVaultRouteForRole } from "@/utils/vault";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StudentDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [vaultModalVisible, setVaultModalVisible] = useState(false);
    const [savedFileName, setSavedFileName] = useState("");

    // Using simple hook for now, or fetching direct if needed
    const { results, getResultsByStudent, isLoading: loadingResults } = useAssessmentResults();

    const loadData = async () => {
        if (!id || !institutionId) return;
        setLoading(true);
        try {
            const studentData = await studentService.get(id);
            setStudent(studentData);
            await getResultsByStudent(institutionId, studentData.$id);
        } catch (error) {
            showAlert("Error", "Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, institutionId]);

    const averageScore = results.length > 0
        ? (results.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks * 100), 0) / results.length).toFixed(1)
        : "N/A";

    if (loading || loadingResults) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!student) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <Text className={isDark ? "text-white" : "text-gray-900"}>Student not found</Text>
            </View>
        );
    }

    return (
            <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6">
                <PageHeader
                    title="Student Details"
                    showBack={true}
                    rightAction={
                        exporting ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                            <TouchableOpacity
                                onPress={async () => {
                                    if (!student || !user) return;
                                    try {
                                        setExporting(true);
                                        const institutionName =
                                            typeof user.institution === "object" ? user.institution?.name || "" : "";

                                        const html = pdfTemplates.studentPerformanceReport({
                                            studentName: student.name || "Student",
                                            institutionName,
                                            stats: {
                                                averageScore: `${averageScore}%`,
                                                totalAssessments: results.length,
                                            },
                                            results: results.map((r) => ({
                                                assessment: r.assessment?.title || "Assessment",
                                                subject: r.assessment?.subject?.name || "-",
                                                obtained: r.obtainedMarks,
                                                total: r.totalMarks,
                                                remarks: r.remarks,
                                            })),
                                        });

                                        const fileName = `${toSafeFileName(student.name || "Student")}_Performance_Report_${new Date().toISOString().split("T")[0]}.pdf`;

                                        const result = await pdfService.exportAndSave({
                                            html,
                                            fileName,
                                            addedByRole: user.role as any,
                                            tags: ["performance", "student"],
                                            classId: student.class?.$id,
                                        });

                                        setSavedFileName(result.file.fileName);
                                        setVaultModalVisible(true);
                                    } catch (error) {
                                        console.error(error);
                                    } finally {
                                        setExporting(false);
                                    }
                                }}
                                className="bg-blue-600 p-2 rounded-full"
                            >
                                <Ionicons name="download-outline" size={20} color="white" />
                            </TouchableOpacity>
                        )
                    }
                />
            </View>
            <View className="flex-1 px-4">
                <StudentProfileView
                    student={student}
                    stats={{
                        averageScore,
                        totalAssessments: results.length
                    }}
                    results={results}
                />
            </View>

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
        </View>
    );
}
