import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useCourses } from "@/store/hooks/useCourses";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateCourse() {
  const router = useRouter();
  const { goBack } = useSafeBack();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { createCourse } = useCourses();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [durationYears, setDurationYears] = useState("3");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !code || !durationYears || !institutionId) {
      showAlert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createCourse({
        name,
        code,
        durationYears: parseInt(durationYears),
        institution: institutionId,
        isActive: true, // Default to true
      });

      showAlert("Success", "Course created successfully", [
        { text: "OK", onPress: () => goBack() }
      ]);
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PageHeader title="New Course" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <FormInput
            label="Course Name"
            placeholder="Computer Science"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Course Code"
            placeholder="CS"
            value={code}
            onChangeText={setCode}
          />

          <FormInput
            label="Duration (Years)"
            placeholder="3"
            value={durationYears}
            onChangeText={setDurationYears}
            keyboardType="numeric"
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
            <Text className="text-white font-bold text-lg">Create Course</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
