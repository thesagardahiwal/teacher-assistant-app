import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { scheduleService } from "../../services";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { ClassSchedule } from "../../types/schedule.type";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function TeacherScheduleScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string>("MON");

    const days = [
        { id: "MON", label: "Mon" },
        { id: "TUE", label: "Tue" },
        { id: "WED", label: "Wed" },
        { id: "THU", label: "Thu" },
        { id: "FRI", label: "Fri" },
        { id: "SAT", label: "Sat" },
        { id: "SUN", label: "Sun" },
    ];

    useEffect(() => {
        fetchSchedules();
    }, [institutionId, user, selectedDay]);

    const fetchSchedules = async () => {
        if (!user?.$id) return;
        setLoading(true);
        try {
            const res = await scheduleService.listByTeacher(user.$id, selectedDay);
            setSchedules(res.documents);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ClassSchedule }) => (
        <View className={`p-4 mb-3 rounded-xl border flex-row items-center border-l-4 ${isDark ? "bg-gray-800 border-gray-700 border-l-blue-500" : "bg-white border-gray-100 border-l-blue-500"}`}>
            <View className="flex-1">
                <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.subject?.name || "No Subject"}
                </Text>
                <Text className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {item.class?.name || "Class N/A"}
                </Text>
                <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />
                    <Text className={`text-xs ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {item.startTime} - {item.endTime}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
                </TouchableOpacity>
                <Text className={`text-xl font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>My Schedule</Text>
            </View>

            {/* Day Selector */}
            <View className="py-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {days.map((day) => (
                        <TouchableOpacity
                            key={day.id}
                            onPress={() => setSelectedDay(day.id)}
                            className={`mr-3 px-4 py-2 rounded-full ${selectedDay === day.id
                                ? "bg-blue-600"
                                : (isDark ? "bg-gray-800" : "bg-white")}`}
                        >
                            <Text className={`font-medium ${selectedDay === day.id ? "text-white" : (isDark ? "text-gray-300" : "text-gray-700")}`}>
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Schedule List */}
            <View className="flex-1 px-4">
                {loading ? (
                    <ActivityIndicator testID="loading-schedules" size="large" color="#2563EB" className="mt-10" />
                ) : (
                    <FlatList
                        data={schedules}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.$id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20">
                                <MaterialCommunityIcons name="calendar-clock" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
                                <Text className={`mt-4 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                    No classes scheduled for {days.find(d => d.id === selectedDay)?.label}
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}
