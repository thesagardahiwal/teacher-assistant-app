import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { studentService } from "@/services";
import { authService } from "@/services/appwrite/auth.service";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateStudent() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();

  const { data: courses, fetchCourses } = useCourses();
  const { data: classes, fetchClasses } = useClasses();
  const { fetchStudents } = useStudents();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roll, setRoll] = useState("");
  const [course, setCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (institutionId) {
      fetchCourses(institutionId);
      fetchClasses(institutionId);
    }
  }, [institutionId]);

  const handleSubmit = async () => {
    if (!name || !email || !roll || !course || !selectedClass || !institutionId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth Account
      const user = await authService.createUser({
        name,
        email,
        password: "Student@123", // Default password
        role: "STUDENT",
        institutionId,
      });

      // 2. Create Student Document
      await studentService.create({
        user: user.$id,
        rollNumber: roll,
        course,
        class: selectedClass,
        institution: institutionId,
      });

      await fetchStudents(institutionId);

      Alert.alert("Success", "Student created successfully. Default password is 'Student@123'", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));
  const classOptions = classes
    .filter(c => c.course?.$id === course) // Filter classes by selected course
    .map(c => ({ label: `Year ${c.year} - ${c.division}`, value: c.$id }));

  return (
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PageHeader title="New Student" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

          <View className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Text className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
              New students will be created with default password: <Text className="font-bold">Student@123</Text>
            </Text>
          </View>

          <FormInput
            label="Full Name"
            placeholder="Student Name"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Email Address"
            placeholder="student@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormInput
            label="Roll Number"
            placeholder="101"
            value={roll}
            onChangeText={setRoll}
          />

          <FormSelect
            label="Course"
            value={course}
            onChange={setCourse}
            options={courseOptions}
            placeholder="Select Course"
          />

          <FormSelect
            label="Class"
            value={selectedClass}
            onChange={setSelectedClass}
            options={classOptions}
            placeholder="Select Class"
            error={course && classOptions.length === 0 ? "No classes found for this course" : undefined}
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
            <Text className="text-white font-bold text-lg">Create Student</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
