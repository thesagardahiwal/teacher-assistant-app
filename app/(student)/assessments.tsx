import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { useAssessmentResults } from "../../store/hooks/useAssessmentResults";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function StudentAssessmentsScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const { results, getResultsByStudent, isLoading } = useAssessmentResults();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, [institutionId, user]);

    const loadData = () => {
        if (institutionId && user?.$id) {
            getResultsByStudent(institutionId, user.$id);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className={`mb-3 p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}>
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.assessment?.title || "Assessment"}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <View className={`px-2 py-0.5 rounded mr-2 ${isDark ? "bg-blue-900/50" : "bg-blue-100"}`}>
                            <Text className={`text-xs font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                                {item.assessment?.type || "Test"}
                            </Text>
                        </View>
                        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {item.assessment?.subject?.name || "Subject"}
                        </Text>
                    </View>
                </View>
                <View className={`px-3 py-1 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"} items-end`}>
                    <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.obtainedMarks} <Text className={`text-xs font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>/ {item.totalMarks}</Text>
                    </Text>
                </View>
            </View>

            {item.remarks ? (
                <View className={`mt-2 p-2 rounded bg-gray-50 dark:bg-gray-700/50`}>
                    <Text className={`text-sm italic ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        Teacher: "{item.remarks}"
                    </Text>
                </View>
            ) : null}

            <Text className={`text-xs mt-2 text-right ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Date: {new Date(item.date).toLocaleDateString()}
            </Text>
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header */}
            <View className={`px-5 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>My Assessments</Text>
            </View>

            {isLoading && results.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); setRefreshing(false); }} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="document-text-outline" size={64} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`mt-4 text-lg font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>No assessments yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
