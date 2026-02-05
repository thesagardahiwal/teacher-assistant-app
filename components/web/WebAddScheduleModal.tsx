import { scheduleService } from "@/services";
import { academicYearService } from "@/services/academicYear.service";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { ClassSchedule, ClassSchedulePayload } from "@/types/schedule.type";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

interface WebAddScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    initialSchedule?: ClassSchedule | null;
}

const DAYS: { id: ClassSchedule['dayOfWeek']; label: string }[] = [
    { id: "MON", label: "Monday" },
    { id: "TUE", label: "Tuesday" },
    { id: "WED", label: "Wednesday" },
    { id: "THU", label: "Thursday" },
    { id: "FRI", label: "Friday" },
    { id: "SAT", label: "Saturday" },
    { id: "SUN", label: "Sunday" },
];

// Web-specific Time Input Component mimicking FormTimePicker
const WebTimeInput = ({
    label,
    value,
    onChange,
    error,
    minTime
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    error?: string;
    minTime?: string;
}) => {
    const { isDark } = useTheme();

    return (
        <View className="mb-4">
            <View className="flex-row mb-2">
                <Text className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"} ml-1`}>
                    {label}
                </Text>
            </View>
            <View className={`w-full h-14 rounded-2xl border flex-row items-center px-4 overflow-hidden ${error
                ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                : isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}>
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="HH:MM"
                    placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                    className={`flex-1 text-base h-full outline-none ${isDark ? "text-white" : "text-gray-900"}`}
                    // @ts-ignore - web only prop
                    type="time"
                    min={minTime}
                />
                <Ionicons
                    name="time-outline"
                    size={20}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                />
            </View>
            {error && (
                <Text className="text-xs text-red-500 mt-1.5 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
};

export default function WebAddScheduleModal({
    visible,
    onClose,
    onSave,
    initialSchedule,
}: WebAddScheduleModalProps) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const { data: assignments, fetchAssignments, loading: loadingAssignments } = useAssignments();

    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<ClassSchedule['dayOfWeek']>("MON");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [loading, setLoading] = useState(false);
    const [academicYearId, setAcademicYearId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ start?: string; end?: string; class?: string; day?: string }>({});

    // Pre-fill
    useEffect(() => {
        if (initialSchedule && visible) {
            setSelectedClassId(initialSchedule.class.$id);
            setSelectedSubjectId(initialSchedule.subject.$id);
            setSelectedDay(initialSchedule.dayOfWeek);
            setStartTime(initialSchedule.startTime);
            setEndTime(initialSchedule.endTime);
            setErrors({});
        } else if (visible && !initialSchedule) {
            setSelectedClassId("");
            setSelectedSubjectId("");
            setSelectedDay("MON");
            setStartTime("09:00");
            setEndTime("10:00");
            setErrors({});
        }
    }, [initialSchedule, visible]);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (visible && institutionId && user?.$id) {
                fetchAssignments(institutionId, user.$id);
                try {
                    const yearsRes = await academicYearService.list(institutionId);
                    const currentYear = yearsRes.documents.find((y) => y.isCurrent);
                    if (currentYear) {
                        setAcademicYearId(currentYear.$id);
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
        setErrors(prev => ({ ...prev, class: undefined }));
    };

    const validate = async () => {
        const newErrors: any = {};
        if (!selectedClassId) newErrors.class = "Please select a class";
        if (!selectedDay) newErrors.day = "Please select a day";
        if (!startTime) newErrors.start = "Required";
        if (!endTime) newErrors.end = "Required";

        if (startTime && endTime && startTime >= endTime) {
            newErrors.end = "End time must be after start time";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        // Check conflicts
        try {
            const existingSchedules = await scheduleService.listByTeacher(user!.$id, selectedDay);
            const hasConflict = existingSchedules.documents.some((schedule) => {
                if (initialSchedule && schedule.$id === initialSchedule.$id) return false;
                // Simple overlap check
                return startTime < schedule.endTime && endTime > schedule.startTime;
            });

            if (hasConflict) {
                showAlert("Schedule Conflict", "This time slot overlaps with another scheduled class on this day.");
                return false;
            }
        } catch (error) {
            console.error("Conflict check failed", error);
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!user || !institutionId || !academicYearId) {
            showAlert("Error", "Missing required system data.");
            return;
        }

        setLoading(true);
        if (await validate()) {
            try {
                const payload: Omit<ClassSchedulePayload, "$id"> = {
                    class: selectedClassId,
                    subject: selectedSubjectId,
                    teacher: user.$id,
                    institution: institutionId,
                    dayOfWeek: selectedDay,
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
                showAlert("Error", "Failed to save schedule");
            }
        }
        setLoading(false);
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 bg-black/50 items-center justify-center p-4">
                <View className={`w-full max-w-2xl rounded-2xl shadow-xl ${isDark ? "bg-[#1e293b]" : "bg-white"} overflow-hidden max-h-[90vh]`}>

                    {/* Header */}
                    <View className={`flex-row items-center justify-between p-6 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        <View>
                            <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                {initialSchedule ? "Edit Schedule" : "Add Schedule"}
                            </Text>
                            <Text className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Configure class details and timing
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className={`p-2 rounded-full ${isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"}`}
                        >
                            <Ionicons name="close" size={24} color={isDark ? "white" : "#64748b"} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="p-6">

                        {/* Class Selection */}
                        <View className="flex-row justify-between mb-3">
                            <Text className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                Select Class & Subject
                            </Text>
                            {errors.class && <Text className="text-xs text-red-500 font-bold">{errors.class}</Text>}
                        </View>

                        {loadingAssignments ? (
                            <ActivityIndicator className="mb-6" />
                        ) : (
                            <View className="flex-row flex-wrap gap-3 mb-8">
                                {assignments.map((assignment) => {
                                    const isSelected = selectedClassId === assignment.class.$id;
                                    return (
                                        <TouchableOpacity
                                            key={assignment.$id}
                                            onPress={() => handleClassSelect(assignment.class.$id, assignment.subject.$id)}
                                            className={`w-[48%] p-4 rounded-xl border transition-all ${isSelected
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : errors.class
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                                        : isDark
                                                            ? 'bg-slate-800 border-slate-700'
                                                            : 'bg-white border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <View className="flex-row justify-between items-start">
                                                <View className="flex-1">
                                                    <Text className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                                                        {assignment.class.name}
                                                    </Text>
                                                    <Text className={`text-sm ${isSelected ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {assignment.subject.name}
                                                    </Text>
                                                </View>
                                                {isSelected && (
                                                    <View className="bg-white/20 p-1 rounded-full">
                                                        <Ionicons name="checkmark" size={14} color="white" />
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                                {!loadingAssignments && assignments.length === 0 && (
                                    <Text className="text-slate-500 italic">No assigned classes found.</Text>
                                )}
                            </View>
                        )}

                        {/* Day Selection */}
                        <Text className={`text-xs font-bold mb-3 tracking-wider uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            Select Day
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {DAYS.map((day) => {
                                const isSelected = selectedDay === day.id;
                                return (
                                    <TouchableOpacity
                                        key={day.id}
                                        onPress={() => setSelectedDay(day.id)}
                                        className={`px-4 py-2 rounded-lg border ${isSelected
                                                ? 'bg-blue-600 border-blue-600'
                                                : isDark
                                                    ? 'bg-slate-800 border-slate-700'
                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Text className={`text-sm font-medium ${isSelected ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {day.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Time Selection */}
                        <Text className={`text-xs font-bold mb-3 tracking-wider uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            Time Slot (24h Format)
                        </Text>
                        <View className="flex-row gap-4 mb-8">
                            <View className="flex-1">
                                <WebTimeInput
                                    label="Start Time"
                                    value={startTime}
                                    onChange={(v) => {
                                        setStartTime(v);
                                        if (errors.start) setErrors(prev => ({ ...prev, start: undefined }));
                                    }}
                                    error={errors.start}
                                />
                            </View>
                            <View className="flex-1">
                                <WebTimeInput
                                    label="End Time"
                                    value={endTime}
                                    onChange={(v) => {
                                        setEndTime(v);
                                        if (errors.end) setErrors(prev => ({ ...prev, end: undefined }));
                                    }}
                                    minTime={startTime}
                                    error={errors.end}
                                />
                            </View>
                        </View>

                    </ScrollView>

                    {/* Footer */}
                    <View className={`p-6 border-t ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl flex-row items-center justify-center ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                            <Text className="text-white font-bold text-lg">
                                {initialSchedule ? "Update Schedule" : "Create Schedule"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}
