import { institutionStorage } from "@/utils/institutionStorage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLLECTIONS } from "../../services/appwrite/collections";
import { databaseService } from "../../services/appwrite/database.service";
import { useAuth } from "../../store/hooks/useAuth";

const AdminProfile = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  // personal info
  const [designation, setDesignation] = useState("");

  // institution info
  const [institutionName, setInstitutionName] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, isLoading]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!designation || !institutionName || !institutionCode) return;

    try {
      setSubmitting(true);

      // 1️⃣ Create Institution
      const institution = await databaseService.create(
        COLLECTIONS.INSTITUTIONS,
        {
          name: institutionName,
          code: institutionCode,
          isActive: true,
        }
      );

      // 2️⃣ Update Admin User Profile
      await databaseService.update(
        COLLECTIONS.USERS,
        user.$id,
        {
          designation,
          institution: institution.$id,
        }
      );

      // 3️⃣ Store Institution ID Locally
      await institutionStorage.setInstitutionId(institution.$id);

      // 4️⃣ Redirect to Dashboard
      router.replace("/(admin)/dashboard");
    } catch (error) {
      console.error("Admin onboarding failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-dark-background px-6 justify-center">
      <Text className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary mb-6 text-center">
        Complete Your Profile
      </Text>

      {/* PERSONAL DETAILS */}
      <Text className="text-base font-semibold mb-2 text-textSecondary dark:text-dark-textSecondary">
        Personal Details
      </Text>

      <TextInput
        placeholder="Designation (e.g. Admin Officer)"
        value={designation}
        placeholderTextColor="#94A3B8"
        onChangeText={setDesignation}
        className="bg-card text-textPrimary dark:text-dark-textPrimary dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-6"
      />

      {/* INSTITUTION DETAILS */}
      <Text className="text-base font-semibold mb-2 text-textSecondary dark:text-dark-textSecondary">
        Institution Details
      </Text>

      <TextInput
        placeholder="Institution Name"
        value={institutionName}
        onChangeText={setInstitutionName}
        placeholderTextColor="#94A3B8"
        className="bg-card text-textPrimary dark:text-dark-textPrimary dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-4"
      />

      <TextInput
        placeholder="Institution Code (short)"
        value={institutionCode}
        placeholderTextColor="#94A3B8"
        onChangeText={setInstitutionCode}
        className="bg-card text-textPrimary dark:text-dark-textPrimary dark:bg-dark-card border border-border dark:border-dark-border rounded-xl px-4 py-4 mb-6"
      />

      {/* SUBMIT */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        className="bg-primary dark:bg-dark-primary rounded-xl py-4 items-center"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Complete Setup
          </Text>
        )}
      </TouchableOpacity>

      <Text className="text-xs text-muted dark:text-dark-muted mt-4 text-center">
        This setup is required before accessing the dashboard.
      </Text>
    </View>
  );
};

export default AdminProfile;
