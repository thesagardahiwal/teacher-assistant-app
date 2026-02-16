import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { classService } from "@/services";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";
import { useCourses } from "@/store/hooks/useCourses";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateClass() {
  const router = useRouter();
  const { goBack } = useSafeBack();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();

  const { data: courses, fetchCourses } = useCourses();
  const { data: academicYears, fetchAcademicYears } = useAcademicYears();

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (institutionId) {
      fetchCourses(institutionId);
      // Fetch fresh years to ensure we know the current one
      fetchAcademicYears(institutionId);
    }
  }, [institutionId]);

  const onRefresh = async () => {
    if (!institutionId) return;
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCourses(institutionId),
        fetchAcademicYears(institutionId),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Set default Academic Year to CURRENT
  useEffect(() => {
    if (academicYears.length > 0) {
      const current = academicYears.find(ay => ay.isCurrent);
      if (current) {
        setAcademicYear(current.$id);
      }
    }
  }, [academicYears]);

  // BLOCKER: No Academic Years
  if (academicYears.length === 0 && !loading) { // Wait for loading? useAcademicYears might have loading state but it's not exposed well in destructure above. Assuming data starts empty.
    // Better: Check if we tried fetching. For now, rely on render check.
    // If we really have 0 and we are initialized.
  }

  const handleSubmit = async () => {
    if (academicYears.length === 0) {
      showAlert("Action Blocked", "Please create an Academic Year first.", [
        { text: "Go to Academic Years", onPress: () => router.push("/(admin)/academic-years") },
        { text: "Cancel", style: "cancel" }
      ]);
      return;
    }
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
        { text: "OK", onPress: () => goBack() }
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
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-dark-background" : "bg-background"}`}>
      <PageHeader title="New Class" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#ffffff" : "#2563EB"}
          />
        }
        contentContainerStyle={
          academicYears.length === 0
            ? { flexGrow: 1, paddingBottom: 120 }
            : { paddingBottom: 120 }
        }
      >
        {academicYears.length === 0 ? (
          <View className="flex-1 justify-center items-center p-6">
            <Text className={`text-lg text-center mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              You cannot create a class without an Academic Year.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/academic-years/create")}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Create Academic Year</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}
