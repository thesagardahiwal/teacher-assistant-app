import { FormSelect } from "@/components/admin/ui/FormSelect";
import { FormTimePicker } from "@/components/admin/ui/FormTimePicker";
import {
    academicYearService,
    assignmentService,
    classService,
    scheduleService,
} from "@/services";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { validators } from "@/utils/validators";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ScheduleFormProps {
    institutionId: string;
    initialTeacherId?: string; // If provided, locks the teacher field (for Teacher View)
    onSuccess: () => void;
}



export const ScheduleForm = ({ institutionId, initialTeacherId, onSuccess }: ScheduleFormProps) => {
    const { isDark } = useTheme();
    const { fetchTeachers } = useTeachers();

    const [academicYears, setAcademicYears] = useState<{ label: string; value: string }[]>([]);
    const [academicYear, setAcademicYear] = useState("");

    const [teacher, setTeacher] = useState(initialTeacherId || "");
    const [availableClasses, setAvailableClasses] = useState<{ label: string; value: string }[]>([]);

    // Derived options from API
    const [teacherOptions, setTeacherOptions] = useState<{ label: string, value: string }[]>([]);
    const [subjectOptions, setSubjectOptions] = useState<{ label: string, value: string }[]>([]);

    const [selectedClass, setSelectedClass] = useState("");
    const [subject, setSubject] = useState("");

    const [dayOfWeek, setDayOfWeek] = useState<"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN">("MON");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Data Store for filtering
    const [classAssignments, setClassAssignments] = useState<any[]>([]);

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
                isCurrent: ay.isCurrent
            }));
            setAcademicYears(options);
            const current = options.find((ay: any) => ay.isCurrent);
            if (current) setAcademicYear(current.value);
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

        // Reset
        setSelectedClass("");
        if (!initialTeacherId) setTeacher(""); // Only reset teacher if not locked
        setSubject("");
    }, [academicYear, institutionId]);

    /* ---------------- LOAD ASSIGNMENTS ---------------- */
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

                // Teachers Options
                if (!initialTeacherId) {
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
                    setTeacher("");
                } else {
                    // If teacher is locked, just ensure valid
                    setTeacher(initialTeacherId);
                }
            })
            .catch(err => {
                console.error("Failed to fetch assignments", err);
                showAlert("Error", "Failed to fetch class assignments");
            })
            .finally(() => setLoadingAssignments(false));

        setSubject("");
    }, [selectedClass, institutionId]);

    /* ---------------- UPDATE SUBJECTS ---------------- */
    useEffect(() => {
        if (!teacher || classAssignments.length === 0) {
            setSubjectOptions([]);
            return;
        }

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
        setSubject("");

    }, [teacher, classAssignments]);


    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!academicYear) newErrors.academicYear = "Required";
        if (!selectedClass) newErrors.selectedClass = "Required";
        if (!teacher) newErrors.teacher = "Required";
        if (!subject) newErrors.subject = "Required";
        if (!dayOfWeek) newErrors.dayOfWeek = "Required";

        if (!validators.isRequired(startTime)) newErrors.startTime = "Required";

        if (!validators.isRequired(endTime)) newErrors.endTime = "Required";

        if (!newErrors.startTime && !newErrors.endTime) {
            const start = new Date(`1970-01-01T${startTime}:00`);
            const end = new Date(`1970-01-01T${endTime}:00`);
            if (end <= start) {
                newErrors.endTime = "End time must be after start time";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await scheduleService.create({
                teacher,
                class: selectedClass,
                subject,
                academicYear,
                dayOfWeek,
                startTime,
                endTime,
                institution: institutionId,
                isActive: true,
            });
            onSuccess();
        } catch (e: any) {
            showAlert("Error", e.message || "Failed to create schedule");
        } finally {
            setLoading(false);
        }
    };

    const days = [
        { label: "Monday", value: "MON" },
        { label: "Tuesday", value: "TUE" },
        { label: "Wednesday", value: "WED" },
        { label: "Thursday", value: "THU" },
        { label: "Friday", value: "FRI" },
        { label: "Saturday", value: "SAT" },
    ];

    return (
        <View className="flex-1">
            <Animated.View entering={FadeInDown.delay(100)}>
                <FormSelect
                    label="Academic Year"
                    value={academicYear}
                    onChange={setAcademicYear}
                    options={academicYears}
                    placeholder="Select Year"
                    required
                    error={errors.academicYear}
                />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)}>
                <FormSelect
                    label="Class"
                    value={selectedClass}
                    onChange={setSelectedClass}
                    options={availableClasses}
                    placeholder={academicYear ? "Select Class" : "Select Academic Year First"}
                    required
                    error={errors.selectedClass}
                />
            </Animated.View>

            {/* If loading assignments */}
            {loadingAssignments && (
                <View className="mb-4">
                    <ActivityIndicator color={isDark ? "white" : "#2563EB"} />
                    <Text className={`text-center text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading Assignments...</Text>
                </View>
            )}

            {!initialTeacherId && (
                <Animated.View entering={FadeInDown.delay(300)}>
                    <FormSelect
                        label="Teacher"
                        value={teacher}
                        onChange={setTeacher}
                        options={teacherOptions}
                        placeholder={selectedClass ? "Select Teacher" : "Select Class First"}
                        required
                        error={errors.teacher}
                    />
                </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(400)}>
                <FormSelect
                    label="Subject"
                    value={subject}
                    onChange={setSubject}
                    options={subjectOptions}
                    placeholder={teacher ? "Select Subject" : "Select Teacher First"}
                    required
                    error={errors.subject}
                />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500)}>
                <FormSelect
                    label="Day"
                    value={dayOfWeek}
                    onChange={(val) => setDayOfWeek(val as any)}
                    options={days}
                    placeholder="Select Day"
                    required
                    error={errors.dayOfWeek}
                />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)} className="flex-row gap-4 mb-2">
                <View className="flex-1">
                    <FormTimePicker
                        label="Start Time"
                        value={startTime}
                        onChange={(val) => {
                            setStartTime(val);
                            // If end time is set and is before new start time, reset it
                            if (endTime && val >= endTime) {
                                setEndTime("");
                            }
                        }}
                        placeholder="Select"
                        required
                        error={errors.startTime}
                    />
                </View>
                <View className="flex-1">
                    <FormTimePicker
                        label="End Time"
                        value={endTime}
                        onChange={setEndTime}
                        placeholder="Select"
                        required
                        error={errors.endTime}
                        minTime={startTime} // Enforce Start < End in picker if supported
                    />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700)}>
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`mt-4 py-4 rounded-2xl items-center shadow-lg shadow-primary/30 ${loading ? "bg-primary/70" : "bg-primary"}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">
                            Create Schedule
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
