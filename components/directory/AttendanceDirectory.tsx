import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useAttendance } from "@/store/hooks/useAttendance";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AttendanceSessionCard } from "./AttendanceSessionCard";
import { AttendanceStatsCard } from "./AttendanceStatsCard";

export function AttendanceDirectory() {
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

            if (new Date(record.date) > new Date(subjectStats[key].lastTaken)) {
                subjectStats[key].lastTaken = record.date;
            }
        });

        return Object.values(subjectStats);
    }, [attendanceHistory]);

    const totalClassesTaken = attendanceHistory.length;

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2">
                <PageHeader
                    title="Attendance"
                    rightAction={
                        <View className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${isDark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                            <MaterialCommunityIcons name="clipboard-check" size={16} color={isDark ? "#60A5FA" : "#2563EB"} />
                            <Text className={`font-bold ${isDark ? "text-blue-400" : "text-blue-700"}`}>
                                {totalClassesTaken} Classes
                            </Text>
                        </View>
                    }
                />
            </View>

            <ScrollView
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Take Attendance Button */}
                <TouchableOpacity
                    onPress={() => router.push("/(teacher)/attendance/create")}
                    className="flex-row items-center justify-center p-4 rounded-2xl bg-blue-600 mb-8 shadow-lg shadow-blue-500/30"
                >
                    <Ionicons name="add-circle" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Take New Attendance</Text>
                </TouchableOpacity>

                {/* Subject-wise Stats */}
                <View className="flex-row items-center mb-4">
                    <Text className={`text-lg font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>Summary</Text>
                </View>

                {loading && !refreshing && stats.length === 0 ? (
                    <ActivityIndicator size="large" color="#2563EB" />
                ) : stats.length > 0 ? (
                    stats.map((stat, index) => (
                        <AttendanceStatsCard
                            key={index}
                            subjectName={stat.subjectName}
                            className={stat.className}
                            classesTaken={stat.classesTaken}
                            lastTaken={stat.lastTaken}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-10 opacity-70">
                        <MaterialCommunityIcons name="chart-bar-stacked" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
                        <Text className={`mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No attendance records found</Text>
                    </View>
                )}

                {/* Recent Sessions List */}
                {attendanceHistory.length > 0 && (
                    <View className="mt-8 mb-4">
                        <View className="flex-row items-center mb-4">
                            <Text className={`text-lg font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>Recent Sessions</Text>
                        </View>
                        {attendanceHistory
                            .slice()
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 10)
                            .map((session, index) => (
                                <AttendanceSessionCard
                                    key={session.$id}
                                    session={session}
                                    index={index}
                                    onPress={() => router.push(`/(teacher)/attendance/${session.$id}`)}
                                />
                            ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
