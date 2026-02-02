import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAssessmentResults } from "../../store/hooks/useAssessmentResults";
import { useAuth } from "../../store/hooks/useAuth";

const ResultCard = ({ item, index }: { item: any; index: number }) => {
    const { isDark } = useTheme();
    const percentage = item.totalMarks > 0 ? (item.obtainedMarks / item.totalMarks) * 100 : 0;

    // Determine color based on score
    let colorClass = "bg-red-500";
    let textClass = "text-red-600";
    let bgLightClass = "bg-red-50";
    let borderClass = "border-red-200";

    if (percentage >= 80) {
        colorClass = "bg-green-500";
        textClass = "text-green-600";
        bgLightClass = "bg-green-50";
        borderClass = "border-green-200";
    } else if (percentage >= 50) {
        colorClass = "bg-yellow-500";
        textClass = "text-yellow-600";
        bgLightClass = "bg-yellow-50";
        borderClass = "border-yellow-200";
    }

    if (isDark) {
        bgLightClass = "bg-gray-800";
        borderClass = "border-gray-700";
    }

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className={`mb-4 rounded-2xl overflow-hidden border ${borderClass} ${bgLightClass}`}
        >
            <View className={`h-2 w-full ${colorClass}`} />
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-1">
                            <View className={`px-2 py-0.5 rounded mr-2 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                                <Text className={`text-xs font-medium uppercase ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    {item.assessment?.type || "Test"}
                                </Text>
                            </View>
                            <Text className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {item.assessment?.subject?.name}
                            </Text>
                        </View>
                        <Text className={`text-lg font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                            {item.assessment?.title}
                        </Text>
                    </View>
                    <View className="items-end">
                        <View className="flex-row items-baseline">
                            <Text className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                                {item.obtainedMarks}
                            </Text>
                            <Text className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"} ml-0.5`}>
                                /{item.totalMarks}
                            </Text>
                        </View>
                    </View>
                </View>

                {item.remarks && (
                    <View className={`mt-2 mb-3 p-3 rounded-xl ${isDark ? "bg-gray-700/50" : "bg-gray-100/50"}`}>
                        <View className="flex-row gap-2">
                            <Ionicons name="chatbubble-ellipses-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} style={{ marginTop: 2 }} />
                            <Text className={`text-sm italic flex-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                "{item.remarks}"
                            </Text>
                        </View>
                    </View>
                )}

                <View className={`pt-3 border-t ${isDark ? "border-gray-700" : "border-gray-100"} flex-row justify-between items-center`}>
                    <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Evaluated {new Date(item.evaluatedAt).toLocaleDateString()}
                    </Text>
                    <View className={`px-2 py-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                        <Text className={`text-xs font-bold ${isDark ? "text-white" : "text-black"}`}>
                            {percentage.toFixed(0)}%
                        </Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

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

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="flex-1 px-6 pt-6">
                <PageHeader title="My Results" subtitle="Check your assessment scores" />

                {isLoading && results.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : (
                    <Animated.FlatList
                        data={results}
                        keyExtractor={(item) => item.$id}
                        renderItem={({ item, index }) => <ResultCard item={item} index={index} />}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); setRefreshing(false); }} tintColor="#2563EB" />
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20 opacity-50">
                                <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                                    <Ionicons name="document-text-outline" size={40} color={isDark ? "#4B5563" : "#9CA3AF"} />
                                </View>
                                <Text className={`text-lg font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>No assessments yet</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}
