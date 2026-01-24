import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { TeacherAssignment } from "../../types";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function ClassesScreen() {
    const { isDark } = useTheme();
    const { data: assignments, loading, fetchAssignments } = useAssignments();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const currentAssignments = assignments.filter(a => a.class?.academicYear?.isCurrent);

    useEffect(() => {
        if (institutionId && user?.$id) {
            fetchAssignments(institutionId, user.$id);
        }
    }, [institutionId, user?.$id, fetchAssignments]);

    const renderItem = ({ item }: { item: TeacherAssignment }) => (
        <TouchableOpacity className={`p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}>
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.subject?.name || "Unknown Subject"}</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.class?.name ? `${item.class.name} (Sem ${item.class.semester})` : "Class N/A"}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${isDark ? "bg-blue-900/50" : "bg-blue-50"}`}>
                    <Text className="text-blue-500 font-medium text-xs">Room 101</Text>
                    {/* Room is not in model yet, hardcoded */}
                </View>
            </View>

            <View className="flex-row items-center mt-2">
                <MaterialCommunityIcons name="clock-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`ml-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Scheduled</Text>
            </View>
        </TouchableOpacity>
    );

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(async () => {
        if (institutionId && user?.$id) {
            setRefreshing(true);
            await fetchAssignments(institutionId, user.$id);
            setRefreshing(false);
        }
    }, [institutionId, user?.$id]);

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className="px-5 py-4 w-full">
                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>My Classes</Text>
            </View>

            {loading && !refreshing && currentAssignments.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={currentAssignments}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    className="w-full flex-1"
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>No classes assigned</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
