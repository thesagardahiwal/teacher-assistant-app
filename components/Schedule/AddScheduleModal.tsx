import { showAlert } from "@/utils/alert";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, { FadeInDown, SlideInDown } from "react-native-reanimated";
import { scheduleService } from "../../services";
import { academicYearService } from "../../services/academicYear.service";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { ClassSchedule, ClassSchedulePayload } from "../../types/schedule.type";
import { useInstitutionId } from "../../utils/useInstitutionId";
import { FormTimePicker } from "../admin/ui/FormTimePicker";

interface AddScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    initialSchedule?: ClassSchedule | null;
}

const DAYS: { id: ClassSchedule['dayOfWeek']; label: string }[] = [
    { id: "MON", label: "Mo" },
    { id: "TUE", label: "Tu" },
    { id: "WED", label: "We" },
    { id: "THU", label: "Th" },
    { id: "FRI", label: "Fr" },
    { id: "SAT", label: "Sa" },
    { id: "SUN", label: "Su" },
];

export default function AddScheduleModal({
    visible,
    onClose,
    onSave,
    initialSchedule,
}: AddScheduleModalProps) {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const { data: assignments, fetchAssignments, loading: loadingAssignments } = useAssignments();

    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN">("MON");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [loading, setLoading] = useState(false);
    const [academicYearId, setAcademicYearId] = useState<string | null>(null);

    // Pre-fill
    useEffect(() => {
        if (initialSchedule && visible) {
            setSelectedClassId(initialSchedule.class.$id);
            setSelectedSubjectId(initialSchedule.subject.$id);
            setSelectedDay(initialSchedule.dayOfWeek);
            setStartTime(initialSchedule.startTime);
            setEndTime(initialSchedule.endTime);
        } else if (visible && !initialSchedule) {
            setSelectedClassId("");
            setSelectedSubjectId("");
            setSelectedDay("MON");
            setStartTime("09:00");
            setEndTime("10:00");
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
    };

    const handleSubmit = async () => {
        if (
            !selectedClassId ||
            !selectedSubjectId ||
            !startTime ||
            !endTime ||
            !user ||
            !institutionId
        ) {
            showAlert("Error", "Please fill in all fields");
            return;
        }

        if (!academicYearId) {
            showAlert("Error", "Cannot create schedule without an active academic year.");
            return;
        }

        if (startTime >= endTime) {
            showAlert("Error", "End time must be after start time");
            return;
        }

        setLoading(true);
        try {
            // Check for conflicts
            const existingSchedules = await scheduleService.listByTeacher(user.$id, selectedDay);
            const hasConflict = existingSchedules.documents.some((schedule) => {
                if (initialSchedule && schedule.$id === initialSchedule.$id) return false;
                return startTime < schedule.endTime && endTime > schedule.startTime;
            });

            if (hasConflict) {
                showAlert(
                    "Schedule Conflict",
                    "This time slot overlaps with another scheduled class on this day."
                );
                setLoading(false);
                return;
            }

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
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/60 justify-end">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        className="flex-1 justify-end"
                    >
                        <TouchableWithoutFeedback>
                            <Animated.View
                                entering={SlideInDown.springify().damping(15)}
                                className={`rounded-t-3xl max-h-[90%] w-full ${isDark ? "bg-gray-900 border-t border-gray-800" : "bg-white"
                                    } shadow-2xl`}
                            >
                                {/* Header */}
                                <View
                                    className={`flex-row items-center justify-between p-5 border-b ${isDark ? "border-gray-800" : "border-gray-100"
                                        }`}
                                >
                                    <View>
                                        <Text
                                            className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"
                                                }`}
                                        >
                                            {initialSchedule ? "Edit Schedule" : "Add Schedule"}
                                        </Text>
                                        <Text
                                            className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}
                                        >
                                            Configure class timing and details
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        className={`p-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"
                                            }`}
                                    >
                                        <Ionicons
                                            name="close"
                                            size={24}
                                            color={isDark ? "white" : "black"}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView contentContainerStyle={{ padding: 20 }}>
                                    {/* Class & Subject Selection */}
                                    <Animated.View entering={FadeInDown.delay(100)}>
                                        <Text
                                            className={`text-xs font-bold mb-3 tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}
                                        >
                                            SELECT CLASS & SUBJECT
                                        </Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            className="mb-8"
                                        >
                                            {loadingAssignments ? (
                                                <ActivityIndicator color="#2563EB" />
                                            ) : (
                                                assignments.map((assignment, index) => {
                                                    const isSelected =
                                                        selectedClassId === assignment.class.$id &&
                                                        selectedSubjectId === assignment.subject.$id;
                                                    return (
                                                        <Animated.View
                                                            key={assignment.$id}
                                                            entering={FadeInDown.delay(100 + index * 50)}
                                                        >
                                                            <TouchableOpacity
                                                                onPress={() =>
                                                                    handleClassSelect(
                                                                        assignment.class.$id,
                                                                        assignment.subject.$id
                                                                    )
                                                                }
                                                                className={`mr-3 p-4 rounded-2xl border w-40 h-28 justify-between shadow-sm ${isSelected
                                                                    ? isDark
                                                                        ? "bg-blue-600 border-blue-500"
                                                                        : "bg-blue-600 border-blue-600"
                                                                    : isDark
                                                                        ? "bg-gray-800 border-gray-700"
                                                                        : "bg-white border-gray-100"
                                                                    }`}
                                                            >
                                                                <View>
                                                                    <Text
                                                                        className={`font-bold text-lg leading-6 ${isSelected
                                                                            ? "text-white"
                                                                            : isDark
                                                                                ? "text-white"
                                                                                : "text-gray-900"
                                                                            }`}
                                                                        numberOfLines={1}
                                                                    >
                                                                        {assignment.class.name}
                                                                    </Text>
                                                                    <Text
                                                                        className={`text-sm mt-1 ${isSelected
                                                                            ? "text-blue-100"
                                                                            : isDark
                                                                                ? "text-gray-400"
                                                                                : "text-gray-500"
                                                                            }`}
                                                                        numberOfLines={1}
                                                                    >
                                                                        {assignment.subject.name}
                                                                    </Text>
                                                                </View>
                                                                {isSelected && (
                                                                    <View className="self-end bg-white/20 p-1 rounded-full">
                                                                        <Ionicons
                                                                            name="checkmark"
                                                                            size={14}
                                                                            color="white"
                                                                        />
                                                                    </View>
                                                                )}
                                                            </TouchableOpacity>
                                                        </Animated.View>
                                                    );
                                                })
                                            )}
                                            {!loadingAssignments && assignments.length === 0 && (
                                                <Text className="text-gray-500 italic">
                                                    No classes assigned.
                                                </Text>
                                            )}
                                        </ScrollView>
                                    </Animated.View>

                                    {/* Day Selection */}
                                    <Animated.View entering={FadeInDown.delay(200)}>
                                        <Text
                                            className={`text-xs font-bold mb-3 tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"
                                                }`}
                                        >
                                            SELECT DAY
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2 mb-8 justify-between">
                                            {DAYS.map((day, index) => (
                                                <TouchableOpacity
                                                    key={day.id}
                                                    onPress={() => setSelectedDay(day.id)}
                                                    className={`w-[14%] aspect-square rounded-2xl items-center justify-center border ${selectedDay === day.id
                                                        ? "bg-blue-600 border-blue-600"
                                                        : isDark
                                                            ? "bg-gray-800 border-gray-700"
                                                            : "bg-white border-gray-200"
                                                        }`}
                                                >
                                                    <Text
                                                        className={`font-bold text-xs ${selectedDay === day.id
                                                            ? "text-white"
                                                            : isDark
                                                                ? "text-gray-300"
                                                                : "text-gray-600"
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </Animated.View>

                                    {/* Time Selection */}
                                    <Animated.View entering={FadeInDown.delay(300)}>
                                        <View className="flex-row justify-between mb-8 gap-4">
                                            <View className="flex-1">
                                                <FormTimePicker
                                                    label="Start Time"
                                                    value={startTime}
                                                    onChange={(val) => {
                                                        setStartTime(val);
                                                        if (endTime && val >= endTime) {
                                                            setEndTime("");
                                                        }
                                                    }}
                                                    placeholder="09:00"
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <FormTimePicker
                                                    label="End Time"
                                                    value={endTime}
                                                    onChange={setEndTime}
                                                    placeholder="10:00"
                                                    minTime={startTime}
                                                />
                                            </View>
                                        </View>
                                    </Animated.View>

                                    <Animated.View entering={FadeInDown.delay(400)}>
                                        <TouchableOpacity
                                            onPress={handleSubmit}
                                            disabled={loading || !selectedClassId}
                                            className={`w-full py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-blue-500/30 ${loading || !selectedClassId
                                                ? "bg-gray-400 opacity-50"
                                                : "bg-blue-600"
                                                }`}
                                        >
                                            {loading ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="white"
                                                    className="mr-2"
                                                />
                                            ) : (
                                                <MaterialCommunityIcons
                                                    name={
                                                        initialSchedule
                                                            ? "content-save-edit-outline"
                                                            : "plus-circle-outline"
                                                    }
                                                    size={22}
                                                    color="white"
                                                    style={{ marginRight: 8 }}
                                                />
                                            )}
                                            <Text className="text-white font-bold text-lg">
                                                {initialSchedule
                                                    ? "Update Schedule"
                                                    : "Create Schedule"}
                                            </Text>
                                        </TouchableOpacity>
                                    </Animated.View>

                                    <View className="h-10" />
                                </ScrollView>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
