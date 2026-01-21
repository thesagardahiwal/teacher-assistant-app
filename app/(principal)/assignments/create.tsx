import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { assignmentService } from "@/services";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useSubjects } from "@/store/hooks/useSubjects";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateAssignment() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { data: teachers, fetchTeachers } = useTeachers();
    const { data: courses, fetchCourses } = useCourses();
    const { data: classes, fetchClasses } = useClasses();
    const { data: subjects, fetchSubjects } = useSubjects();
    const { fetchAssignments } = useAssignments();

    const [teacher, setTeacher] = useState("");
    const [course, setCourse] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [subject, setSubject] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (institutionId) {
            fetchTeachers(institutionId);
            fetchCourses(institutionId);
            fetchClasses(institutionId);
            fetchSubjects(institutionId);
        }
    }, [institutionId]);

    const handleSubmit = async () => {
        if (!teacher || !selectedClass || !subject || !institutionId) {
            showAlert("Error", "Please fill in all required fields (Teacher, Class, Subject)");
            return;
        }

        setLoading(true);
        try {
            await assignmentService.create({
                teacher,
                class: selectedClass,
                subject,
                institution: institutionId,
            });

            await fetchAssignments(institutionId);

            showAlert("Success", "Assignment created successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            showAlert("Error", error.message || "Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    const teacherOptions = teachers.map(t => ({ label: `${t.name} (${t.email})`, value: t.$id }));
    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

    const classOptions = classes
        .filter(c => !course || c.course?.$id === course) // Filter by course if selected
        .map(c => ({ label: `Semester ${c.semester} (${c.course?.code})`, value: c.$id }));

    const subjectOptions = subjects
        .filter(s => !course || s.course?.$id === course) // Filter by course if selected
        .map(s => ({ label: `${s.name} (${s.code}) - Sem ${s.semester}`, value: s.$id }));

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader title="New Assignment" />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                    <View className="mb-4">
                        <Text className={`mb-2 font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Select Teacher
                        </Text>
                        <FormSelect
                            label="Teacher"
                            value={teacher}
                            onChange={setTeacher}
                            options={teacherOptions}
                            placeholder="Select Teacher"
                        />
                    </View>

                    <View className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

                    {/* Optional Course Filter */}
                    <FormSelect
                        label="Filter by Course (Optional)"
                        value={course}
                        onChange={(val) => {
                            setCourse(val);
                            setSelectedClass("");
                            setSubject("");
                        }}
                        options={courseOptions}
                        placeholder="All Courses"
                    />

                    <View className="flex-row justify-between gap-4">
                        <View className="flex-1">
                            <FormSelect
                                label="Class"
                                value={selectedClass}
                                onChange={setSelectedClass}
                                options={classOptions}
                                placeholder="Select Class"
                            />
                        </View>
                    </View>

                    <FormSelect
                        label="Subject"
                        value={subject}
                        onChange={setSubject}
                        options={subjectOptions}
                        placeholder="Select Subject"
                    />

                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-4 rounded-xl items-center mb-10 ${loading ? "bg-blue-400" : "bg-blue-600"
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Assign Teacher</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
