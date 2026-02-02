import { AddEventModal } from "@/components/calendar/AddEventModal";
import { EnhancedCalendar } from "@/components/calendar/EnhancedCalendar";
import { assessmentService, scheduleService, studentService } from "@/services";
import { localEventService } from "@/services/local/localEvent.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { LocalEvent } from "@/types/local-event.type";
import { ClassSchedule } from "@/types/schedule.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function StudentCalendar() {
    const router = useRouter();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
            const [schRes, assRes, localRes] = await Promise.all([
                scheduleService.listByClass(classId),
                assessmentService.listByClass(institutionId, classId),
                localEventService.getAll()
            ]);

            setSchedules(schRes.documents);
            setAssessments(assRes.documents);
            setLocalEvents(localRes);
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
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
                    </TouchableOpacity>
                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>My Calendar</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="flex-row items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                >
                    <Ionicons name="add" size={18} color="#2563EB" />
                    <Text className="ml-1 text-blue-700 dark:text-blue-300 font-semibold text-xs">New Event</Text>
                </TouchableOpacity>
            </View>
            <EnhancedCalendar
                schedules={schedules}
                assessments={assessments}
                localEvents={localEvents}
                role="STUDENT"
                refreshing={refreshing}
                onRefresh={onRefresh}
                onDateSelected={setSelectedDate}
            />

            <AddEventModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={loadData}
                preSelectedDate={selectedDate}
            />
        </View>
    );
}
