import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { classService } from "@/services";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";
import { useCourses } from "@/store/hooks/useCourses";
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

export default function CreateClass() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();

  const { data: courses, fetchCourses } = useCourses();
  const { data: academicYears, fetchAcademicYears } = useAcademicYears();

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institutionId) {
      fetchCourses(institutionId);
      fetchAcademicYears(institutionId);
    }
  }, [institutionId]);

  const handleSubmit = async () => {
    if (!semester || !name || !course || !academicYear || !institutionId) {
      showAlert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await classService.create({
        semester: Number(semester),
        course,
        academicYear,
        institution: institutionId,
        name: name,
      });

      showAlert("Success", "Class created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));
  const academicYearOptions = academicYears.map(ay => ({ label: ay.label, value: ay.$id }));

  return (
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PageHeader title="New Class" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

          <FormSelect
            label="Course"
            value={course}
            onChange={setCourse}
            options={courseOptions}
            placeholder="Select Course"
          />

          <FormSelect
            label="Academic Year"
            value={academicYear}
            onChange={setAcademicYear}
            options={academicYearOptions}
            placeholder="Select Academic Year"
          />

          <View className="flex-row justify-between">
            <View className="flex-1 ml-2">
              <FormInput
                label="Semester"
                placeholder="1"
                value={semester}
                onChangeText={setSemester}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-2">
              <FormInput
                label="Name"
                placeholder="Class Name"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

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
            <Text className="text-white font-bold text-lg">Create Class</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
