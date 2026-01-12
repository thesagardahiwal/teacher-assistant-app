import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAttendance } from "../../../store/hooks/useAttendance";
import { useAuth } from "../../../store/hooks/useAuth";
import { useTheme } from "../../../store/hooks/useTheme";
import { Attendance } from "../../../types";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function AttendanceHistoryScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();
    const { data: attendanceHistory, loading, fetchAttendance } = useAttendance();

    useEffect(() => {
        if (institutionId && user?.$id) {
            fetchAttendance(institutionId, user.$id);
        }
    }, [institutionId, user]);

    const renderItem = ({ item }: { item: Attendance }) => (
        <View className={`p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}>
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.subject?.name || "Subject"}</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {item.class?.division ? `Class ${item.class.year}-${item.class.division}` : "Class N/A"}
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${isDark ? "bg-green-900/50" : "bg-green-50"}`}>
                    <Text className="text-green-500 font-medium text-xs">Completed</Text>
                </View>
            </View>

            <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons name="calendar-blank" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`ml-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.date}</Text>
            </View>
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className="px-5 py-4 flex-row justify-between items-center">
                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Attendance</Text>
                <TouchableOpacity
                    onPress={() => router.push("/(teacher)/attendance/create")}
                    className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
                >
                    <MaterialCommunityIcons name="plus" size={20} color="white" />
                    <Text className="text-white font-bold ml-1">Take New</Text>
                </TouchableOpacity>
            </View>

            {loading && attendanceHistory.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={attendanceHistory}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
                            <Text className={`mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No attendance records found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
