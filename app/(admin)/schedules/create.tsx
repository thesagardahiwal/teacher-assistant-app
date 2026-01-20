import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
    academicYearService,
    assignmentService,
    classService,
    scheduleService,
} from "@/services";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateSchedule() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { data: teachers, fetchTeachers } = useTeachers();

    const [academicYears, setAcademicYears] = useState<
        { label: string; value: string }[]
    >([]);
    const [academicYear, setAcademicYear] = useState("");

    const [teacher, setTeacher] = useState("");
    const [availableClasses, setAvailableClasses] = useState<
        { label: string; value: string }[]
    >([]);
    const [availableSubjects, setAvailableSubjects] = useState<
        { label: string; value: string }[]
    >([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [subject, setSubject] = useState("");

    const [dayOfWeek, setDayOfWeek] = useState<"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN">("MON");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(false);

    /* ---------------- INITIAL LOAD ---------------- */

    useEffect(() => {
        if (institutionId) {
            fetchTeachers(institutionId);
            fetchAcademicYears(institutionId);
        }
    }, [institutionId]);

    const fetchAcademicYears = async (instId: string) => {
        const res = await academicYearService.list(instId);

        const options = res.documents.map((ay: any) => ({
            label: ay.label,
            value: ay.$id,
        }));

        setAcademicYears(options);

        const current = res.documents.find((ay: any) => ay.isCurrent);
        if (current) setAcademicYear(current.$id);
    };

    /* ---------------- LOAD ASSIGNMENTS ---------------- */

    /* ---------------- LOAD CLASSES ---------------- */
    useEffect(() => {
        if (!academicYear || !institutionId) {
            setAvailableClasses([]);
            return;
        }

        classService.listByAcademicYear(institutionId, academicYear)
            .then(res => {
                const options = res.documents.map((c: any) => ({
                    label: c.name || `Class ${c.year}-${c.division}`,
                    value: c.$id
                }));
                setAvailableClasses(options);
            })
            .catch(err => console.error("Failed to fetch classes", err));

        // Reset downstream
        setSelectedClass("");
        setTeacher("");
        setSubject("");

    }, [academicYear, institutionId]);


    /* ---------------- LOAD ASSIGNMENTS & TEACHERS ---------------- */
    const [classAssignments, setClassAssignments] = useState<any[]>([]);

    useEffect(() => {
        if (!selectedClass || !institutionId) {
            setTeacherOptions([]);
            setSubjectOptions([]);
            setClassAssignments([]);
            return;
        }

        setLoadingAssignments(true);
        assignmentService.listByClass(institutionId, selectedClass)
            .then((res) => {
                const assignments = res.documents;
                setClassAssignments(assignments);

                // Extract Unique Teachers from these assignments
                const tMap = new Map();
                assignments.forEach((a: any) => {
                    if (a.teacher && a.teacher.$id) {
                        tMap.set(a.teacher.$id, {
                            label: a.teacher.name,
                            value: a.teacher.$id
                        });
                    }
                });
                setTeacherOptions(Array.from(tMap.values()));
            })
            .catch(err => {
                console.error("Failed to fetch assignments", err);
                Alert.alert("Error", "Failed to fetch class assignments");
            })
            .finally(() => setLoadingAssignments(false));

        // Reset downstream
        setTeacher("");
        setSubject("");

    }, [selectedClass, institutionId]);


    /* ---------------- FILTER SUBJECTS ---------------- */
    const [teacherOptions, setTeacherOptions] = useState<{ label: string, value: string }[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<{ label: string, value: string }[]>([]);

    useEffect(() => {
        if (!teacher || classAssignments.length === 0) {
            setSubjectOptions([]);
            return;
        }

        // Filter subjects where teacher matches
        const sMap = new Map();
        classAssignments.forEach((a: any) => {
            if (a.teacher && a.teacher.$id === teacher && a.subject && a.subject.$id) {
                sMap.set(a.subject.$id, {
                    label: `${a.subject.name} (${a.subject.code})`,
                    value: a.subject.$id
                });
            }
        });
        setSubjectOptions(Array.from(sMap.values()));

        // Reset downstream
        setSubject("");

    }, [teacher, classAssignments]);

    /* ---------------- CONSTANTS ---------------- */

    const days = [
        { label: "Monday", value: "MON" },
        { label: "Tuesday", value: "TUE" },
        { label: "Wednesday", value: "WED" },
        { label: "Thursday", value: "THU" },
        { label: "Friday", value: "FRI" },
        { label: "Saturday", value: "SAT" },
    ];



    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async () => {
        if (
            !teacher ||
            !selectedClass ||
            !subject ||
            !dayOfWeek ||
            !startTime ||
            !endTime ||
            !academicYear ||
            !institutionId
        ) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            await scheduleService.create({
                teacher,
                class: selectedClass, // ✅ FIXED
                subject,
                academicYear,
                dayOfWeek,
                startTime,
                endTime,
                institution: institutionId,
                isActive: true,
            });

            Alert.alert("Success", "Schedule created", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (e: any) {
            Alert.alert("Error", e.message || "Failed to create schedule");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background p-4 dark:bg-dark-background"
        >
            <View style={{ flex: 1 }}>
                <PageHeader title="Create Schedule" />

                <ScrollView className="px-6">
                    <FormSelect
                        label="Academic Year"
                        value={academicYear}
                        onChange={setAcademicYear}
                        options={academicYears}
                        placeholder="Select Academic Year"
                    />

                    <FormSelect
                        label="Class"
                        value={selectedClass}
                        onChange={setSelectedClass}
                        options={availableClasses}
                        placeholder={academicYear ? "Select Class" : "Select Academic Year First"}
                    />

                    {loadingAssignments && (
                        <View className="py-3">
                            <ActivityIndicator />
                            <Text className="text-xs text-center text-gray-500 mt-1">
                                Loading class assignments...
                            </Text>
                        </View>
                    )}

                    <FormSelect
                        label="Teacher"
                        value={teacher}
                        onChange={setTeacher}
                        options={teacherOptions}
                        placeholder={selectedClass ? "Select Teacher (Assigned)" : "Select Class First"}
                    />

                    <FormSelect
                        label="Subject"
                        value={subject}
                        onChange={setSubject}
                        options={subjectOptions}
                        placeholder={teacher ? "Select Subject" : "Select Teacher First"}
                    />

                    <FormSelect
                        label="Day"
                        value={dayOfWeek}
                        onChange={(v) => setDayOfWeek(v as "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")}
                        options={days}
                        placeholder="Select Day"
                    />

                    {/* TIME */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="mb-2 font-semibold text-textSecondary dark:text-dark-textSecondary">
                                Start Time
                            </Text>
                            <TextInput
                                placeholder="09:00"
                                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                                value={startTime}
                                onChangeText={setStartTime}
                                className="p-4 rounded-xl border bg-card border-border dark:bg-dark-card dark:border-dark-border text-textPrimary dark:text-dark-textPrimary"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="mb-2 font-semibold text-textSecondary dark:text-dark-textSecondary">
                                End Time
                            </Text>
                            <TextInput
                                placeholder="10:00"
                                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                                value={endTime}
                                onChangeText={setEndTime}
                                className="p-4 rounded-xl border bg-card border-border dark:bg-dark-card dark:border-dark-border text-textPrimary dark:text-dark-textPrimary"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className="mt-4 py-4 rounded-xl bg-primary dark:bg-dark-primary items-center"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">
                                Create Schedule
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
