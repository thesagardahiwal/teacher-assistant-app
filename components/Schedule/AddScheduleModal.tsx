import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { scheduleService } from "../../services";
import { academicYearService } from "../../services/academicYear.service";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { ClassSchedule, ClassSchedulePayload } from "../../types/schedule.type";
import { useInstitutionId } from "../../utils/useInstitutionId";

interface AddScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    initialSchedule?: ClassSchedule | null;
}

const DAYS = [
    { id: "MON", label: "Monday" },
    { id: "TUE", label: "Tuesday" },
    { id: "WED", label: "Wednesday" },
    { id: "THU", label: "Thursday" },
    { id: "FRI", label: "Friday" },
    { id: "SAT", label: "Saturday" },
    { id: "SUN", label: "Sunday" },
];

export default function AddScheduleModal({ visible, onClose, onSave, initialSchedule }: AddScheduleModalProps) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const { data: assignments, fetchAssignments, loading: loadingAssignments } = useAssignments();

    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("MON");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [loading, setLoading] = useState(false);
    const [academicYearId, setAcademicYearId] = useState<string | null>(null);

    // Pre-fill for edit mode
    useEffect(() => {
        if (initialSchedule && visible) {
            setSelectedClassId(initialSchedule.class.$id);
            setSelectedSubjectId(initialSchedule.subject.$id);
            setSelectedDay(initialSchedule.dayOfWeek);
            setStartTime(initialSchedule.startTime);
            setEndTime(initialSchedule.endTime);
        } else if (visible && !initialSchedule) {
            // Reset fields when opening for create
            setSelectedClassId("");
            setSelectedSubjectId("");
            setSelectedDay("MON");
            setStartTime("09:00");
            setEndTime("10:00");
        }
    }, [initialSchedule, visible]);

    useEffect(() => {
        const loadData = async () => {
            if (visible && institutionId && user?.$id) {
                fetchAssignments(institutionId, user.$id);

                try {
                    const yearsRes = await academicYearService.list(institutionId);
                    const currentYear = yearsRes.documents.find(y => y.isCurrent);
                    if (currentYear) {
                        setAcademicYearId(currentYear.$id);
                    } else {
                        Alert.alert("Notice", "No active academic year found. Please ask admin to set one.");
                    }
                } catch (err) {
                    console.error("Failed to fetch academic year", err);
                }
            }
        };
        loadData();
    }, [visible, institutionId, user?.$id]);

    const handleClassSelect = (classId: string, subjectId: string) => {
        setSelectedClassId(classId);
        setSelectedSubjectId(subjectId);
    };

    const handleSubmit = async () => {
        if (!selectedClassId || !selectedSubjectId || !startTime || !endTime || !user || !institutionId) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!academicYearId) {
            Alert.alert("Error", "Cannot create schedule without an active academic year.");
            return;
        }

        if (startTime >= endTime) {
            Alert.alert("Error", "End time must be after start time");
            return;
        }

        setLoading(true);
        try {
            // Check for conflicts
            const existingSchedules = await scheduleService.listByTeacher(user.$id, selectedDay);
            const hasConflict = existingSchedules.documents.some(schedule => {
                if (initialSchedule && schedule.$id === initialSchedule.$id) return false; // Ignore self when editing
                // Check overlap
                return (startTime < schedule.endTime && endTime > schedule.startTime);
            });

            if (hasConflict) {
                Alert.alert("Schedule Conflict", "This time slot overlaps with another scheduled class on this day.");
                setLoading(false);
                return;
            }

            const payload: Omit<ClassSchedulePayload, "$id"> = {
                class: selectedClassId,
                subject: selectedSubjectId,
                teacher: user.$id,
                institution: institutionId,
                dayOfWeek: selectedDay as any,
                startTime,
                endTime,
                isActive: true,
                academicYear: academicYearId,
            };

            if (initialSchedule) {
                await scheduleService.update(initialSchedule.$id, payload);
            } else {
                await scheduleService.create(payload);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save schedule");
        } finally {
            setLoading(false);
        }
    };

    // Group assignments by class for better display if needed, but linear list is fine for now
    const uniqueAssignments = assignments;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-end bg-black/50"
            >
                <View className={`rounded-t-3xl h-[85%] ${isDark ? "bg-gray-900" : "bg-white"}`}>
                    <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{initialSchedule ? "Edit Schedule" : "Add Schedule"}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={isDark ? "white" : "black"} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {/* Class & Subject Selection */}
                        <Text className={`text-sm font-bold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>SELECT CLASS & SUBJECT</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                            {loadingAssignments ? (
                                <ActivityIndicator color="#2563EB" />
                            ) : (
                                assignments.map((assignment) => (
                                    <TouchableOpacity
                                        key={assignment.$id}
                                        onPress={() => handleClassSelect(assignment.class.$id, assignment.subject.$id)}
                                        className={`mr-3 p-4 rounded-xl border w-48 justify-center h-24 ${selectedClassId === assignment.class.$id
                                            ? (isDark ? "bg-blue-900 border-blue-500" : "bg-blue-600 border-blue-600")
                                            : (isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}`}
                                    >
                                        <Text className={`font-bold text-lg mb-1 ${selectedClassId === assignment.class.$id ? "text-white" : (isDark ? "text-white" : "text-gray-900")}`} numberOfLines={1}>
                                            {assignment.class.name}
                                        </Text>
                                        <Text className={`${selectedClassId === assignment.class.$id ? "text-blue-200" : (isDark ? "text-gray-400" : "text-gray-500")}`} numberOfLines={1}>
                                            {assignment.subject.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>

                        {/* Day Selection */}
                        <Text className={`text-sm font-bold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>SELECT DAY</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                            {DAYS.map((day) => (
                                <TouchableOpacity
                                    key={day.id}
                                    onPress={() => setSelectedDay(day.id)}
                                    className={`mr-3 px-4 py-3 rounded-full border ${selectedDay === day.id
                                        ? "bg-blue-600 border-blue-600"
                                        : (isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}`}
                                >
                                    <Text className={`font-medium ${selectedDay === day.id ? "text-white" : (isDark ? "text-gray-300" : "text-gray-700")}`}>
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Time Selection */}
                        <View className="flex-row justify-between mb-6">
                            <View className="flex-1 mr-2">
                                <Text className={`text-sm font-bold mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>START TIME (HH:MM)</Text>
                                <TextInput
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="09:00"
                                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                    className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                                />
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className={`text-sm font-bold mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>END TIME (HH:MM)</Text>
                                <TextInput
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="10:00"
                                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                                    className={`p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading || !selectedClassId}
                            className={`w-full py-4 rounded-xl items-center flex-row justify-center ${loading || !selectedClassId ? "bg-gray-400" : "bg-blue-600"}`}
                        >
                            {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                            <Text className="text-white font-bold text-lg">{initialSchedule ? "Update Schedule" : "Create Schedule"}</Text>
                        </TouchableOpacity>

                        <View className="h-20" />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
