import { PageHeader } from "@/components/admin/ui/PageHeader";
import WebTakeAttendance from "@/components/web/WebTakeAttendance";
import { GeminiAttendanceResult } from "@/services/ai/gemini.service";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AttendanceReviewModal from "../../../components/Attendance/AttendanceReviewModal";
import { StudentAttendanceCard } from "../../../components/directory/StudentAttendanceCard";
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useTheme();

  if (Platform.OS === 'web') {
    return <WebTakeAttendance />;
  }

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

  const onScheduleAdded = () => {
    fetchActiveSchedules();
  };

  const renderStudentItem = ({ item, index }: { item: Student; index: number }) => {
    const isPresent = studentStatus[item.$id];
    return (
      <StudentAttendanceCard
        student={item}
        isPresent={isPresent}
        onToggle={() => toggleStatus(item.$id)}
        mode="selection"
        index={index}
        onLongPress={() => handleLongPress(item)}
      />
    );
  };

  return (
    <TeacherEligibilityGuard>
      <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
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
        <View className="px-6 pt-6 pb-2">
          <PageHeader
            title="Take Attendance"
            subtitle={activeSchedules.length > 0 ? "Select a class to begin" : "No active classes available"}
            rightAction={
              <TouchableOpacity
                onPress={handleScan}
                disabled={!selectedClassId || scanning}
                className={`p-3 rounded-full ${isDark ? "bg-gray-800" : "bg-white shadow-sm border border-gray-100"}`}
              >
                {scanning ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons name="camera-outline" size={22} color={!selectedClassId ? (isDark ? "#4B5563" : "#9CA3AF") : (isDark ? "#E5E7EB" : "#1F2937")} />
                )}
              </TouchableOpacity>
            }
          />
        </View>

        <View className="flex-1 px-4 mb-20">
          {/* Class Selector */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className={`text-xs font-bold ml-1 tracking-wider uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Active Sessions
              </Text>
              <TouchableOpacity
                onPress={() => setScheduleModalVisible(true)}
                className={`py-1.5 px-3 rounded-lg flex-row items-center ${isDark ? "bg-blue-900/40 border border-blue-700/50" : "bg-blue-50 border border-blue-100"}`}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={14} color={isDark ? "#60A5FA" : "#2563EB"} style={{ marginRight: 2 }} />
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>

            <View className="h-28 mb-4">
              {loadingSchedules ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="small" color="#2563EB" />
                </View>
              ) : activeSchedules.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {activeSchedules.map((schedule, index) => {
                    const isSelected = selectedClassId === schedule.class.$id;
                    return (
                      <Animated.View key={schedule.$id} entering={FadeInDown.delay(100 + index * 50).springify()}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedClassId(schedule.class.$id);
                            setSelectedSubjectId(schedule.subject.$id);
                          }}
                          activeOpacity={0.7}
                          className={`mr-3 p-4 rounded-3xl border w-48 justify-between h-24 shadow-sm ${isSelected
                            ? (isDark ? "bg-blue-600 border-blue-500" : "bg-blue-600 border-blue-500 shadow-blue-200")
                            : (isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100")
                            }`}
                        >
                          <View>
                            <Text className={`font-bold text-lg leading-tight ${isSelected ? "text-white" : (isDark ? "text-white" : "text-gray-900")}`} numberOfLines={1}>
                              {schedule.class.name}
                            </Text>
                            <Text className={`text-sm mt-0.5 ${isSelected ? "text-blue-100" : (isDark ? "text-gray-400" : "text-gray-500")}`} numberOfLines={1}>
                              {schedule.subject.name}
                            </Text>
                          </View>

                          <View className="flex-row items-center justify-between mt-2">
                            <View className={`px-2 py-0.5 rounded-md ${isSelected ? "bg-blue-500/50" : (isDark ? "bg-gray-700" : "bg-gray-100")}`}>
                              <Text className={`text-[10px] font-bold ${isSelected ? "text-white" : (isDark ? "text-gray-300" : "text-gray-600")}`}>
                                {schedule.startTime}
                              </Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={18} color={isSelected ? "white" : "transparent"} />
                          </View>
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              ) : (
                <View className="flex-row items-center justify-center h-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                  <Text className={`ml-2 text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    No active sessions found
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {selectedClassId ? (
            <Animated.View entering={FadeInUp.delay(200).springify()} className="flex-1">
              <View className="flex-row justify-between items-center mb-3 px-1">
                <Text className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  STUDENTS ({filteredStudents.length})
                </Text>
                <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <Text className={`text-xs mr-3 font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>Present</Text>
                  <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  <Text className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>Absent</Text>
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
                  <View className="items-center justify-center py-20 opacity-50">
                    <Ionicons name="people-outline" size={48} color={isDark ? "white" : "black"} />
                    <Text className={`mt-4 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>No students enrolled in this class.</Text>
                  </View>
                }
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.delay(200).springify()} className="flex-1 flex items-center justify-center -mt-20">
              <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm ${isDark ? "bg-gray-800" : "bg-white"}`}>
                <MaterialCommunityIcons name="gesture-tap" size={40} color={isDark ? "#60A5FA" : "#3B82F6"} />
              </View>
              <Text className={`text-lg font-bold text-center mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Select a Class
              </Text>
              <Text className={`text-center px-10 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                Choose an active session from the list above to start marking attendance.
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Submit Button */}
        {selectedClassId && (
          <Animated.View
            entering={FadeInDown.springify().delay(200)}
            className="absolute left-6 right-6"
            style={{ bottom: insets.bottom + 90 }}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-blue-500/30 ${submitting ? "bg-blue-500" : "bg-blue-600"}`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="white" className="mr-2" />
              ) : (
                <Ionicons name="checkmark-done-circle" size={24} color="white" className="mr-2" />
              )}
              <Text className="text-white font-bold text-lg ml-2">
                {submitting ? "Submitting..." : `Submit Attendance`}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </TeacherEligibilityGuard>
  );
}
