import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { assessmentResultService } from "../../../services/assessmentResult.service";
import { studentService } from "../../../services/student.service";
import { useAssessmentResults } from "../../../store/hooks/useAssessmentResults";
import { useAuth } from "../../../store/hooks/useAuth";
import { useTheme } from "../../../store/hooks/useTheme";
import { Student } from "../../../types";
import { showAlert } from "../../../utils/alert";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function StudentDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { results, getResultsByStudent, isLoading: loadingResults } = useAssessmentResults();

    // We can fetch performance summary if needed, for now deriving from results
    const averageScore = results.length > 0
        ? (results.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.totalMarks * 100), 0) / results.length).toFixed(1)
        : "N/A";

    const loadData = async (forceRefresh = false) => {
        if (!id || !institutionId) return;
        setLoading(true);
        setRefreshing(true);
        try {
            const studentData = await studentService.get(id);
            setStudent(studentData);
            getResultsByStudent(institutionId, studentData.$id, forceRefresh);
        } catch (error) {
            showAlert("Error", "Failed to load student data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, institutionId]);

    const handleDeleteResult = async (resultId: string) => {
        showAlert(
            "Delete Result",
            "Are you sure you want to delete this result?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await assessmentResultService.delete(resultId);
                            // Refresh
                            if (institutionId && id) getResultsByStudent(institutionId, id, true);
                        } catch (error) {
                            showAlert("Error", "Failed to delete result");
                        }
                    }
                }
            ]
        );
    };

    const renderResultItem = ({ item }: { item: any }) => (
        <View className={`mb-3 p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.assessment?.title || "Assessment"}
                    </Text>
                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {item.assessment?.subject?.name || "Subject"}
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded bg-blue-100`}>
                    <Text className="text-blue-700 font-bold text-xs">{item.obtainedMarks} / {item.totalMarks}</Text>
                </View>
            </View>

            {item.remarks ? (
                <Text className={`text-sm italic mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>"{item.remarks}"</Text>
            ) : null}

            <View className="flex-row justify-end gap-3 mt-2">
                {/* 
                    Teacher can edit by navigating to assessment details 
                    Or we could implement inline edit here later
                 */}
                <TouchableOpacity
                    onPress={() => router.push(`/(teacher)/assessments/${item.assessment.$id}`)}
                >
                    <Text className="text-blue-500 font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteResult(item.$id)}>
                    <Text className="text-red-500 font-medium">Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading || refreshing || loadingResults) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-gray-900" : "bg-white"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    const isValidStudent = student?.$id === id;
    if (!isValidStudent) return null;

    const filteredResults = results.filter((result) => result.student.$id === id);

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}>
            {/* Header */}
            <View className={`px-5 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>

                <View className="flex-row items-center">
                    <View className="w-16 h-16 rounded-full bg-indigo-500 items-center justify-center mr-4">
                        <Text className="text-white font-bold text-2xl">{student.name.charAt(0)}</Text>
                    </View>
                    <View>
                        <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{student.name}</Text>
                        <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Roll No: {student.rollNumber}</Text>
                        <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{student.class?.name}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(true); }} />}
                contentContainerStyle={{ padding: 20 }}
            >
                {/* Stats */}
                <View className="flex-row gap-4 mb-6">
                    <View className={`flex-1 p-4 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-blue-50"}`}>
                        <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-blue-700"}`}>
                            {averageScore}%
                        </Text>
                        <Text className={`text-xs ${isDark ? "text-gray-400" : "text-blue-600"}`}>Avg. Score</Text>
                    </View>
                    <View className={`flex-1 p-4 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-green-50"}`}>
                        <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-green-700"}`}>
                            {results.length}
                        </Text>
                        <Text className={`text-xs ${isDark ? "text-gray-400" : "text-green-600"}`}>Assessments</Text>
                    </View>
                </View>

                {/* Results List */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Assessment Results</Text>
                </View>

                {filteredResults.length === 0 ? (
                    <Text className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No results found</Text>
                ) : (
                    filteredResults.map(item => (
                        <View key={item.$id}>{renderResultItem({ item })}</View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
