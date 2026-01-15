import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
    academicYearService,
    assignmentService,
    classService,
    scheduleService,
} from "@/services";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditSchedule() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const scheduleId = String(id);
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    /* ---------- OPTIONS ---------- */
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classOptions, setClassOptions] = useState<any[]>([]);
    const [teacherOptions, setTeacherOptions] = useState<any[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<any[]>([]);

    /* ---------- FORM STATE ---------- */
    const [academicYear, setAcademicYear] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [teacher, setTeacher] = useState("");
    const [subject, setSubject] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState<"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN">("MON");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(false);

    /* ---------- LOAD ACADEMIC YEARS ---------- */
    useEffect(() => {
        if (!institutionId) return;

        academicYearService.list(institutionId).then((res) => {
            setAcademicYears(
                res.documents.map((ay: any) => ({
                    label: ay.label,
                    value: ay.$id,
                }))
            );
        });
    }, [institutionId]);

    /* ---------- LOAD SCHEDULE ---------- */
    useEffect(() => {
        if (!scheduleId) return;

        (async () => {
            try {
                const res = await scheduleService.listByInstitution(institutionId!);
                const schedule = res.documents.find((s) => s.$id === scheduleId);

                if (!schedule) throw new Error("Schedule not found");

                setAcademicYear(schedule.academicYear.$id);
                setSelectedClass(schedule.class.$id);
                setTeacher(schedule.teacher.$id);
                setSubject(schedule.subject.$id);
                setDayOfWeek(schedule.dayOfWeek);
                setStartTime(schedule.startTime);
                setEndTime(schedule.endTime);
                setIsActive(schedule.isActive);
            } catch {
                Alert.alert("Error", "Failed to load schedule");
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, [scheduleId, institutionId]);

    /* ---------- LOAD CLASSES ---------- */
    useEffect(() => {
        if (!academicYear || !institutionId) {
            setClassOptions([]);
            return;
        }

        classService
            .listByAcademicYear(institutionId, academicYear)
            .then((res) => {
                setClassOptions(
                    res.documents.map((c: any) => ({
                        label: c.name ?? `Class ${c.year}-${c.division}`,
                        value: c.$id,
                    }))
                );
            })
            .catch(err => console.error("Failed to load classes", err));
    }, [academicYear, institutionId]);

    /* ---------- LOAD ASSIGNMENTS & TEACHERS ---------- */
    // Store assignments to filter subjects later locally
    const [classAssignments, setClassAssignments] = useState<any[]>([]);

    useEffect(() => {
        if (!selectedClass || !institutionId) {
            setTeacherOptions([]);
            setSubjectOptions([]);
            setClassAssignments([]);
            return;
        }

        setLoadingAssignments(true);

        assignmentService
            .listByClass(institutionId, selectedClass)
            .then((res) => {
                const assignments = res.documents;
                setClassAssignments(assignments);

                const tMap = new Map();
                assignments.forEach((a: any) => {
                    if (a.teacher && a.teacher.$id)
                        tMap.set(a.teacher.$id, {
                            label: a.teacher.name ?? "Teacher",
                            value: a.teacher.$id,
                        });
                });

                setTeacherOptions([...tMap.values()]);
            })
            .catch(err => console.error("Failed to load assignments", err))
            .finally(() => setLoadingAssignments(false));
    }, [selectedClass, institutionId]);

    /* ---------- FILTER SUBJECTS ---------- */
    useEffect(() => {
        if (!teacher || classAssignments.length === 0) {
            setSubjectOptions([]);
            return;
        }

        const sMap = new Map();
        classAssignments.forEach((a: any) => {
            // Match teacher ID
            const tId = a.teacher?.$id || a.teacher; // handle expanded vs string if erratic
            if (tId === teacher && a.subject && a.subject.$id) {
                sMap.set(a.subject.$id, {
                    label: `${a.subject.name} (${a.subject.code})`,
                    value: a.subject.$id
                });
            }
        });
        setSubjectOptions([...sMap.values()]);

    }, [teacher, classAssignments]);

    /* ---------- SUBMIT ---------- */
    const handleSubmit = async () => {
        if (
            !teacher ||
            !selectedClass ||
            !subject ||
            !dayOfWeek ||
            !startTime ||
            !endTime
        ) {
            Alert.alert("Error", "All fields required");
            return;
        }

        setSubmitting(true);
        try {
            await scheduleService.update(scheduleId, {
                teacher,
                class: selectedClass,
                subject,
                academicYear,
                dayOfWeek,
                startTime,
                endTime,
                isActive,
            });

            Alert.alert("Success", "Schedule updated", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert("Error", "Failed to update schedule");
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- DELETE ---------- */
    const handleDelete = async () => {
        await scheduleService.deactivate(scheduleId);
        router.back();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background dark:bg-dark-background">
            <PageHeader title="Edit Schedule" />

            <ScrollView className="px-6">
                <FormSelect
                    label="Academic Year"
                    value={academicYear}
                    onChange={setAcademicYear}
                    options={academicYears}
                />

                <FormSelect
                    label="Class"
                    value={selectedClass}
                    onChange={setSelectedClass}
                    options={classOptions}
                />

                {loadingAssignments && <ActivityIndicator />}

                <FormSelect
                    label="Teacher"
                    value={teacher}
                    onChange={setTeacher}
                    options={teacherOptions}
                />

                <FormSelect
                    label="Subject"
                    value={subject}
                    onChange={setSubject}
                    options={subjectOptions}
                />

                <FormSelect
                    label="Day"
                    value={dayOfWeek}
                    onChange={(value) => setDayOfWeek(value as "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")}
                    options={[
                        { label: "Mon", value: "MON" },
                        { label: "Tue", value: "TUE" },
                        { label: "Wed", value: "WED" },
                        { label: "Thu", value: "THU" },
                        { label: "Fri", value: "FRI" },
                        { label: "Sat", value: "SAT" },
                        { label: "Sun", value: "SUN" },
                    ]}
                />

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
                    className="mt-4 py-4 rounded-xl bg-primary dark:bg-dark-primary items-center mb-4"
                >
                    <Text className="text-white font-bold text-lg">Update Schedule</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleDelete}
                    className="py-4 rounded-xl items-center mb-10 bg-red-100 dark:bg-red-900/30"
                >
                    <Text className="text-red-600 dark:text-red-400 font-bold text-lg">Delete Schedule</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
