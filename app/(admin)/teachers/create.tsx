import { InviteSuccessModal } from "@/components/admin/modals/InviteSuccessModal";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import ModeSwitcher from "@/components/common/ModeSwitcher";
import { UserProfileForm } from "@/components/common/UserProfileForm";
import { AdminTeacherProfileConfig } from "@/config/user-profile.config";
import { teacherService } from "@/services";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { getInviteLink } from "@/utils/linking";
import { useSafeBack } from "@/utils/navigation";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { validators } from "@/utils/validators";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, SlideInDown, ZoomIn } from "react-native-reanimated";

interface ParsedTeacher {
  name: string;
  email: string;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  status: "VALID" | "INVALID";
  error?: string;
}

export default function CreateTeacher() {
  const router = useRouter();
  const { goBack } = useSafeBack();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { fetchTeachers } = useTeachers();

  // Mode Selection: "manual" or "bulk"
  const [mode, setMode] = useState<"manual" | "bulk">("manual");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");

  /* ---------- BULK UPLOAD STATE ---------- */
  const [parsedData, setParsedData] = useState<ParsedTeacher[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<{ created: number; failed: number } | null>(null);

  const handleManualSubmit = async (data: any) => {
    // Validation is handled by UserProfileForm before calling this
    if (!institutionId) {
      showAlert("Error", "Institution ID missing. Please relogin.");
      return;
    }

    setLoading(true);
    try {
      const { invitation } = await teacherService.create({
        name: data.name.trim(),
        email: data.email.trim(),
        institution: institutionId,
        role: "TEACHER",
        department: data.department?.trim() || undefined,
        designation: data.designation?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        bloodGroup: data.bloodGroup?.trim() || undefined,
      });

      await fetchTeachers(institutionId);

      setInviteLink(getInviteLink(invitation.token));
      setCreatedEmail(data.email.trim());
      setModalVisible(true);

    } catch (error: any) {
      showAlert("Error", error.message || "Failed to create teacher");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- BULK UPLOAD LOGIC ---------- */

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      let content = "";
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        content = await response.text();
      } else {
        content = await FileSystem.readAsStringAsync(file.uri);
      }

      parseCSV(content);

    } catch (err) {
      console.error("File pick error:", err);
      showAlert("Error", "Failed to read file");
    }
  };

  const parseCSV = (content: string) => {
    // Simple parser: Split by newline, then comma
    const rows = content.split(/\r?\n/).filter(r => r.trim());
    if (rows.length < 2) {
      showAlert("Error", "CSV is empty or missing headers");
      return;
    }

    const headers = rows[0].split(",").map(h => h.trim().toLowerCase());

    // We expect headers: fullName, email, designation, department, phone, address, bloodGroup
    const mapIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h.includes("name")) mapIndex["name"] = i;
      else if (h.includes("email")) mapIndex["email"] = i;
      else if (h.includes("department")) mapIndex["department"] = i;
      else if (h.includes("designation")) mapIndex["designation"] = i;
      else if (h.includes("phone")) mapIndex["phone"] = i;
      else if (h.includes("address")) mapIndex["address"] = i;
      else if (h.includes("blood")) mapIndex["bloodGroup"] = i;
    });

    if (mapIndex["name"] === undefined || mapIndex["email"] === undefined) {
      showAlert("Error", "CSV must contain 'fullName' and 'email' columns");
      return;
    }

    const parsed: ParsedTeacher[] = [];

    for (let i = 1; i < rows.length; i++) {
      // Simple split
      const cols = rows[i].split(",").map(c => c.trim());

      // Pad cols if short
      while (cols.length < headers.length) cols.push("");

      const p: any = {};
      p.name = cols[mapIndex["name"]] || "";
      p.email = cols[mapIndex["email"]] || "";
      if (mapIndex["department"] !== undefined) p.department = cols[mapIndex["department"]];
      if (mapIndex["designation"] !== undefined) p.designation = cols[mapIndex["designation"]];
      if (mapIndex["phone"] !== undefined) p.phone = cols[mapIndex["phone"]];
      if (mapIndex["address"] !== undefined) p.address = cols[mapIndex["address"]];
      if (mapIndex["bloodGroup"] !== undefined) p.bloodGroup = cols[mapIndex["bloodGroup"]];

      // Validate
      let error = undefined;
      let status: "VALID" | "INVALID" = "VALID";

      if (!p.name) { status = "INVALID"; error = "Missing Name"; }
      else if (!p.email) { status = "INVALID"; error = "Missing Email"; }
      else if (!validators.isValidEmail(p.email)) { status = "INVALID"; error = "Invalid Email"; }

      parsed.push({
        ...p,
        status,
        error
      });
    }

    setParsedData(parsed);
    setBulkSummary(null);
  };

  const processBulk = async () => {
    const validRows = parsedData.filter(d => d.status === "VALID");
    if (validRows.length === 0) {
      showAlert("Error", "No valid rows to process");
      return;
    }
    if (!institutionId) {
      showAlert("Error", "Institution ID missing. Please relogin.");
      return;
    }

    setBulkProcessing(true);
    let created = 0;
    let failed = 0;

    // Process sequentially to avoid rate limits
    for (const row of validRows) {
      try {
        await teacherService.create({
          name: row.name,
          email: row.email,
          institution: institutionId,
          role: "TEACHER",
          department: row.department,
          designation: row.designation,
          phone: row.phone,
          address: row.address,
          bloodGroup: row.bloodGroup
        });
        created++;
      } catch (e) {
        console.error("Bulk create failed for " + row.email, e);
        failed++;
      }
    }

    await fetchTeachers(institutionId);
    setBulkSummary({ created, failed });
    setBulkProcessing(false);
  };

  /* ---------- RENDER HELPERS ---------- */

  return (
    <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
      <View className="px-6 pt-6 pb-2">
        <PageHeader title="Add New Teacher" showBack />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Mode Switcher */}
          <Animated.View entering={FadeInDown.delay(100)} className="mb-6">
            <ModeSwitcher mode={mode} setMode={setMode} isDark={isDark} />
          </Animated.View>

          {/* Content */}
          {mode === "manual" ? (
            <Animated.View entering={FadeInDown.delay(200)} className={`p-6 rounded-3xl mb-6 shadow-sm border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-border"}`}>
              <Text className={`text-xl font-bold mb-6 ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>
                Teacher Details
              </Text>
              <UserProfileForm
                initialData={{}}
                config={AdminTeacherProfileConfig}
                onSubmit={handleManualSubmit}
                loading={loading}
                saving={loading}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(200)} className="flex-1">
              {/* Summary View */}
              {bulkSummary && (
                <Animated.View entering={ZoomIn} className={`p-5 mb-6 rounded-2xl border ${bulkSummary.failed > 0 ? "bg-warning/10 border-warning" : "bg-success/10 border-success"}`}>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name={bulkSummary.failed > 0 ? "alert-circle" : "checkmark-circle"} size={24} color={bulkSummary.failed > 0 ? "#F59E0B" : "#10B981"} />
                    <Text className={`text-lg font-bold ml-2 ${isDark ? "text-white" : "text-gray-900"}`}>Processing Complete</Text>
                  </View>
                  <Text className={`text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>Successfully created: {bulkSummary.created}</Text>
                  <Text className={`text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>Failed: {bulkSummary.failed}</Text>

                  <TouchableOpacity onPress={() => { setParsedData([]); setBulkSummary(null); }} className="mt-4 bg-primary/10 self-start px-4 py-2 rounded-lg">
                    <Text className="text-primary font-bold">Upload Another File</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {parsedData.length === 0 ? (
                <TouchableOpacity
                  onPress={pickDocument}
                  activeOpacity={0.8}
                  className={`flex-1 min-h-[300px] justify-center items-center p-8 border-2 border-dashed rounded-3xl ${isDark ? "border-dark-border bg-dark-card" : "border-primary/30 bg-primary/5"}`}
                >
                  <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${isDark ? "bg-primary/20" : "bg-white shadow-sm"}`}>
                    <MaterialCommunityIcons name="file-upload-outline" size={40} color={isDark ? "#4C8DFF" : "#2563EB"} />
                  </View>
                  <Text className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Upload Teacher CSV
                  </Text>
                  <Text className={`text-center mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Tap to browse files. The first row must be headers like fullName, email, department etc.
                  </Text>
                  <View className="bg-primary px-8 py-3 rounded-xl shadow-lg shadow-primary/30">
                    <Text className="text-white font-bold text-base">Select CSV File</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                      Preview ({parsedData.length} records)
                    </Text>
                    <TouchableOpacity onPress={() => setParsedData([])} className="bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                      <Text className="text-red-500 font-bold text-sm">Clear</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="mb-20">
                    {parsedData.map((row, i) => (
                      <Animated.View
                        key={i}
                        entering={FadeInUp.delay(i * 50).springify()}
                        className={`p-4 mb-3 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-border"} shadow-sm`}
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-row items-center flex-1">
                            <View className={`w-2 h-2 rounded-full mr-3 ${row.status === "VALID" ? "bg-success" : "bg-error"}`} />
                            <Text className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                              {row.name || "Unknown"}
                            </Text>
                          </View>
                          {row.designation && (
                            <View className={`px-2 py-1 rounded bg-gray-100 dark:bg-gray-800`}>
                              <Text className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>{row.designation}</Text>
                            </View>
                          )}
                        </View>

                        <Text className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {row.email || "No Email"} • {row.department || "No Dept"}
                        </Text>

                        {row.error && (
                          <View className="mt-2 flex-row items-center">
                            <Ionicons name="warning" size={14} color="#EF4444" />
                            <Text className="text-xs text-error ml-1 font-medium">{row.error}</Text>
                          </View>
                        )}
                      </Animated.View>
                    ))}
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* Bulk Floater Button */}
        {mode === "bulk" && parsedData.length > 0 && !bulkSummary && (
          <Animated.View entering={SlideInDown} className="absolute bottom-6 left-6 right-6">
            <TouchableOpacity
              onPress={processBulk}
              disabled={bulkProcessing}
              className={`py-4 rounded-2xl items-center shadow-xl shadow-primary/30 ${bulkProcessing ? "bg-primary/70" : "bg-primary"}`}
            >
              {bulkProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Process {parsedData.filter(d => d.status === "VALID").length} Valid Rows
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </KeyboardAvoidingView>

      <InviteSuccessModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          goBack();
        }}
        inviteLink={inviteLink}
        email={createdEmail}
      />
    </View>
  );
}
