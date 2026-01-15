import { PageHeader } from "@/components/admin/ui/PageHeader";
import { scheduleService } from "@/services";
import { useTheme } from "@/store/hooks/useTheme";
import { ClassSchedule } from "@/types/schedule.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function SchedulesIndex() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSchedules = async () => {
        if (!institutionId) return;
        setLoading(true);
        try {
            const res = await scheduleService.listByInstitution(institutionId);
            setSchedules(res.documents);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [institutionId]);

    const renderItem = ({ item }: { item: ClassSchedule }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(admin)/schedules/${item.$id}`)}
            className="p-4 mb-3 rounded-xl border flex-row items-center justify-between bg-card border-border dark:bg-dark-card dark:border-dark-border"
        >
            <View>
                <View className="flex-row items-center mb-1">
                    <View className="px-2 py-0.5 rounded mr-2 bg-blue-100 dark:bg-blue-900/30">
                        <Text className="text-xs font-bold text-blue-700 dark:text-blue-300">{item.dayOfWeek}</Text>
                    </View>
                    <Text className="text-lg font-bold text-textPrimary dark:text-dark-textPrimary">
                        {item.subject?.name || "No Subject"}
                    </Text>
                </View>

                <Text className="text-sm text-textSecondary dark:text-dark-textSecondary">
                    {item.startTime} - {item.endTime}
                </Text>
                <Text className="text-xs mt-1 text-muted dark:text-dark-muted">
                    {item.class?.name || "Class N/A"} • {item.teacher?.name || "Unknown Teacher"}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
            />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 px-6 pt-6 bg-background dark:bg-dark-background">
            <PageHeader
                title="Class Schedules"
                rightAction={
                    <TouchableOpacity
                        onPress={() => router.push("/(admin)/schedules/create")}
                        className="bg-primary dark:bg-dark-primary p-2 rounded-full"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={schedules}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    ListEmptyComponent={
                        <Text className="text-center mt-10 text-muted dark:text-dark-muted">
                            No schedules found.
                        </Text>
                    }
                />
            )}
        </View>
    );
}
