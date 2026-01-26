import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAttendance } from "../../../store/hooks/useAttendance";
import { useAuth } from "../../../store/hooks/useAuth";
import { useTheme } from "../../../store/hooks/useTheme";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function AttendanceDashboard() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const { data: attendanceHistory, fetchAttendance, loading } = useAttendance();
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (institutionId && user?.$id) {
            await fetchAttendance(institutionId, user.$id);
        }
    };

    useEffect(() => {
        loadData();
    }, [institutionId, user?.$id]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Calculate Stats
    const stats = useMemo(() => {
        const subjectStats: Record<string, any> = {};

        attendanceHistory.forEach(record => {
            if (!record.subject || !record.class) return;
            const key = `${record.subject.$id}-${record.class.$id}`;
            if (!subjectStats[key]) {
                subjectStats[key] = {
                    subjectName: record.subject?.name || "Unknown Subject",
                    className: record.class?.name || "Unknown Class",
                    classesTaken: 0,
                    lastTaken: record.date,
                };
            }
            subjectStats[key].classesTaken += 1;


            // Update last taken if this record is newer
            if (new Date(record.date) > new Date(subjectStats[key].lastTaken)) {
                subjectStats[key].lastTaken = record.date;
            }
        });

        return Object.values(subjectStats);
    }, [attendanceHistory]);

    const totalClassesTaken = attendanceHistory.length;

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header */}
            <View className={`px-5 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"} bg-white dark:bg-gray-900`}>
                <View className="flex-row items-center mb-4">
                    <Text className={`text-xl font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>Attendance</Text>
                </View>

                {/* Overall Stats */}
                <View className={`p-4 rounded-xl flex-row items-center justify-between ${isDark ? "bg-blue-900/20" : "bg-blue-50"}`}>
                    <View>
                        <Text className={`text-sm mb-1 ${isDark ? "text-blue-300" : "text-blue-700"}`}>Total Classes Taken</Text>
                        <Text className={`text-3xl font-bold ${isDark ? "text-blue-400" : "text-blue-800"}`}>{totalClassesTaken}</Text>
                    </View>
                    <View className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? "bg-blue-900/40" : "bg-blue-100"}`}>
                        <MaterialCommunityIcons name="clipboard-check" size={24} color={isDark ? "#60A5FA" : "#1E40AF"} />
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-5 pt-5"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Take Attendance Button */}
                <TouchableOpacity
                    onPress={() => router.push("/(teacher)/attendance/create")}
                    className="flex-row items-center justify-center p-4 rounded-xl bg-blue-600 mb-6 shadow-sm"
                >
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Take New Attendance</Text>
                </TouchableOpacity>

                {/* Subject-wise Stats */}
                <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Subject-wise Summary</Text>

                {loading && !refreshing && stats.length === 0 ? (
                    <ActivityIndicator size="large" color="#2563EB" />
                ) : stats.length > 0 ? (
                    stats.map((stat, index) => (
                        <View key={index} className={`p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}>
                            <View className="flex-row justify-between items-start mb-2">
                                <View>
                                    <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{stat.subjectName}</Text>
                                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.className}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.classesTaken} Classes</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center mt-1">
                                <MaterialCommunityIcons name="clock-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    Last taken: {new Date(stat.lastTaken).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="items-center justify-center py-10">
                        <Text className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>No attendance records found</Text>
                    </View>
                )}

                {/* Recent Sessions List */}
                {attendanceHistory.length > 0 && (
                    <View className="mt-6 mb-4">
                        <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Recent Sessions</Text>
                        {attendanceHistory
                            .slice()
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 10) // Show last 10
                            .map((session) => (
                                <TouchableOpacity
                                    key={session.$id}
                                    onPress={() => router.push(`/(teacher)/attendance/${session.$id}`)}
                                    className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                                >
                                    <View>
                                        <Text className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {session.class?.name} • {session.subject?.name}
                                        </Text>
                                        <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className={`text-xs mr-2 ${isDark ? "text-blue-400" : "text-blue-600"}`}>Edit</Text>
                                        <Ionicons name="chevron-forward" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
