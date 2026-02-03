import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { scheduleService } from "@/services";
import { useTheme } from "@/store/hooks/useTheme";
import { ClassSchedule } from "@/types/schedule.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScheduleCard } from "./ScheduleCard";

interface ScheduleDirectoryProps {
    showAddButton?: boolean;
    onAddPress?: () => void;
    onItemPress?: (id: string, item: ClassSchedule) => void;
    readonly?: boolean;
    viewMode?: "list" | "weekly"; // 'list' for admin, 'weekly' for teacher
    teacherId?: string; // If provided, filters by teacher automatically (for teacher view)
}

const dayOrder: Record<string, number> = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function ScheduleDirectory({
    showAddButton = false,
    onAddPress,
    onItemPress,
    readonly = false,
    viewMode = "list",
    teacherId
}: ScheduleDirectoryProps) {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // List View State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "day",
        order: "asc",
    });

    // Weekly View State
    const [selectedDay, setSelectedDay] = useState("MON");

    const fetchSchedules = async () => {
        if (!institutionId) return;
        if (!refreshing) setLoading(true);
        try {
            // If teacherId is present, we might want to filter *after* fetching or use a specific service method if available.
            // scheduleService.listByInstitution usually returns all.
            // For now, let's fetch all and filter in memory if teacherId is provided, 
            // unless there's a specific teacher schedule endpoint (which usually is listByTeacher but we want to stick to one pattern if possible)
            // Checking previous code: TeacherScheduleScreen used scheduleService.listByInstitution(institutionId) then filtered.
            // Optimally: scheduleService.listByTeacher(institutionId, teacherId)

            let res;
            if (teacherId) {
                // Assuming listByInstitution returns everything, we filter later. 
                // Or better: check if listByTeacher exists? 
                // Previous code used: listByInstitution but filtered locally? No, it used listByInstitution for Admin. Teacher used... wait.
                // TeacherScheduleScreen used `scheduleService.listByTeacher` logic? 
                // Let's assume listByInstitution returns enough.
                // Actually, let's just use listByInstitution and filter.
                res = await scheduleService.listByInstitution(institutionId);
            } else {
                res = await scheduleService.listByInstitution(institutionId);
            }

            setSchedules(res.documents);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchSchedules();
    }, [institutionId]);

    useEffect(() => {
        fetchSchedules();
    }, [institutionId]);

    const processedData = useMemo(() => {
        let result = [...schedules];

        // 1. Filter by Teacher if needed
        if (teacherId) {
            result = result.filter(s => s.teacher?.$id === teacherId);
        }

        // 2. Weekly View Filter
        if (viewMode === "weekly") {
            result = result.filter(s => s.dayOfWeek === selectedDay);
            // Sort by time
            result.sort((a, b) => a.startTime.localeCompare(b.startTime));
            return result;
        }

        // 3. List View Search & Sort
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.dayOfWeek?.toLowerCase().includes(q) ||
                    s.subject?.name?.toLowerCase().includes(q) ||
                    s.class?.name?.toLowerCase().includes(q) ||
                    s.teacher?.name?.toLowerCase().includes(q)
            );
        }

        // List View Sorting
        result.sort((a: any, b: any) => {
            let valA: any = "";
            let valB: any = "";

            switch (sortConfig.key) {
                case "day":
                    valA = dayOrder[a.dayOfWeek] || 99;
                    valB = dayOrder[b.dayOfWeek] || 99;
                    break;
                case "subject":
                    valA = a.subject?.name || "";
                    valB = b.subject?.name || "";
                    break;
                case "class":
                    valA = a.class?.name || "";
                    valB = b.class?.name || "";
                    break;
                default:
                    valA = a[sortConfig.key];
                    valB = b[sortConfig.key];
            }

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (valA < valB) return sortConfig.order === "asc" ? -1 : 1;
            if (valA > valB) return sortConfig.order === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [schedules, searchQuery, sortConfig, viewMode, selectedDay, teacherId]);

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2 w-full">
                <PageHeader
                    title={viewMode === "weekly" ? "My Schedule" : "Class Schedules"}
                    rightAction={
                        showAddButton ? (
                            <TouchableOpacity
                                onPress={onAddPress || (() => router.push("/(admin)/schedules/create"))}
                                className="bg-blue-600 p-2 rounded-full shadow-sm"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        ) : null
                    }
                />

                {viewMode === "list" && (
                    <FilterBar
                        onSearch={setSearchQuery}
                        onSortChange={(key, order) => setSortConfig({ key, order })}
                        sortOptions={[
                            { label: "Day", value: "day" },
                            { label: "Subject", value: "subject" },
                            { label: "Class", value: "class" },
                        ]}
                    />
                )}

                {viewMode === "weekly" && (
                    <View className="mb-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {DAYS.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => setSelectedDay(day)}
                                    className={`mr-3 px-4 py-2 rounded-full ${selectedDay === day
                                        ? "bg-blue-600"
                                        : isDark
                                            ? "bg-gray-800"
                                            : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <Text
                                        className={`font-semibold ${selectedDay === day
                                            ? "text-white"
                                            : isDark
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            {loading && !refreshing && processedData.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={processedData}
                    style={{ flex: 1 }}
                    renderItem={({ item, index }) => (
                        <ScheduleCard
                            schedule={item}
                            index={index}
                            onPress={onItemPress ? () => onItemPress(item.$id, item) : undefined}
                            showDay={viewMode === "list"} // Hide day badge in weekly view since tab shows it
                        />

                    )}
                    ItemSeparatorComponent={() => <View className="h-1 bg-transparent" />}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="calendar-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {searchQuery ? "No matching schedules found." : "No schedules found."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
