import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
    academicYearService,
    assignmentService,
    classService,
    scheduleService,
} from "@/services";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
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
                const schedule = await scheduleService.get(scheduleId);

                // Helper to extract ID safely from Object, Array, or String
                const getID = (item: any): string => {
                    if (!item) return "";
                    if (Array.isArray(item)) return item.length > 0 ? getID(item[0]) : "";
                    if (typeof item === 'object') return item.$id || "";
                    return String(item);
                };

                const ayId = getID(schedule.academicYear);
                const classId = getID(schedule.class);
                const teacherId = getID(schedule.teacher);
                const subjectId = getID(schedule.subject);

                setAcademicYear(ayId);
                setSelectedClass(classId);
                setTeacher(teacherId);
                setSubject(subjectId);
                setDayOfWeek(schedule.dayOfWeek);
                setStartTime(schedule.startTime);
                setEndTime(schedule.endTime);
                setIsActive(schedule.isActive);

                // --- SEED OPTIONS IMMEDIATELY ---
                // Populates dropdowns with current values so they aren't empty while lists load

                if (schedule.class) {
                    const cItem = Array.isArray(schedule.class) ? schedule.class[0] : schedule.class;
                    if (cItem && typeof cItem === 'object') {
                        setClassOptions([{
                            label: cItem.name || `Class ${cItem.year}-${cItem.division}`,
                            value: cItem.$id
                        }]);
                    }
                }

                if (schedule.teacher) {
                    const tItem = Array.isArray(schedule.teacher) ? schedule.teacher[0] : schedule.teacher;
                    if (tItem && typeof tItem === 'object') {
                        setTeacherOptions([{
                            label: tItem.name,
                            value: tItem.$id
                        }]);
                    }
                }

                if (schedule.subject) {
                    const sItem = Array.isArray(schedule.subject) ? schedule.subject[0] : schedule.subject;
                    if (sItem && typeof sItem === 'object') {
                        setSubjectOptions([{
                            label: sItem.name + (sItem.code ? ` (${sItem.code})` : ''),
                            value: sItem.$id
                        }]);
                    }
                }

            } catch (error) {
                console.error("Failed to fetch schedule details", error);
                showAlert("Error", "Failed to load schedule");
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, [scheduleId]);

    /* ---------- LOAD CLASSES ---------- */
    useEffect(() => {
        if (!academicYear || !institutionId) {
            // If we already have selectedClass, don't wipe options immediately or we lose the seeded value
            // But strict flow says we should only show classes for this year.
            // We'll trust the seed unless academicYear changes.
            if (!selectedClass) setClassOptions([]);
            return;
        }

        classService
            .listByAcademicYear(institutionId, academicYear)
            .then((res) => {
                const newOptions = res.documents.map((c: any) => ({
                    label: c.name ?? `Class ${c.year}-${c.division}`,
                    value: c.$id,
                }));

                // Ensure the currently selected class is preserved if not in the new list
                // We access the current state of options to find the seeded one
                setClassOptions(prevOptions => {
                    const selectedOption = prevOptions.find(o => o.value === selectedClass);
                    if (selectedOption && !newOptions.find((n: any) => n.value === selectedClass)) {
                        return [selectedOption, ...newOptions];
                    }
                    return newOptions;
                });
            })
            .catch(err => console.error("Failed to load classes", err));
    }, [academicYear, institutionId, selectedClass]);

    /* ---------- LOAD ASSIGNMENTS & TEACHERS ---------- */
    // Store assignments to filter subjects later locally
    const [classAssignments, setClassAssignments] = useState<any[]>([]);

    useEffect(() => {
        if (!selectedClass || !institutionId) {
            // Keep seeded options if we have a value, otherwise clear
            if (!teacher) setTeacherOptions([]);
            if (!subject) setSubjectOptions([]);
            return;
        }

        setLoadingAssignments(true);

        assignmentService
            .listByClass(institutionId, selectedClass)
            .then((res) => {
                const assignments = res.documents;
                setClassAssignments(assignments);

                const tMap = new Map();

                // Preserve existing selection if it exists in the new list (or keep seeded if not found? No, strictly filter)
                // Actually, for editing, if the assigned teacher is no longer in the list, it's an invalid state, but we should probably show it anyway?
                // For now, let's just populate from the list.

                assignments.forEach((a: any) => {
                    if (a.teacher && a.teacher.$id)
                        tMap.set(a.teacher.$id, {
                            label: a.teacher.name ?? "Teacher",
                            value: a.teacher.$id,
                        });
                });

                if (tMap.size > 0) {
                    setTeacherOptions([...tMap.values()]);
                }
            })
            .catch(err => console.error("Failed to load assignments", err))
            .finally(() => setLoadingAssignments(false));
    }, [selectedClass, institutionId]);

    /* ---------- FILTER SUBJECTS ---------- */
    useEffect(() => {
        if (!teacher || classAssignments.length === 0) {
            // Keep seeded if valid
            if (!subject) setSubjectOptions([]);
            return;
        }

        const sMap = new Map();
        classAssignments.forEach((a: any) => {
            const tId = a.teacher?.$id || a.teacher;
            if (tId === teacher && a.subject && a.subject.$id) {
                sMap.set(a.subject.$id, {
                    label: `${a.subject.name} (${a.subject.code})`,
                    value: a.subject.$id
                });
            }
        });

        if (sMap.size > 0) {
            setSubjectOptions([...sMap.values()]);
        }

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
            showAlert("Error", "All fields required");
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

            showAlert("Success", "Schedule updated", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err) {
            console.log(err);
            showAlert("Error", "Failed to update schedule");
        } finally {
            setSubmitting(false);
        }
    };

    /* ---------- DELETE ---------- */
    const handleDelete = () => {
        showAlert(
            "Delete Schedule",
            "Are you sure you want to delete this schedule?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await scheduleService.delete(scheduleId);
                            router.back();
                        } catch (error: any) {
                            showAlert("Error", `Failed to delete: ${error.message || "Unknown error"}`);
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-background p-4 dark:bg-dark-background"
        >
            <View style={{ flex: 1 }}>
                <PageHeader title="Edit Schedule" />

                <ScrollView className="px-6 bg-card dark:bg-dark-card rounded-xl py-4">
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
                        options={classOptions}
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
                        onChange={(value) => setDayOfWeek(value as "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN")}
                        options={[
                            { label: "Monday", value: "MON" },
                            { label: "Tuesday", value: "TUE" },
                            { label: "Wednesday", value: "WED" },
                            { label: "Thursday", value: "THU" },
                            { label: "Friday", value: "FRI" },
                            { label: "Saturday", value: "SAT" },
                            { label: "Sunday", value: "SUN" },
                        ]}
                        placeholder="Select Day"
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

                    <View className="flex-row items-center justify-between p-4 mb-6 rounded-xl border bg-card border-border dark:bg-dark-card dark:border-dark-border">
                        <Text className="font-semibold text-textPrimary dark:text-dark-textPrimary">
                            Active Status
                        </Text>
                        <Switch
                            value={isActive}
                            onValueChange={setIsActive}
                            trackColor={{ false: "#767577", true: "#3B82F6" }}
                            thumbColor={isActive ? "#FFFFFF" : "#f4f3f4"}
                        />
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
        </KeyboardAvoidingView>
    );
}
