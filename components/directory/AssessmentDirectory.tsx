import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useAssessments } from "@/store/hooks/useAssessments";
import { useAuth } from "@/store/hooks/useAuth";
import { useSubjects } from "@/store/hooks/useSubjects";
import { useTeacherEligibility } from "@/store/hooks/useTeacherEligibility";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AssessmentCard } from "./AssessmentCard";

export function AssessmentDirectory() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const { assessments, isLoading: loadingAssessments, getAssessmentsByTeacher } = useAssessments();
    const { data: subjects, fetchSubjectsByTeacher } = useSubjects();
    const { isEligible } = useTeacherEligibility();

    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

    useEffect(() => {
        if (institutionId && user?.$id) {
            getAssessmentsByTeacher(institutionId, user.$id);
            fetchSubjectsByTeacher(institutionId, user.$id);
        }
    }, [institutionId, user]);

    const onRefresh = () => {
        if (institutionId && user?.$id) {
            getAssessmentsByTeacher(institutionId, user.$id, true);
            fetchSubjectsByTeacher(institutionId, user.$id);
        }
    };

    const filteredAssessments = assessments.filter((a) =>
        selectedSubjectId === "all" ? true : a.subject?.$id === selectedSubjectId
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2">
                <PageHeader
                    title="Assessments"
                    showBack={true}
                    rightAction={
                        <TouchableOpacity
                            onPress={() => {
                                if (isEligible) {
                                    router.push("/(teacher)/assessments/create");
                                } else {
                                    showAlert("Access Restricted", "You need to be assigned to a class and subject to create assessments.");
                                }
                            }}
                            className={`w-10 h-10 rounded-full items-center justify-center shadow-lg ${isEligible ? "bg-blue-600" : "bg-gray-400"}`}
                        >
                            <Ionicons name="add" size={26} color="white" />
                        </TouchableOpacity>
                    }
                />

                {/* Subject Filter Tabs */}
                <View className="mb-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        <TouchableOpacity
                            onPress={() => setSelectedSubjectId("all")}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedSubjectId === "all"
                                ? "bg-blue-600"
                                : isDark ? "bg-gray-800" : "bg-white border border-gray-200"
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
                                    : isDark ? "bg-gray-800" : "bg-white border border-gray-200"
                                    }`}
                            >
                                <Text className={selectedSubjectId === subject.$id ? "text-white font-medium" : isDark ? "text-gray-300" : "text-gray-600"}>
                                    {subject.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {loadingAssessments && filteredAssessments.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={filteredAssessments}
                    renderItem={({ item, index }) => (
                        <AssessmentCard
                            assessment={item}
                            index={index}
                            onPress={() => router.push(`/(teacher)/assessments/${item.$id}`)}
                        />
                    )}
                    keyExtractor={(item) => item.$id}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loadingAssessments}
                            onRefresh={onRefresh}
                            colors={["#2563EB"]}
                            tintColor={isDark ? "#ffffff" : "#2563EB"}
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
        </View>
    );
}
