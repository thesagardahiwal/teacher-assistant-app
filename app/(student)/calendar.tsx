import { CalendarAgenda } from "@/components/calendar/CalendarAgenda";
import { assessmentService, scheduleService, studentService } from "@/services";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { ClassSchedule } from "@/types/schedule.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentCalendar() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!user?.$id || !institutionId) return;

        try {
            // 1. Get Student Profile to know the Class
            const student = await studentService.getByUserId(user.$id);
            if (!student || !student.class) {
                console.warn("No student profile or class found for user");
                setLoading(false);
                return;
            }

            const classId = typeof student.class === 'string' ? student.class : student.class.$id;

            // 2. Fetch Class Data
            const [schRes, assRes] = await Promise.all([
                scheduleService.listByClass(classId),
                assessmentService.listByClass(institutionId, classId)
            ]);

            setSchedules(schRes.documents);
            setAssessments(assRes.documents);
        } catch (error) {
            console.error("Failed to load calendar data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [user, institutionId]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [user, institutionId])
    );

    if (loading && !refreshing) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`} edges={['top']}>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                </TouchableOpacity>
                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>My Calendar</Text>
            </View>
            <CalendarAgenda
                schedules={schedules}
                assessments={assessments}
                role="STUDENT"
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SafeAreaView>
    );
}
