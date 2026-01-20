import { InviteSuccessModal } from "@/components/admin/modals/InviteSuccessModal";
import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { teacherService } from "@/services";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { getInviteLink } from "@/utils/linking";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateTeacher() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { fetchTeachers } = useTeachers();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !institutionId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { invitation } = await teacherService.create({
        name,
        email,
        institution: institutionId,
        role: "TEACHER",
      });

      await fetchTeachers(institutionId);

      setInviteLink(getInviteLink(invitation.token));
      setModalVisible(true);

    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PageHeader title="Add Teacher" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

          {/* Removed Default Password Warning */}

          <FormInput
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />

          <FormInput
            label="Email Address"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
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
            <Text className="text-white font-bold text-lg">Send Invitation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <InviteSuccessModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.back();
        }}
        inviteLink={inviteLink}
        email={email}
      />
    </View>
  );
}
