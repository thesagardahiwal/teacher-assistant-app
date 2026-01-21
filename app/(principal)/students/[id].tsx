import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { studentService } from "@/services";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
} from "react-native";

export default function StudentDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { fetchStudents } = useStudents();
    const { data: courses, fetchCourses } = useCourses();
    const { data: classes, fetchClasses } = useClasses();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [roll, setRoll] = useState("");
    const [course, setCourse] = useState("");
    const [selectedClass, setSelectedClass] = useState<string>("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (institutionId) {
            fetchCourses(institutionId);
            fetchClasses(institutionId);
        }
    }, [institutionId]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await studentService.get(id as string);
            setRoll(doc.rollNumber);
            setCourse(doc.course?.$id || "");
            setSelectedClass(doc.class.$id);

            // Load User Details
            if (doc) {
                try {
                    const userDoc = await studentService.get(doc.$id); // Assuming get retrieves user data too if needed or distinct call
                    // Actually existing logic used studentService.get(doc.$id) which seems to imply student ID matches user ID?
                    // Reusing the logic from admin screen:
                    setName(doc.name); // Using doc.name directly as it's often populated
                    setEmail(doc.email || '');
                } catch {
                    setName(doc.name);
                    setEmail(doc.email || '');
                }
            }
        } catch (error) {
            showAlert("Error", "Failed to load student");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

    const classOptions = classes
        .filter(c => {
            const courseId = typeof c.course === 'object' ? c.course?.$id : c.course;
            return courseId === course;
        })
        .map(c => ({ label: c.name, value: c.$id }));

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
                title="Student Details"
            // No Delete Button
            />

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Personal Info Card */}
                <View className={`p-6 rounded-2xl mb-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Personal Information
                    </Text>

                    <FormInput
                        label="Full Name"
                        placeholder="Student Name"
                        value={name}
                        onChangeText={setName}
                        editable={false} // READ ONLY
                    />

                    <View className="opacity-60">
                        <FormInput
                            label="Email Address"
                            value={email}
                            editable={false}
                        />
                    </View>
                </View>

                {/* Academic Info Card */}
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Academic Details
                    </Text>

                    <FormInput
                        label="Roll Number"
                        placeholder="101"
                        value={roll}
                        onChangeText={setRoll}
                        editable={false}
                    />

                    <FormSelect
                        label="Course"
                        value={course}
                        onChange={() => { }} // No-op
                        options={courseOptions}
                        placeholder="Select Course"
                        editable={false}
                    />

                    <FormSelect
                        label="Class"
                        value={selectedClass}
                        onChange={() => { }} // No-op
                        options={classOptions}
                        placeholder="Select Class"
                        editable={false}
                    />
                </View>

            </ScrollView>
        </View>
    );
}
