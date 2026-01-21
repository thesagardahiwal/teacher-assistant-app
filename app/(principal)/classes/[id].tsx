import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { classService } from "@/services";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    View
} from "react-native";

export default function ClassDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();

    const { fetchClasses } = useClasses();
    const { data: courses, fetchCourses } = useCourses();
    const { data: academicYears, fetchAcademicYears } = useAcademicYears();

    const [semester, setSemester] = useState("");
    const [course, setCourse] = useState("");
    const [academicYear, setAcademicYear] = useState("");
    const [name, setName] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (institutionId) {
            fetchCourses(institutionId);
            fetchAcademicYears(institutionId);
        }
    }, [institutionId]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await classService.get(id as string);
            setSemester(doc.semester as unknown as string || "");
            setCourse(doc.course.$id || "");
            setAcademicYear(doc.academicYear.$id || "");
            setName(doc.name || "");
        } catch (error) {
            console.error("loadData Error:", error);
            showAlert("Error", "Failed to load class");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));
    const academicYearOptions = academicYears.map(ay => ({ label: ay.label, value: ay.$id }));

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
                title="Class Details"
            // No Delete Button
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                    <FormSelect
                        label="Course"
                        value={course}
                        onChange={() => { }} // No-op
                        options={courseOptions}
                        placeholder="Select Course"
                        editable={false}
                    />

                    <FormSelect
                        label="Academic Year"
                        value={academicYear}
                        onChange={() => { }} // No-op
                        options={academicYearOptions}
                        placeholder="Select Academic Year"
                        editable={false}
                    />

                    <View className="flex-row justify-between">
                        <View className="flex-1 ml-2">
                            <FormInput
                                label="Semester"
                                placeholder="1"
                                value={semester}
                                onChangeText={setSemester}
                                keyboardType="numeric"
                                editable={false}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <FormInput
                                label="Name"
                                placeholder="eg. 1st year"
                                value={name}
                                onChangeText={setName}
                                editable={false}
                            />
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}
