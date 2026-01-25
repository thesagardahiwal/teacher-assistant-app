import { AssessmentPayload, AssessmentType } from "@/types/assessment.type";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAcademicYears } from "../../../store/hooks/useAcademicYears";
import { useAssessments } from "../../../store/hooks/useAssessments";
import { useAuth } from "../../../store/hooks/useAuth";
import { useClasses } from "../../../store/hooks/useClasses";
import { useSubjects } from "../../../store/hooks/useSubjects";
import { useTheme } from "../../../store/hooks/useTheme";
import { showAlert } from "../../../utils/alert";
import { useInstitutionId } from "../../../utils/useInstitutionId";

const ASSESSMENT_TYPES: AssessmentType[] = ["HOMEWORK", "QUIZ", "TEST", "ASSIGNMENT"];

export default function CreateAssessmentScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const { createNewAssessment, isLoading } = useAssessments();
    const { data: academicYears, fetchAcademicYears } = useAcademicYears();
    const { data: subjects, fetchSubjectsByTeacher } = useSubjects();
    const { data: classes, fetchClassesByTeacher } = useClasses();

    const [form, setForm] = useState<AssessmentPayload>({
        title: "",
        type: "TEST",
        subject: "",
        class: "",
        maxMarks: 1,
        weightage: 1,
        description: "",
        academicYear: "",
        institution: "",
        isActive: true,
        dueDate: new Date().toISOString().split('T')[0],
        teacher: user?.$id || ""
    });

    const [showCalendar, setShowCalendar] = useState(false);

    const onDayPress = (day: any) => {
        setForm(prev => ({ ...prev, dueDate: day.dateString }));
        setShowCalendar(false);
    };

    useEffect(() => {
        if (institutionId && user?.$id) {
            fetchAcademicYears(institutionId);
            fetchSubjectsByTeacher(institutionId, user.$id);
            fetchClassesByTeacher(institutionId, user.$id);
        }
    }, [institutionId, user?.$id]);

    // Set active academic year automatically
    useEffect(() => {
        const activeYear = academicYears.find(y => y.isCurrent);
        if (activeYear) {
            setForm(prev => ({ ...prev, academicYear: activeYear.$id }));
        }
    }, [academicYears]);

    const handleCreate = async () => {
        if (!form.title || !form.subject || !form.class || !form.maxMarks) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        if (form.dueDate && isNaN(new Date(form.dueDate).getTime())) {
            showAlert("Error", "Invalid Due Date format");
            return;
        }

        if (!institutionId || !user?.$id) {
            showAlert("Error", "Missing user information");
            return;
        }

        if (!form.academicYear) {
            showAlert("Error", "No active academic year found");
            return;
        }

        try {
            await createNewAssessment({
                institution: institutionId,
                title: form.title,
                type: form.type as any,
                subject: form.subject,
                class: form.class,
                teacher: user.$id,
                maxMarks: form.maxMarks,
                weightage: form.weightage,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
                description: form.description,
                academicYear: form.academicYear,
                isActive: true
            });
            showAlert("Success", "Assessment created successfully");
            router.back();
        } catch (error) {
            showAlert("Error", (error as Error).message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
            <View className={`flex-row items-center justify-between px-5 pt-4 pb-2 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-blue-500 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>New Assessment</Text>
                <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator size="small" color="#2563EB" /> : <Text className="text-blue-600 font-bold text-lg">Create</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 py-4">
                {/* Title */}
                <View className="mb-4">
                    <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Title *</Text>
                    <TextInput
                        className={`p-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                        placeholder="e.g. Mid-term Exam"
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        value={form.title}
                        onChangeText={(t) => setForm({ ...form, title: t })}
                    />
                </View>

                {/* Type */}
                <View className="mb-4">
                    <Text className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {ASSESSMENT_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setForm({ ...form, type })}
                                className={`px-4 py-2 rounded-full mr-2 border ${form.type === type
                                    ? "bg-blue-600 border-blue-600"
                                    : isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                    }`}
                            >
                                <Text className={form.type === type ? "text-white font-medium" : isDark ? "text-gray-300" : "text-gray-600"}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Subject & Class */}
                <View className="gap-4 mb-4">
                    <View className="flex-1">
                        <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Subject *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                            {subjects.length > 0 ? subjects.map((sub) => (
                                <TouchableOpacity
                                    key={sub.$id}
                                    onPress={() => setForm({ ...form, subject: sub.$id })}
                                    className={`px-3 py-2 rounded-lg mr-2 border ${form.subject === sub.$id
                                        ? "bg-blue-600 border-blue-600"
                                        : isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                        }`}
                                >
                                    <Text className={form.subject === sub.$id ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}>{sub.name} ({sub.code})</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No subjects assigned</Text>
                            )}
                        </ScrollView>
                    </View>
                    <View className="flex-1">
                        <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Class *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
                            {classes.length > 0 ? classes.map((cls) => (
                                <TouchableOpacity
                                    key={cls.$id}
                                    onPress={() => setForm({ ...form, class: cls.$id })}
                                    className={`px-3 py-2 rounded-lg mr-2 border ${form.class === cls.$id
                                        ? "bg-blue-600 border-blue-600"
                                        : isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                                        }`}
                                >
                                    <Text className={form.class === cls.$id ? "text-white" : isDark ? "text-gray-300" : "text-gray-700"}>{cls.name}</Text>
                                </TouchableOpacity>
                            )) : (
                                <Text className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No classes assigned</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>

                {/* Marks & Weightage */}
                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Max Marks *</Text>
                        <TextInput
                            className={`p-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                            placeholder="100"
                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                            keyboardType="numeric"
                            value={form.maxMarks.toString()}
                            onChangeText={(t) => setForm({ ...form, maxMarks: Number(t) })}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Weightage %</Text>
                        <TextInput
                            className={`p-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                            placeholder="20"
                            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                            keyboardType="numeric"
                            value={form.weightage.toString()}
                            onChangeText={(t) => setForm({ ...form, weightage: Number(t) })}
                        />
                    </View>
                </View>

                {/* Due Date Only */}
                <View className="mb-4">
                    <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Due Date</Text>
                    <TouchableOpacity
                        onPress={() => { setShowCalendar(true); }}
                        className={`flex-row items-center p-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                    >
                        <Ionicons name="calendar-outline" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                        <Text className={`flex-1 ml-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {form.dueDate || "Select Date"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Description */}
                <View className="mb-8">
                    <Text className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Description</Text>
                    <TextInput
                        className={`p-3 rounded-xl border min-h-[100px] ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                        placeholder="Add details about the assessment..."
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        multiline
                        textAlignVertical="top"
                        value={form.description}
                        onChangeText={(t) => setForm({ ...form, description: t })}
                    />
                </View>
            </ScrollView>

            <Modal
                visible={showCalendar}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className={`m-5 p-4 rounded-xl w-[90%] ${isDark ? "bg-gray-800" : "bg-white"}`}>
                        <Calendar
                            onDayPress={onDayPress}
                            markedDates={{
                                [form.dueDate || ""]: { selected: true, selectedColor: "#2563EB" }
                            }}
                            theme={{
                                calendarBackground: isDark ? "#1f2937" : "#ffffff",
                                textSectionTitleColor: isDark ? "#9ca3af" : "#b6c1cd",
                                selectedDayBackgroundColor: "#2563EB",
                                selectedDayTextColor: "#ffffff",
                                todayTextColor: "#2563EB",
                                dayTextColor: isDark ? "#ffffff" : "#2d4150",
                                textDisabledColor: isDark ? "#4b5563" : "#d9e1e8",
                                arrowColor: "#2563EB",
                                monthTextColor: isDark ? "#ffffff" : "#2d4150",
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowCalendar(false)}
                            className={`mt-4 p-3 rounded-lg items-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}
                        >
                            <Text className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
