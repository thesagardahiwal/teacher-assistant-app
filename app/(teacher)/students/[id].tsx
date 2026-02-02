import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StudentProfileView } from "@/components/directory/StudentProfileView";
import { studentService } from "@/services/student.service";
import { useAssessmentResults } from "@/store/hooks/useAssessmentResults";
import { useTheme } from "@/store/hooks/useTheme";
import { Student } from "@/types";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function StudentDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

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
                <PageHeader title="Student Details" showBack={true} />
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
        </View>
    );
}
