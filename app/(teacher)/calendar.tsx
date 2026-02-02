import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AddEventModal } from "@/components/calendar/AddEventModal";
import { EnhancedCalendar } from "@/components/calendar/EnhancedCalendar";
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

export default function TeacherCalendar() {
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
            const [schRes, assRes, localRes] = await Promise.all([
                scheduleService.listByTeacher(user.$id),
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
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2">
                <PageHeader
                    title="Calendar"
                    showBack={false}
                    rightAction={
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="flex-row items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                        >
                            <Ionicons name="add" size={18} color="#2563EB" />
                            <Text className="ml-1 text-blue-700 dark:text-blue-300 font-semibold text-xs">New Event</Text>
                        </TouchableOpacity>
                    }
                />
            </View>
            <EnhancedCalendar
                schedules={schedules}
                assessments={assessments}
                localEvents={localEvents}
                role="TEACHER"
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
