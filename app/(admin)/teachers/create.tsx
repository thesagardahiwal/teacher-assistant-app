import { InviteSuccessModal } from "@/components/admin/modals/InviteSuccessModal";
import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { teacherService } from "@/services";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { getInviteLink } from "@/utils/linking";
import { useInstitutionId } from "@/utils/useInstitutionId";
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

  /* ---------- MANUAL FORM STATE ---------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Additional fields
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  /* ---------- BULK UPLOAD STATE ---------- */
  const [parsedData, setParsedData] = useState<ParsedTeacher[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<{ created: number; failed: number } | null>(null);

  const handleManualSubmit = async () => {
    // 1. Validation
    if (!name.trim()) {
      showAlert("Error", "Full Name is required");
      return;
    }
    if (!email.trim()) {
      showAlert("Error", "Email Address is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert("Error", "Please enter a valid email address");
      return;
    }
    if (!institutionId) {
      showAlert("Error", "Institution ID missing. Please relogin.");
      return;
    }

    setLoading(true);
    try {
      const { invitation } = await teacherService.create({
        name: name.trim(),
        email: email.trim(),
        institution: institutionId,
        role: "TEACHER",
        // Extended fields
        department: department.trim() || undefined,
        designation: designation.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        bloodGroup: bloodGroup.trim() || undefined,
      });

      await fetchTeachers(institutionId);

      setInviteLink(getInviteLink(invitation.token));
      setModalVisible(true);

      // Reset form on success (optional, but keep modal open first)
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
        // On web, we might need to fetch the blob or use FileReader if uri is blob:
        // DocumentPicker on Expo Web returns a File object usually but wrapper might differ
        // Expo Document Picker web implementation usually returns a Blob URI.
        // Fetching it is the easiest way.
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
    const required = ["fullname", "email"]; // Mapping keys below

    // Check basic headers presence (fuzzy match)
    // We expect headers: fullName, email, designation, department, phone, address, bloodGroup
    // Let's assume order doesn't matter, we map by index.

    const mapIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h.includes("name")) mapIndex["name"] = i;
      else if (h.includes("email")) mapIndex["email"] = i;
      else if (h.includes("department")) mapIndex["department"] = i;
      else if (h.includes("designation")) mapIndex["designation"] = i;
      else if (h.includes("phone")) mapIndex["phone"] = i;
      else if (h.includes("address")) mapIndex["address"] = i;
      else if (h.includes("bloodGroup")) mapIndex["bloodGroup"] = i;
    });

    if (mapIndex["name"] === undefined || mapIndex["email"] === undefined) {
      showAlert("Error", "CSV must contain 'fullName' and 'email' columns");
      return;
    }

    const parsed: ParsedTeacher[] = [];

    for (let i = 1; i < rows.length; i++) {
      // Handle CSV quotes if simple splitting fails? 
      // For now simple split as per strict constraints timeboxed.
      // If row has commas inside values, this simple split breaks. 
      // But implementing full CSV regex parser is heavy. Assuming standard simple CSV.
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
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) { status = "INVALID"; error = "Invalid Email"; }

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

    // Clean up parsed data partially or keep for review?
    // Requirement says "Show final summary". We show it.
  };

  /* ---------- RENDER HELPERS ---------- */

  const renderManualForm = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Teacher Details
        </Text>

        <FormInput
          label="Full Name *"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        <FormInput
          label="Email Address *"
          placeholder="john@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <FormInput
              label="Department"
              placeholder="Science"
              value={department}
              onChangeText={setDepartment}
            />
          </View>
          <View className="flex-1">
            <FormInput
              label="Designation"
              placeholder="Senior Teacher"
              value={designation}
              onChangeText={setDesignation}
            />
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1">
            <FormInput
              label="Phone"
              placeholder="+91..."
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View className="w-1/3">
            <FormInput
              label="Blood Group"
              placeholder="O+"
              value={bloodGroup}
              onChangeText={setBloodGroup}
            />
          </View>
        </View>

        <FormInput
          label="Address"
          placeholder="Enter address..."
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />

      </View>

      <TouchableOpacity
        onPress={handleManualSubmit}
        disabled={loading}
        className={`py-4 rounded-xl items-center mb-10 ${loading ? "bg-blue-400" : "bg-blue-600"
          }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Create & Invite</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBulkUpload = () => (
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

          <ScrollView className={`flex-1 rounded-xl border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
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
          </ScrollView>

          <TouchableOpacity
            onPress={processBulk}
            disabled={bulkProcessing || bulkSummary !== null}
            className={`mt-4 py-4 rounded-xl items-center ${bulkProcessing ? "bg-blue-400" : "bg-blue-600"}`}
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
  );

  return (
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <PageHeader title="Add Teacher" />

      {/* Mode Switcher */}
      <View className="flex-row mb-6 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
        <TouchableOpacity
          onPress={() => setMode("manual")}
          className={`flex-1 py-2 items-center rounded-lg ${mode === "manual" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
        >
          <Text className={`font-semibold ${mode === "manual" ? (isDark ? "text-white" : "text-gray-900") : "text-gray-500"}`}>
            Manual Entry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode("bulk")}
          className={`flex-1 py-2 items-center rounded-lg ${mode === "bulk" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`}
        >
          <Text className={`font-semibold ${mode === "bulk" ? (isDark ? "text-white" : "text-gray-900") : "text-gray-500"}`}>
            Bulk Upload
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {mode === "manual" ? renderManualForm() : renderBulkUpload()}

      <InviteSuccessModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.back(); // Or stay on page if manual/bulk flow differs? 
          // For manual, typically go back. For bulk, maybe stay?
          // Keeping behavior same for manual.
        }}
        inviteLink={inviteLink}
        email={email} // This is manual email only. For bulk, we show summary inline.
      />
    </View>
  );
}
