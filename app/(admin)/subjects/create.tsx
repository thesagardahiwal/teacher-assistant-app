import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { subjectService } from "@/services";
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

export default function CreateSubject() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();

  const { data: courses, fetchCourses } = useCourses();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institutionId) {
      fetchCourses(institutionId);
    }
  }, [institutionId]);

  const handleSubmit = async () => {
    if (!name || !code || !course || !semester || !institutionId) {
      showAlert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await subjectService.create({
        name,
        code,
        course,
        semester: Number(semester),
        institution: institutionId,
      });

      showAlert("Success", "Subject created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

  return (
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-dark-background" : "bg-background"}`}>
      <PageHeader title="New Subject" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

          <FormSelect
            label="Course"
            value={course}
            onChange={setCourse}
            options={courseOptions}
            placeholder="Select Course"
          />

          <FormInput
            label="Subject Name"
            placeholder="Data Structures"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Subject Code"
            placeholder="CS101"
            value={code}
            onChangeText={setCode}
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
            <Text className="text-white font-bold text-lg">Create Subject</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
