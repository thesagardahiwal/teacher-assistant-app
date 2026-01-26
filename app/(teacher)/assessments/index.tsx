import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAssessments } from "../../../store/hooks/useAssessments";
import { useAuth } from "../../../store/hooks/useAuth";
import { useSubjects } from "../../../store/hooks/useSubjects";
import { useTeacherEligibility } from "../../../store/hooks/useTeacherEligibility";
import { useTheme } from "../../../store/hooks/useTheme";
import { Assessment } from "../../../types/assessment.type";
import { showAlert } from "../../../utils/alert";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function AssessmentsListScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const { assessments, isLoading: loadingAssessments, getAssessmentsByTeacher } = useAssessments();
    const { data: subjects, fetchSubjects } = useSubjects();
    const { isEligible } = useTeacherEligibility();

    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

    useEffect(() => {
        if (institutionId && user?.$id) {
            getAssessmentsByTeacher(institutionId, user.$id);
            fetchSubjects(institutionId);
        }
    }, [institutionId, user, getAssessmentsByTeacher, fetchSubjects]);

    const onRefresh = () => {
        if (institutionId && user?.$id) {
            getAssessmentsByTeacher(institutionId, user.$id, true); // forceRefresh = true
            fetchSubjects(institutionId);
        }
    };

    const filteredAssessments = assessments.filter((a) =>
        selectedSubjectId === "all" ? true : a.subject?.$id === selectedSubjectId
    );

    const renderAssessmentItem = ({ item }: { item: Assessment }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(teacher)/assessments/${item.$id}`)}
            className={`p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</Text>
                    <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded mr-2 ${isDark ? "bg-blue-900/50" : "bg-blue-100"}`}>
                            <Text className={`text-xs font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>{item.type}</Text>
                        </View>
                        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.subject?.name}</Text>
                    </View>
                </View>
                <View className={`px-3 py-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                    <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{item.class?.name}</Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center">
                    <MaterialCommunityIcons name="calendar" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(item.dueDate || item.$createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <Text className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Max: {item.maxMarks}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header */}
            <View className={`px-5 pb-4 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
                    </TouchableOpacity>
                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Assessments</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Subject Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    <TouchableOpacity
                        onPress={() => setSelectedSubjectId("all")}
                        className={`px-4 py-2 rounded-full mr-2 ${selectedSubjectId === "all"
                            ? "bg-blue-600"
                            : isDark ? "bg-gray-800" : "bg-gray-100"
                            }`}
                    >
                        <Text className={selectedSubjectId === "all" ? "text-white font-medium" : isDark ? "text-gray-300" : "text-gray-600"}>All Subjects</Text>
                    </TouchableOpacity>
                    {subjects.map((subject) => (
                        <TouchableOpacity
                            key={subject.$id}
                            onPress={() => setSelectedSubjectId(subject.$id)}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedSubjectId === subject.$id
                                ? "bg-blue-600"
                                : isDark ? "bg-gray-800" : "bg-gray-100"
                                }`}
                        >
                            <Text className={selectedSubjectId === subject.$id ? "text-white font-medium" : isDark ? "text-gray-300" : "text-gray-600"}>
                                {subject.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            {loadingAssessments && filteredAssessments.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={filteredAssessments}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderAssessmentItem}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={loadingAssessments}
                            onRefresh={onRefresh}
                            colors={["#2563EB"]} // Android
                            tintColor={isDark ? "#ffffff" : "#2563EB"} // iOS
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`mt-4 text-lg font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>No assessments found</Text>
                            <Text className={`text-center mt-2 ${isDark ? "text-gray-600" : "text-gray-500"}`}>
                                Create new assessments by tapping the + button
                            </Text>
                        </View>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                onPress={() => {
                    if (isEligible) {
                        router.push("/(teacher)/assessments/create");
                    } else {
                        showAlert("Access Restricted", "You need to be assigned to a class and subject to create assessments.");
                    }
                }}
                className={`absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${isEligible ? "bg-blue-600" : "bg-gray-400"}`}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}
