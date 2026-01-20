import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { assignmentService } from "@/services";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useSubjects } from "@/store/hooks/useSubjects";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditAssignment() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (institutionId) {
            fetchTeachers(institutionId);
            fetchCourses(institutionId);
            fetchClasses(institutionId);
            fetchSubjects(institutionId);
        }
    }, [institutionId]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await assignmentService.get(id as string);
            setTeacher(doc.teacher?.$id || "");
            setSubject(doc.subject?.$id || "");
            setSelectedClass(doc.class?.$id || "");

            // Try to set course if present in subject or class
            if (doc.subject?.course?.$id) {
                setCourse(doc.subject.course.$id);
            } else if (doc.class?.course?.$id) {
                setCourse(doc.class.course.$id);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load assignment");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        Alert.alert("Delete", "Are you sure you want to delete this assignment?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await assignmentService.delete(id as string);
                        if (institutionId) await fetchAssignments(institutionId);
                        router.back();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!teacher || !selectedClass || !subject) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await assignmentService.update(id as string, {
                teacher,
                class: selectedClass,
                subject,
            });

            if (institutionId) await fetchAssignments(institutionId);
            Alert.alert("Success", "Assignment updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update assignment");
        } finally {
            setSaving(false);
        }
    };

    const teacherOptions = teachers.map(t => ({ label: `${t.name} (${t.email})`, value: t.$id }));
    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

    const classOptions = classes
        .filter(c => !course || c.course?.$id === course)
        .map(c => ({ label: `Year ${c.academicYear.label} - Division ${c.name} (${c.course?.code})`, value: c.$id }));

    const subjectOptions = subjects
        .filter(s => !course || s.course?.$id === course)
        .map(s => ({ label: `${s.name} (${s.code}) - Sem ${s.semester}`, value: s.$id }));

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        )
    }

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader
                title="Edit Assignment"
                rightAction={
                    <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                    <View className="mb-4">
                        <Text className={`mb-2 font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Teacher
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
                    disabled={saving}
                    className={`py-4 rounded-xl items-center mb-10 ${saving ? "bg-blue-400" : "bg-blue-600"
                        }`}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
