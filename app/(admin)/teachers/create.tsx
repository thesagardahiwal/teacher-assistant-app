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
import { useInstitutionId } from "@/utils/useInstitutionId";
import { validators } from "@/utils/validators";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PageHeader title="Add Teacher" />

      {/* Mode Switcher */}
      <ModeSwitcher mode={mode} setMode={setMode} isDark={isDark} />

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {mode === "manual" ? (
          <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Teacher Details
            </Text>
            <UserProfileForm
              initialData={{}}
              config={AdminTeacherProfileConfig}
              onSubmit={handleManualSubmit}
              loading={loading}
              saving={loading}
            />
          </View>
        ) : (
          <View className="flex-1">
            {/* Summary View */}
            {bulkSummary && (
              <View className={`p-4 mb-4 rounded-xl border ${bulkSummary.failed > 0 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
                <Text className="text-lg font-bold text-gray-900">Processing Complete</Text>
                <Text className="text-gray-700">Successfully created: {bulkSummary.created}</Text>
                <Text className="text-gray-700">Failed: {bulkSummary.failed}</Text>
                <TouchableOpacity onPress={() => { setParsedData([]); setBulkSummary(null); }} className="mt-2">
                  <Text className="text-blue-600 font-semibold">Upload Another File</Text>
                </TouchableOpacity>
              </View>
            )}

            {parsedData.length === 0 ? (
              <View className={`flex-1 justify-center items-center p-6 border-2 border-dashed rounded-xl ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-50"}`}>
                <Ionicons name="cloud-upload-outline" size={48} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`text-lg font-semibold mt-4 mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Upload Teacher CSV
                </Text>
                <Text className={`text-center mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  First row must be headers: fullName, email, department, designation, etc.
                </Text>
                <TouchableOpacity
                  onPress={pickDocument}
                  className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                  <Text className="text-white font-semibold">Select CSV File</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Preview ({parsedData.length} rows)
                  </Text>
                  <TouchableOpacity onPress={() => setParsedData([])}>
                    <Text className="text-red-500 font-medium">Clear</Text>
                  </TouchableOpacity>
                </View>

                <View className={`flex-1 rounded-xl border mb-4 overflow-hidden ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                  {parsedData.map((row, i) => (
                    <View key={i} className={`flex-row p-3 border-b ${isDark ? "border-gray-700" : "border-gray-100"} items-center`}>
                      <View className={`w-2 h-2 rounded-full mr-3 ${row.status === "VALID" ? "bg-green-500" : "bg-red-500"}`} />
                      <View className="flex-1">
                        <Text className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {row.name || "Unknown"}
                        </Text>
                        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {row.email || "No Email"}
                        </Text>
                        {row.error && (
                          <Text className="text-xs text-red-500 mt-0.5">{row.error}</Text>
                        )}
                      </View>
                      <Text className={`text-xs px-2 py-1 rounded ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                        {row.designation || "-"}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={processBulk}
                  disabled={bulkProcessing || bulkSummary !== null}
                  className={`py-4 rounded-xl items-center ${bulkProcessing ? "bg-blue-400" : "bg-blue-600"}`}
                >
                  {bulkProcessing ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      Process {parsedData.filter(d => d.status === "VALID").length} Valid Rows
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <InviteSuccessModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.back();
        }}
        inviteLink={inviteLink}
        email={createdEmail}
      />
    </View>
  );
}
