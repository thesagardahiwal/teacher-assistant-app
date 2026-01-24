import { FormInput } from "@/components/admin/ui/FormInput";
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
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { getErrorMessage, validators } from "@/utils/validators";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    /* ---------------- INITIAL LOAD ---------------- */

    useEffect(() => {
        if (institutionId) {
            fetchTeachers(institutionId);
            fetchAcademicYears(institutionId);
        }
    }, [institutionId]);

    const fetchAcademicYears = async (instId: string) => {
        try {
            const res = await academicYearService.list(instId);
            const options = res.documents.map((ay: any) => ({
                label: ay.label,
                value: ay.$id,
            }));
            setAcademicYears(options);
            const current = res.documents.find((ay: any) => ay.isCurrent);
            if (current) setAcademicYear(current.$id);
        } catch (error) {
            console.error("Failed to fetch academic years", error);
        }
    };

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
                showAlert("Error", "Failed to fetch class assignments");
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


    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!academicYear) newErrors.academicYear = getErrorMessage('required', 'Academic Year');
        if (!selectedClass) newErrors.selectedClass = getErrorMessage('required', 'Class');
        if (!teacher) newErrors.teacher = getErrorMessage('required', 'Teacher');
        if (!subject) newErrors.subject = getErrorMessage('required', 'Subject');
        if (!dayOfWeek) newErrors.dayOfWeek = getErrorMessage('required', 'Day');

        if (!validators.isRequired(startTime)) {
            newErrors.startTime = getErrorMessage('required', 'Start Time');
        } else if (!validators.isValidTimeFormat(startTime)) {
            newErrors.startTime = getErrorMessage('time', 'Start Time');
        }

        if (!validators.isRequired(endTime)) {
            newErrors.endTime = getErrorMessage('required', 'End Time');
        } else if (!validators.isValidTimeFormat(endTime)) {
            newErrors.endTime = getErrorMessage('time', 'End Time');
        }

        if (!newErrors.startTime && !newErrors.endTime && !validators.isTimeRangeValid(startTime, endTime)) {
            newErrors.endTime = getErrorMessage('timeRange', 'End Time'); // Show range error on EndTime
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ---------------- SUBMIT ---------------- */

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        if (!institutionId) return;

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

            showAlert("Success", "Schedule created", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (e: any) {
            showAlert("Error", e.message || "Failed to create schedule");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        >
            <View style={{ flex: 1 }}>
                <PageHeader title="Create Schedule" />

                <ScrollView className="px-2" showsVerticalScrollIndicator={false}>
                    <FormSelect
                        label="Academic Year"
                        value={academicYear}
                        onChange={(val) => {
                            setAcademicYear(val);
                            if (val) setErrors(prev => ({ ...prev, academicYear: "" }));
                        }}
                        options={academicYears}
                        placeholder="Select Academic Year"
                        required
                        error={errors.academicYear}
                    />

                    <FormSelect
                        label="Class"
                        value={selectedClass}
                        onChange={(val) => {
                            setSelectedClass(val);
                            if (val) setErrors(prev => ({ ...prev, selectedClass: "" }));
                        }}
                        options={availableClasses}
                        placeholder={academicYear ? "Select Class" : "Select Academic Year First"}
                        required
                        error={errors.selectedClass}
                    />

                    {loadingAssignments && (
                        <View className="py-3">
                            <ActivityIndicator />
                            <Text className={`text-xs text-center mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                Loading class assignments...
                            </Text>
                        </View>
                    )}

                    <FormSelect
                        label="Teacher"
                        value={teacher}
                        onChange={(val) => {
                            setTeacher(val);
                            if (val) setErrors(prev => ({ ...prev, teacher: "" }));
                        }}
                        options={teacherOptions}
                        placeholder={selectedClass ? "Select Teacher (Assigned)" : "Select Class First"}
                        required
                        error={errors.teacher}
                    />

                    <FormSelect
                        label="Subject"
                        value={subject}
                        onChange={(val) => {
                            setSubject(val);
                            if (val) setErrors(prev => ({ ...prev, subject: "" }));
                        }}
                        options={subjectOptions}
                        placeholder={teacher ? "Select Subject" : "Select Teacher First"}
                        required
                        error={errors.subject}
                    />

                    <FormSelect
                        label="Day"
                        value={dayOfWeek}
                        onChange={(v) => {
                            setDayOfWeek(v as any);
                            if (v) setErrors(prev => ({ ...prev, dayOfWeek: "" }));
                        }}
                        options={days}
                        placeholder="Select Day"
                        required
                        error={errors.dayOfWeek}
                    />

                    {/* TIME */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <FormInput
                                label="Start Time"
                                placeholder="09:00"
                                value={startTime}
                                onChangeText={(val) => {
                                    setStartTime(val);
                                    if (val) setErrors(prev => ({ ...prev, startTime: "" }));
                                }}
                                required
                                error={errors.startTime}
                            />
                        </View>
                        <View className="flex-1">
                            <FormInput
                                label="End Time"
                                placeholder="10:00"
                                value={endTime}
                                onChangeText={(val) => {
                                    setEndTime(val);
                                    if (val) setErrors(prev => ({ ...prev, endTime: "" }));
                                }}
                                required
                                error={errors.endTime}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`mt-4 py-4 rounded-xl items-center ${loading ? "bg-blue-400" : "bg-blue-600"}`}
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
