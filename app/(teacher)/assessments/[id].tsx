import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { assessmentService } from "../../../services/assessment.service";
import { useAssessmentResults } from "../../../store/hooks/useAssessmentResults";
import { useAuth } from "../../../store/hooks/useAuth";
import { useStudents } from "../../../store/hooks/useStudents";
import { useTheme } from "../../../store/hooks/useTheme";
import { Assessment } from "../../../types/assessment.type";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function AssessmentDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);

    const { data: students, fetchStudents } = useStudents();
    const { results, getResultsByAssessment, saveResult, isLoading: submitting } = useAssessmentResults();

    // Map student ID to marks/remarks
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [remarks, setRemarks] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id && institutionId) {
            loadAssessment();
            getResultsByAssessment(institutionId, id);
        }
    }, [id, institutionId]);

    const loadAssessment = async () => {
        try {
            const res = await assessmentService.get(id);
            setAssessment(res);
            // Fetch students for this class
            if (res.class?.$id && institutionId) {
                fetchStudents(institutionId, [res.class.$id]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load assessment details");
        } finally {
            setLoading(false);
        }
    };

    // Populate local state when results load
    useEffect(() => {
        if (results && results.length > 0) {
            const newMarks: Record<string, string> = {};
            const newRemarks: Record<string, string> = {};
            results.forEach(r => {
                if (r.student?.$id) {
                    newMarks[r.student.$id] = r.obtainedMarks.toString();
                    newRemarks[r.student.$id] = r.remarks || "";
                }
            });
            setMarks(prev => ({ ...prev, ...newMarks }));
            setRemarks(prev => ({ ...prev, ...newRemarks }));
        }
    }, [results]);

    const [savingStudentId, setSavingStudentId] = useState<string | null>(null);

    const handleSave = async (studentId: string) => {
        if (!assessment || !user?.$id || !institutionId) return;

        const obtained = marks[studentId];
        const remark = remarks[studentId];

        if (!obtained) {
            Alert.alert("Error", "Please enter marks");
            return;
        }

        const numMarks = parseFloat(obtained);
        if (isNaN(numMarks) || numMarks < 0 || numMarks > assessment.maxMarks) {
            Alert.alert("Error", `Marks must be between 0 and ${assessment.maxMarks}`);
            return;
        }

        setSavingStudentId(studentId);
        try {
            await saveResult({
                institution: institutionId as any,
                assessment: assessment.$id as any,
                student: studentId as any,
                evaluatedBy: user.$id as any,
                obtainedMarks: numMarks,
                totalMarks: assessment.maxMarks,
                remarks: remark,
                evaluatedAt: new Date().toISOString()
            });
            Alert.alert("Success", "Grade saved successfully");
        } catch (error) {
            Alert.alert("Error", "Failed to save grade");
        } finally {
            setSavingStudentId(null);
        }
    };

    const renderStudentRow = ({ item }: { item: any }) => {
        const hasResult = !!results.find(r => r.student?.$id === item.$id);

        return (
            <View className={`mb-3 p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <View className="flex-row justify-between items-center mb-3">
                    <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{item.name}</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.rollNumber}</Text>
                </View>

                <View className="flex-row gap-4 items-center">
                    <View className="flex-1">
                        <Text className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Marks (Max {assessment?.maxMarks})</Text>
                        <TextInput
                            className={`p-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                            keyboardType="numeric"
                            value={marks[item.$id] || ""}
                            onChangeText={(t) => setMarks(prev => ({ ...prev, [item.$id]: t }))}
                            placeholder="0"
                            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        />
                    </View>
                    <View className="flex-[2]">
                        <Text className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Remarks</Text>
                        <TextInput
                            className={`p-2 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                            value={remarks[item.$id] || ""}
                            onChangeText={(t) => setRemarks(prev => ({ ...prev, [item.$id]: t }))}
                            placeholder="Good work..."
                            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => handleSave(item.$id)}
                        disabled={savingStudentId !== null}
                        className={`h-10 w-10 items-center justify-center rounded-lg mt-5 ${hasResult ? "bg-green-100" : "bg-blue-100"}`}
                    >
                        {savingStudentId === item.$id ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                            <Ionicons name={hasResult ? "checkmark" : "save-outline"} size={20} color={hasResult ? "#16A34A" : "#2563EB"} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading || !assessment) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-white"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
            {/* Header */}
            <View className={`px-5 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-xl font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>{assessment.title}</Text>
                </View>
                <View className="flex-row gap-4">
                    <View className={`px-3 py-1 rounded bg-blue-100 self-start`}>
                        <Text className="text-blue-700 font-medium text-xs">{assessment.type}</Text>
                    </View>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{assessment.subject?.name}</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{assessment.class?.name}</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Max: {assessment.maxMarks}</Text>
                </View>
            </View>

            {/* Student List */}
            <FlatList
                data={students}
                keyExtractor={(item) => item.$id}
                renderItem={renderStudentRow}
                contentContainerStyle={{ padding: 20 }}
                ListHeaderComponent={
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Grade Students ({students.length})
                    </Text>
                }
            />
        </View>
    );
}
