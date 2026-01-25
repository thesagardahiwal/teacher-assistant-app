import { InviteSuccessModal } from "@/components/admin/modals/InviteSuccessModal";
import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { studentService } from "@/services";
import { useClasses } from "@/store/hooks/useClasses";
import { useCourses } from "@/store/hooks/useCourses";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { showAlert } from "@/utils/alert";
import { getInviteLink } from "@/utils/linking";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ParsedStudent {
  name: string;
  email: string;
  rollNumber: string;
  seatNumber?: string;
  PRN?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  status: "VALID" | "INVALID";
  error?: string;
}

import ModeSwitcher from "@/components/common/ModeSwitcher";
import { useAcademicYears } from "@/store/hooks/useAcademicYears";

export default function CreateStudent() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();

  const { data: courses, fetchCourses } = useCourses();
  const { data: classes, fetchClasses } = useClasses();
  const { data: academicYears, fetchAcademicYears } = useAcademicYears();
  const { fetchStudents } = useStudents();

  // Mode Selection
  const [mode, setMode] = useState<"manual" | "bulk">("bulk");

  /* ---------- SHARED STATE (Course/Class Selection) ---------- */
  // Course/Class selection is required for BOTH manual and bulk
  const [course, setCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  /* ---------- MANUAL FORM STATE ---------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roll, setRoll] = useState("");
  // New Fields
  const [seatNumber, setSeatNumber] = useState("");
  const [prn, setPrn] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  /* ---------- BULK UPLOAD STATE ---------- */
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<{ created: number; failed: number } | null>(null);

  useEffect(() => {
    if (institutionId) {
      fetchCourses(institutionId);
      fetchClasses(institutionId);
      fetchAcademicYears(institutionId);
    }
  }, [institutionId]);

  // Dependency Blocker
  const missingDependency = useMemo(() => {
    if (academicYears.length === 0) return "Academic Year";
    if (courses.length === 0) return "Course";
    if (classes.length === 0) return "Class";
    return null;
  }, [academicYears, courses, classes]);

  const handleManualSubmit = async () => {
    if (!name || !email || !roll || !course || !selectedClass || !institutionId) {
      showAlert("Error", "Please fill in all required fields (Name, Email, Roll No, Course, Class)");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Create Student (Account creation is handled in the service via Invitation)
      const { invitation } = await studentService.create({
        name: name.trim(),
        email: email.trim(),
        rollNumber: roll.trim(),
        course,
        class: selectedClass,
        institution: institutionId,
        isActive: true,
        currentYear: 1, // Defaulting to 1st year for now, or derive from Class Year
        // Extended fields
        seatNumber: seatNumber.trim() || undefined,
        PRN: prn.trim() || undefined,
        bloodGroup: bloodGroup.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      await fetchStudents(institutionId);

      setInviteLink(getInviteLink(invitation.token));
      setModalVisible(true);

    } catch (error: any) {
      showAlert("Error", error.message || "Failed to create student (invitation)");
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
    const rows = content.split(/\r?\n/).filter(r => r.trim());
    if (rows.length < 2) {
      showAlert("Error", "CSV is empty or missing headers");
      return;
    }

    const headers = rows[0].split(",").map(h => h.trim().toLowerCase());

    // Mapping keys
    const mapIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h.includes("name")) mapIndex["name"] = i;
      else if (h.includes("email")) mapIndex["email"] = i;
      else if (h.includes("roll")) mapIndex["rollNumber"] = i;
      else if (h.includes("seat")) mapIndex["seatNumber"] = i;
      else if (h.includes("PRN")) mapIndex["PRN"] = i;
      else if (h.includes("blood")) mapIndex["bloodGroup"] = i;
      else if (h.includes("phone")) mapIndex["phone"] = i;
      else if (h.includes("address")) mapIndex["address"] = i;
    });

    if (mapIndex["name"] === undefined || mapIndex["email"] === undefined || mapIndex["rollNumber"] === undefined) {
      showAlert("Error", "CSV must contain columns: 'fullName', 'email', 'rollNumber'");
      return;
    }

    const parsed: ParsedStudent[] = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(",").map(c => c.trim());
      // Pad
      while (cols.length < headers.length) cols.push("");

      const p: any = {};
      p.name = cols[mapIndex["name"]] || "";
      p.email = cols[mapIndex["email"]] || "";
      p.rollNumber = cols[mapIndex["rollNumber"]] || "";

      if (mapIndex["seatNumber"] !== undefined) p.seatNumber = cols[mapIndex["seatNumber"]];
      if (mapIndex["PRN"] !== undefined) p.PRN = cols[mapIndex["PRN"]];
      if (mapIndex["bloodGroup"] !== undefined) p.bloodGroup = cols[mapIndex["bloodGroup"]];
      if (mapIndex["phone"] !== undefined) p.phone = cols[mapIndex["phone"]];
      if (mapIndex["address"] !== undefined) p.address = cols[mapIndex["address"]];

      // Validate
      let error = undefined;
      let status: "VALID" | "INVALID" = "VALID";

      if (!p.name) { status = "INVALID"; error = "Missing Name"; }
      else if (!p.email) { status = "INVALID"; error = "Missing Email"; }
      else if (!p.rollNumber) { status = "INVALID"; error = "Missing Roll No"; }
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
    // Pre-check
    if (!course || !selectedClass) {
      showAlert("Error", "Please select a Course and Class first.");
      return;
    }
    if (!institutionId) {
      showAlert("Error", "Institution Context missing.");
      return;
    }

    const validRows = parsedData.filter(d => d.status === "VALID");
    if (validRows.length === 0) {
      showAlert("Error", "No valid rows to process");
      return;
    }

    setBulkProcessing(true);
    let created = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        await studentService.create({
          name: row.name,
          email: row.email,
          rollNumber: row.rollNumber,
          course,
          class: selectedClass,
          institution: institutionId,
          isActive: false,
          currentYear: 1, // Logic for year?
          seatNumber: row.seatNumber,
          PRN: row.PRN,
          bloodGroup: row.bloodGroup,
          phone: row.phone,
          address: row.address
        });
        created++;
      } catch (e) {
        console.error("Bulk student create failed for " + row.email, e);
        failed++;
      }
    }

    await fetchStudents(institutionId);
    setBulkSummary({ created, failed });
    setBulkProcessing(false);
  };

  const courseOptions = courses.map(c => ({ label: `${c.name} (${c.code})`, value: c.$id }));

  // Filter classes: Matching Course AND Current Academic Year
  const classOptions = classes
    .filter(c => {
      // match course
      if (c.course?.$id !== course) return false;

      // match current academic year
      // We need to check if c.academicYear is current.
      // Assuming c.academicYear is an object with isCurrent
      // OR we cross reference with our academicYears list which has accurate isCurrent status
      const ayId = typeof c.academicYear === 'string' ? c.academicYear : c.academicYear?.$id;
      const ay = academicYears.find(y => y.$id === ayId);
      return ay?.isCurrent;
    })
    .map(c => ({ label: `Year ${c.academicYear?.label || ''} - ${c.name}`, value: c.$id }));

  /* ---------- RENDER HELPERS ---------- */

  if (missingDependency) {
    return (
      <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <PageHeader title="New Student" />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="alert-circle-outline" size={64} color={isDark ? "#9CA3AF" : "#6B7280"} />
          <Text className={`text-xl font-bold mt-4 text-center ${isDark ? "text-white" : "text-gray-900"}`}>
            Setup Required
          </Text>
          <Text className={`text-base text-center mt-2 mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Please create a {missingDependency} first.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderSharedSelectors = () => (
    <View className={`p-4 rounded-2xl mb-4 ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <Text className={`text-sm font-bold mb-2 uppercase text-gray-500`}>Assignment</Text>
      <FormSelect
        label="Course *"
        value={course}
        onChange={(v) => { setCourse(v); setSelectedClass(""); }} // Reset class on course change
        options={courseOptions}
        placeholder="Select Course"
      />

      <FormSelect
        label="Class *"
        value={selectedClass}
        onChange={setSelectedClass}
        options={classOptions}
        placeholder="Select Class"
        error={course && classOptions.length === 0 ? "No classes found for this course" : undefined}
      />

      {/* Validation: Check if selected class is from OLD Academic Year? 
              Ideally we filter classOptions above to only show Current Academic Year classes?
              Let's allow all but warn? Or strictly filter.
              User Goal: "Students must always belong to a class... Classes must always belong to CURRENT academic year"
              So filtering options is best.
           */}
    </View>
  );

  const renderManualForm = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {renderSharedSelectors()}

      <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>
        <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Student Details
        </Text>

        <FormInput
          label="Full Name *"
          placeholder="Student Name"
          value={name}
          onChangeText={setName}
        />

        <FormInput
          label="Email Address *"
          placeholder="student@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View className="flex-row gap-4">
          <View className="flex-1">
            <FormInput
              label="Roll Number *"
              placeholder="101"
              value={roll}
              onChangeText={setRoll}
            />
          </View>
          <View className="flex-1">
            <FormInput
              label="Seat No."
              placeholder="Exam Seat No"
              value={seatNumber}
              onChangeText={setSeatNumber}
            />
          </View>
        </View>

        <FormInput
          label="PRN / Reg No"
          placeholder="Permanent Reg No"
          value={prn}
          onChangeText={setPrn}
        />

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
          <Text className="text-white font-bold text-lg">Send Invitation</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBulkUpload = () => (
    <View className="flex-1">
      {renderSharedSelectors()}

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
            Upload Student CSV
          </Text>
          <Text className={`text-center mb-6 pl-4 pr-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Headers required: fullName, email, rollNumber
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
                    {row.rollNumber} | {row.email}
                  </Text>
                  {row.error && (
                    <Text className="text-xs text-red-500 mt-0.5">{row.error}</Text>
                  )}
                </View>
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
      <PageHeader title="New Student" />

      {/* Mode Switcher */}
      <ModeSwitcher mode={mode} setMode={setMode} isDark={isDark} />

      {/* Content */}
      {mode.includes("manual") ? renderManualForm() : renderBulkUpload()}

      <InviteSuccessModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          router.back();
        }}
        inviteLink={inviteLink}
        email={email} // For manual only
      />
    </View>
  );
}
