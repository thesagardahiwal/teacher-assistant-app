import { AddEventModal } from "@/components/calendar/AddEventModal";
import { CalendarAgenda } from "@/components/calendar/CalendarAgenda";
import { assessmentService, scheduleService } from "@/services";
import { localEventService } from "@/services/local/localEvent.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Assessment } from "@/types/assessment.type";
import { LocalEvent } from "@/types/local-event.type";
import { ClassSchedule } from "@/types/schedule.type";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function PrincipalCalendar() {
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
            // Monitor all schedules/assessments in the institution? 
            // Teacher view shows *their* schedule. 
            // Principal might want to see *all* or just general events?
            // "Same behaviour" implies functional parity. 
            // For now, I'll keep it scoped to user (Principal might not have schedules, but might want to add events).
            // Actually, if Principal has no schedule, this might be empty.
            // But User said "Same behaviour". I will keep logic strict to what Teacher has 
            // to ensure "Functional" parity, even if data differs.
            const [schRes, assRes, localRes] = await Promise.all([
                scheduleService.listByTeacher(user.$id), // Probably empty for Principal
                assessmentService.listByTeacher(institutionId, user.$id),
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
            <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-row justify-between items-center">
                <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Calendar</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="flex-row items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                >
                    <Ionicons name="add" size={18} color="#2563EB" />
                    <Text className="ml-1 text-blue-700 dark:text-blue-300 font-semibold text-xs">New Event</Text>
                </TouchableOpacity>
            </View>
            <CalendarAgenda
                schedules={schedules}
                assessments={assessments}
                localEvents={localEvents}
                role="PRINCIPAL" // Passed Role
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
