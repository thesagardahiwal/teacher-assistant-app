import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { scheduleService } from "../../services";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAttendance } from "../../store/hooks/useAttendance";
import { useAuth } from "../../store/hooks/useAuth";
import { useStudents } from "../../store/hooks/useStudents";
import { useTheme } from "../../store/hooks/useTheme";
import { ClassSchedule } from "../../types/schedule.type";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function TeacherDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { data: assignments, fetchAssignments } = useAssignments();
    const { data: attendanceHistory, fetchAttendance } = useAttendance();
    const { data: students, fetchStudents } = useStudents();

    const [refreshing, setRefreshing] = useState(false);
    const [nextClass, setNextClass] = useState<ClassSchedule | null>(null);

    const loadData = async () => {
        if (institutionId) {
            await Promise.all([
                fetchAssignments(institutionId),
                user?.$id ? fetchAttendance(institutionId, user.$id) : Promise.resolve(),
                fetchStudents(institutionId)
            ]);

            if (user?.$id) {
                // Fetch next class
                const now = new Date();
                const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
                const currentDay = days[now.getDay()];
                const currentTime = now.toTimeString().slice(0, 5); // HH:MM

                try {
                    const res = await scheduleService.getNextClassForTeacher(user.$id, currentDay, currentTime);
                    if (res && res.documents.length > 0) {
                        setNextClass(res.documents[0]);
                    } else {
                        setNextClass(null);
                    }
                } catch (error) {
                    console.error("Error fetching next class:", error);
                }
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [institutionId, user]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [institutionId, user]);

    const stats = [
        { label: "My Classes", value: assignments.length, icon: "book-open-variant", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
        { label: "Students", value: students.length, icon: "account-group", color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
        { label: "Attendance", value: attendanceHistory.length, icon: "clipboard-check", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
    ];

    const QuickAction = ({ icon, label, onPress, color }: any) => (
        <TouchableOpacity onPress={onPress} className={`items-center justify-center p-4 rounded-xl flex-1 mx-2 ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
            <View className={`w-12 h-12 rounded-full ${color} items-center justify-center mb-2`}>
                <MaterialCommunityIcons name={icon} size={24} color="white" />
            </View>
            <Text className={`font-medium text-center ${isDark ? "text-gray-200" : "text-gray-700"}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View>

                    {/* Header */}
                    <View className="flex-row justify-between items-center px-5 py-4">
                        <View>
                            <Text className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Welcome back,</Text>
                            <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{user?.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/(teacher)/profile")}>
                            <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
                                <Text className="text-white font-bold text-lg">{user?.name?.charAt(0)}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap px-3 mb-6">
                        {stats.map((stat, index) => (
                            <View key={index} className="w-1/3 p-2">
                                <View className={`p-3 rounded-xl items-center ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm h-32 justify-center`}>
                                    <View className={`w-10 h-10 rounded-full ${stat.bg} items-center justify-center mb-2`}>
                                        <MaterialCommunityIcons name={stat.icon as any} size={20} color={'white'} className={stat.color} />
                                    </View>
                                    <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stat.value}</Text>
                                    <Text className={`text-xs text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Next Class Card */}
                    <View className="px-5 mb-8">
                        <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Next Class</Text>
                        {nextClass ? (
                            <View className={`p-5 rounded-2xl ${isDark ? "bg-blue-900" : "bg-blue-600"} shadow-lg relative overflow-hidden`}>
                                {/* Background decorations */}
                                <View className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
                                <View className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-white/10" />

                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-blue-100 font-medium mb-1">Upcoming</Text>
                                        <Text className="text-white text-2xl font-bold">{nextClass.subject?.name || "Subject"}</Text>
                                        <Text className="text-blue-100">{nextClass.class?.name ? `Class ${nextClass.class.name}` : "Class N/A"}</Text>
                                    </View>
                                    <View className="bg-white/20 p-2 rounded-lg">
                                        <Ionicons name="notifications" size={20} color="white" />
                                    </View>
                                </View>

                                <View className="flex-row items-center bg-white/20 self-start px-3 py-1 rounded-full">
                                    <Ionicons name="time-outline" size={16} color="white" />
                                    <Text className="text-white ml-2 font-medium">{nextClass.startTime} - {nextClass.endTime}</Text>
                                </View>
                            </View>
                        ) : (
                            <View className={`p-6 rounded-2xl ${isDark ? "bg-gray-800" : "bg-gray-200"} items-center`}>
                                <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>No classes scheduled</Text>
                            </View>
                        )}
                    </View>

                    {/* Quick Actions */}
                    <View className="px-5 mb-8">
                        <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Actions</Text>
                        <View className="flex-row -mx-2">
                            <QuickAction
                                icon="check-circle-outline"
                                label="Take Attendance"
                                color="bg-green-500"
                                onPress={() => router.push("/(teacher)/attendance/create")}
                            />
                            <QuickAction
                                icon="format-list-checks"
                                label="Class List"
                                color="bg-indigo-500"
                                onPress={() => router.push("/(teacher)/classes")}
                            />
                            <QuickAction
                                icon="format-list-checks"
                                label="Class List"
                                color="bg-indigo-500"
                                onPress={() => router.push("/(teacher)/classes")}
                            />
                            <QuickAction
                                icon="calendar-clock"
                                label="Schedule"
                                color="bg-purple-500"
                                onPress={() => router.push("/(teacher)/schedule")}
                            />
                            <QuickAction
                                icon="account-search"
                                label="Find Student"
                                color="bg-orange-500"
                                onPress={() => router.push("/(teacher)/students")}
                            />
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <View className="px-5">
                        <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Recent Activity</Text>
                        {attendanceHistory.slice(0, 3).map((item) => (
                            <View key={item.$id} className={`flex-row items-center p-3 mb-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-sm`}>
                                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="check" size={20} className="text-green-600 dark:text-green-400" />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Attendance Taken</Text>
                                    <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {item.class?.name ? `Class ${item.class.name}` : ""} • {item.subject?.name}
                                    </Text>
                                </View>
                                <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{new Date(item.date).toLocaleDateString()}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
