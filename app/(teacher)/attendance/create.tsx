import { GeminiAttendanceResult } from "@/services/ai/gemini.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AttendanceReviewModal from "../../../components/Attendance/AttendanceReviewModal";
import AddScheduleModal from "../../../components/Schedule/AddScheduleModal";
import StudentDetailsModal from "../../../components/Student/StudentDetailsModal";
import { TeacherEligibilityGuard } from "../../../components/teacher/TeacherEligibilityGuard";
import { attendanceRecordService, attendanceService, scheduleService } from "../../../services";
import { geminiService } from "../../../services/ai/gemini.service";
import { useAssignments } from "../../../store/hooks/useAssignments";
import { useAuth } from "../../../store/hooks/useAuth";
import { useStudents } from "../../../store/hooks/useStudents";
import { useTheme } from "../../../store/hooks/useTheme";
import { Student } from "../../../types";
import { ClassSchedule } from "../../../types/schedule.type";
import { showAlert } from "../../../utils/alert";
import { useInstitutionId } from "../../../utils/useInstitutionId";

export default function TakeAttendanceScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { user } = useAuth();

  // Data Hooks
  const { data: assignments, fetchAssignments } = useAssignments();
  const { data: allStudents, fetchStudents } = useStudents();

  // State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [studentStatus, setStudentStatus] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeSchedules, setActiveSchedules] = useState<ClassSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // AI State
  const [scanning, setScanning] = useState(false);
  const [aiResult, setAiResult] = useState<GeminiAttendanceResult | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // ... fetchActiveSchedules function (unchanged)
  const fetchActiveSchedules = async () => {
    if (!user?.$id) return;
    setLoadingSchedules(true);
    try {
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const today = days[new Date().getDay()];
      const now = new Date();
      const currentTime = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');

      const res = await scheduleService.listByTeacher(user.$id, today);
      const active = res.documents.filter(schedule => {
        return schedule.startTime <= currentTime && currentTime <= schedule.endTime;
      });
      setActiveSchedules(active);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      showAlert("Error", "Failed to load class schedule");
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchActiveSchedules();
  }, [user]);

  useEffect(() => {
    if (institutionId && user?.$id) {
      if (assignments.length === 0) fetchAssignments(institutionId, user.$id);
      if (allStudents.length === 0) fetchStudents(institutionId);
    }
  }, [institutionId, user?.$id]);

  // Derived Data
  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedAssignment = assignments.find(a => a.class.$id === selectedClassId);
    if (!selectedAssignment) return [];

    return allStudents.filter(s => s.class?.$id === selectedClassId);
  }, [selectedClassId, allStudents, assignments]);

  // Initialize all present
  useEffect(() => {
    const status: Record<string, boolean> = {};
    filteredStudents.forEach(s => {
      status[s.$id] = true; // Default Present
    });
    setStudentStatus(status);
  }, [filteredStudents]);

  const toggleStatus = (studentId: string) => {
    setStudentStatus(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleLongPress = (student: Student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  }

  // AI Scanning Logic
  const handleScan = async () => {
    if (!selectedClassId || filteredStudents.length === 0) {
      showAlert("Notice", "Please select a class with students first.");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      setScanning(true);

      const aiResponse = await geminiService.processAttendanceImage(
        result.assets[0].base64,
        filteredStudents,
        new Date().toISOString().split('T')[0]
      );

      // Match roll numbers to student IDs for local mapping (internal use) if needed, 
      // but the modal returns result by roll number which we then map back.
      // Actually, Review Modal returns status by roll number. 
      // We need to map that back to student IDs here onApply.

      setAiResult(aiResponse);
      setReviewModalVisible(true);

    } catch (error: any) {
      showAlert("AI Error", error.message || "Failed to process image.");
    } finally {
      setScanning(false);
    }
  };

  const handleAiApply = (aiStatusByRoll: Record<string, boolean>) => {
    setStudentStatus(prev => {
      const next = { ...prev };
      filteredStudents.forEach(student => {
        if (aiStatusByRoll[student.rollNumber] !== undefined) {
          next[student.$id] = aiStatusByRoll[student.rollNumber];
        }
      });
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!selectedClassId || !institutionId || !user) {
      showAlert("Error", "Missing information to submit attendance");
      return;
    }

    const selectedAssignment = assignments.find(a => a.class.$id === selectedClassId);
    if (!selectedAssignment) return;

    setSubmitting(true);

    try {
      const attendance = await attendanceService.create({
        class: selectedClassId as any,
        subject: selectedAssignment.subject.$id as any,
        teacher: user.$id as any,
        institution: institutionId as any,
        date: new Date().toISOString().split('T')[0],
      });

      const promises = filteredStudents.map(student =>
        attendanceRecordService.create({
          attendance: attendance.$id as any,
          student: student.$id as any,
          institution: institutionId as any,
          present: studentStatus[student.$id] ?? false
        })
      );

      await Promise.all(promises);

      showAlert("Success", "Attendance submitted successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (error) {
      showAlert("Error", "Failed to submit attendance");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // ... (render functions renderStudentItem, getDayString etc remain same, just verify they are inside)

  const onScheduleAdded = () => {
    fetchActiveSchedules();
  };

  const getDayString = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const isPresent = studentStatus[item.$id];
    return (
      <TouchableOpacity
        onPress={() => toggleStatus(item.$id)}
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
        className={`flex-row items-center p-3 mb-2 rounded-xl border ${isPresent
          ? (isDark ? "bg-gray-800 border-green-500/30" : "bg-white border-green-200")
          : (isDark ? "bg-gray-800 border-red-500/30" : "bg-red-50 border-red-200")}`}
      >
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isPresent ? "bg-indigo-100 dark:bg-indigo-900" : "bg-red-100 dark:bg-red-900"}`}>
          <Text className={`font-bold ${isPresent ? "text-indigo-600 dark:text-indigo-300" : "text-red-600 dark:text-red-300"}`}>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className={`font-medium text-base ${isDark ? "text-white" : "text-gray-900"} ${!isPresent && "text-red-600 dark:text-red-400"}`}>
            {item.name}
          </Text>
          <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Roll No: {item.rollNumber}</Text>
        </View>
        <View className={`w-8 h-8 rounded-full items-center justify-center ${isPresent ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"}`}>
          <Ionicons
            name={isPresent ? "checkmark" : "close"}
            size={20}
            color={isPresent ? "#16A34A" : "#DC2626"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TeacherEligibilityGuard>
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <AddScheduleModal
          visible={scheduleModalVisible}
          onClose={() => setScheduleModalVisible(false)}
          onSave={onScheduleAdded}
          initialSchedule={null}
        />

        <StudentDetailsModal
          visible={modalVisible}
          student={selectedStudent}
          onClose={() => setModalVisible(false)}
        />

        <AttendanceReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          onApply={handleAiApply}
          aiResult={aiResult}
        />

        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>Take Attendance</Text>
          <TouchableOpacity
            onPress={handleScan}
            disabled={!selectedClassId || scanning}
            className={`p-2 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
          >
            {scanning ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Ionicons name="camera-outline" size={24} color={isDark ? "white" : "black"} />
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-4 py-4 mb-20">

          {/* Class Selector */}
          <Text className={`text-sm font-bold mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>SELECT ACTIVE CLASS</Text>
          <View className="h-24 mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {loadingSchedules ? (
                <ActivityIndicator size="small" color="#2563EB" className="ml-4" />
              ) : activeSchedules.length > 0 ? (
                activeSchedules.map((schedule) => (
                  <TouchableOpacity
                    key={schedule.$id}
                    onPress={() => {
                      setSelectedClassId(schedule.class.$id);
                      setSelectedSubjectId(schedule.subject.$id);
                    }}
                    className={`mr-3 p-4 rounded-xl border w-40 justify-center h-20 ${selectedClassId === schedule.class.$id
                      ? (isDark ? "bg-blue-900 border-blue-500" : "bg-blue-600 border-blue-600")
                      : (isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200")}`}
                  >
                    <Text className={`font-bold text-lg mb-1 ${selectedClassId === schedule.class.$id ? "text-white" : (isDark ? "text-white" : "text-gray-900")}`}>
                      {schedule.class.name ? `${schedule.class.name}` : "N/A"}
                    </Text>
                    <Text className={`${selectedClassId === schedule.class.$id ? "text-blue-200" : (isDark ? "text-gray-400" : "text-gray-500")}`} numberOfLines={1}>
                      {schedule.subject.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={10} color={selectedClassId === schedule.class.$id ? "white" : (isDark ? "#9CA3AF" : "#6B7280")} />
                      <Text className={`text-[10px] ml-1 ${selectedClassId === schedule.class.$id ? "text-blue-100" : (isDark ? "text-gray-400" : "text-gray-500")}`}>
                        {schedule.startTime} - {schedule.endTime}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="flex-row items-center ml-2">
                  <MaterialCommunityIcons name="clock-alert-outline" size={24} color={isDark ? "#9CA3AF" : "#6B7280"} />
                  <Text className={`ml-2 mr-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>No active classes.</Text>
                  <TouchableOpacity
                    onPress={() => setScheduleModalVisible(true)}
                    className={`px-4 py-2 rounded-lg ${isDark ? "bg-blue-900/50 border border-blue-700" : "bg-blue-100"}`}
                  >
                    <Text className="text-blue-600 dark:text-blue-400 font-semibold">Create Schedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>

          {selectedClassId ? (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <Text className={`text-sm font-bold ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  STUDENTS ({filteredStudents.length})
                </Text>
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-green-500 mr-1" />
                  <Text className={`text-xs mr-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Present</Text>
                  <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                  <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Absent</Text>
                </View>
              </View>

              <FlatList
                data={filteredStudents}
                keyExtractor={(item) => item.$id}
                renderItem={renderStudentItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                initialNumToRender={20}
                maxToRenderPerBatch={20}
                windowSize={10}
                ListEmptyComponent={
                  <Text className={`text-center mt-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>No students found in this class</Text>
                }
              />
            </>
          ) : (
            <View className="items-center justify-center py-20">
              <MaterialCommunityIcons name="gesture-tap" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
              <Text className={`mt-4 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {activeSchedules.length > 0 ? "Select a class above to start taking attendance" : "No active classes or create one above"}
              </Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        {selectedClassId && (
          <View className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center ${submitting ? "bg-blue-400" : "bg-blue-600"}`}
            >
              {submitting && <ActivityIndicator size="small" color="white" className="mr-2" />}
              <Text className="text-white font-bold text-lg">
                {submitting ? "Submitting..." : `Submit Attendance`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TeacherEligibilityGuard>
  );
}
