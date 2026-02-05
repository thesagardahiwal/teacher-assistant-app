
import { useTheme } from "@/store/hooks/useTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import WebAddScheduleModal from "./WebAddScheduleModal";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

import { attendanceRecordService, attendanceService, scheduleService, studentService } from "@/services";
import { useAuth } from "@/store/hooks/useAuth";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useWindowDimensions } from "react-native";

export default function WebTakeAttendance() {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 768; // Tablet/Mobile breakpoint

    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const [today, setToday] = React.useState("");
    const [currentTime, setCurrentTime] = React.useState("");
    const [modalVisible, setModalVisible] = React.useState(false);

    const [activeSchedules, setActiveSchedules] = React.useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = React.useState(false);

    const [selectedSchedule, setSelectedSchedule] = React.useState<any | null>(null);
    const [students, setStudents] = React.useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = React.useState(false);
    const [attendanceData, setAttendanceData] = React.useState<Record<string, string>>({});
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setToday(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000 * 60);
        return () => clearInterval(interval);
    }, []);

    const fetchActiveSchedules = React.useCallback(async () => {
        if (!user?.$id) return;
        setLoadingSchedules(true);
        try {
            const response = await scheduleService.listByTeacher(user.$id);
            const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const currentDay = days[new Date().getDay()];
            const todaySchedules = response.documents.filter((s: any) =>
                s.dayOfWeek?.substring(0, 3).toUpperCase() === currentDay
            );
            setActiveSchedules(todaySchedules);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSchedules(false);
        }
    }, [user?.$id]);

    React.useEffect(() => {
        fetchActiveSchedules();
    }, [fetchActiveSchedules]);

    React.useEffect(() => {
        if (selectedSchedule?.class?.$id) {
            fetchStudents(selectedSchedule.class.$id);
        }
    }, [selectedSchedule]);

    const fetchStudents = async (classId: string) => {
        if (!institutionId) return;
        setLoadingStudents(true);
        try {
            const response = await studentService.listByClasses(institutionId, [classId]);
            setStudents(response.documents);
            const initialData: Record<string, string> = {};
            response.documents.forEach((s: any) => {
                initialData[s.$id] = "PRESENT";
            });
            setAttendanceData(initialData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const getStatus = (studentId: string) => attendanceData[studentId] || "PRESENT";

    const markAttendance = (studentId: string, status: string) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        if (!selectedSchedule || !user?.$id || !institutionId) return;

        setSubmitting(true);
        try {
            // 1. Create Attendance Session
            const attendance = await attendanceService.create({
                class: selectedSchedule.class.$id as any,
                subject: selectedSchedule.subject.$id as any,
                teacher: user.$id as any,
                institution: institutionId as any,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            });

            // 2. Create Records
            const promises = students.map(student => {
                return attendanceRecordService.create({
                    attendance: attendance.$id as any,
                    student: student.$id as any,
                    present: getStatus(student.$id) === "PRESENT",
                    institution: institutionId as any,
                });
            });

            await Promise.all(promises);

            showAlert("Success", "Attendance submitted successfully!");
            setSelectedSchedule(null); // Reset selection
        } catch (error) {
            console.error("Submission error:", error);
            showAlert("Error", "Failed to submit attendance. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className={`flex-1 ${isSmallScreen ? "flex-col" : "flex-row"} ${isDark ? "bg-[#0f172a]" : "bg-slate-50"}`}>
            {/* Sidebar: Schedule Selection */}
            <View className={`${isSmallScreen ? "w-full border-b max-h-[40%]" : "w-80 border-r h-full"} ${isDark ? "border-slate-800 bg-[#1e293b]" : "border-slate-200 bg-white"}`}>
                <View className="p-6 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                    <View>
                        <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Active Classes
                        </Text>
                        <Text className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {today} • {currentTime}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setModalVisible(true)} className="bg-blue-600 p-2 rounded-lg">
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {loadingSchedules ? (
                    <ActivityIndicator className="mt-10" />
                ) : (
                    <FlatList
                        data={activeSchedules}
                        keyExtractor={(item) => item.$id}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={
                            <View className="items-center py-10">
                                <Text className="text-slate-400 text-center mb-4">No active classes found for now.</Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedSchedule(item)}
                                className={`p-4 rounded-xl mb-3 border ${selectedSchedule?.$id === item.$id
                                    ? "bg-blue-600 border-blue-600"
                                    : isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className={`font-bold text-lg ${selectedSchedule?.$id === item.$id ? "text-white" : isDark ? "text-white" : "text-slate-900"
                                        }`}>
                                        {item.class.name}
                                    </Text>
                                    <View className={`px-2 py-1 rounded text-xs ${selectedSchedule?.$id === item.$id ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30"
                                        }`}>
                                        <Text className={selectedSchedule?.$id === item.$id ? "text-white" : "text-blue-600 dark:text-blue-400"}>
                                            {item.startTime} - {item.endTime}
                                        </Text>
                                    </View>
                                </View>
                                <Text className={selectedSchedule?.$id === item.$id ? "text-blue-100" : "text-slate-500"}>
                                    {item.subject.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {activeSchedules.length === 0 && !loadingSchedules && (
                    <View className="px-4">
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="w-full py-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl items-center flex-row justify-center space-x-2"
                        >
                            <Ionicons name="calendar-outline" size={20} color={isDark ? "#60A5FA" : "#2563EB"} />
                            <Text className="text-blue-600 dark:text-blue-400 font-semibold ml-2">Create Schedule</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Main Content: Student List */}
            <View className="flex-1">
                {selectedSchedule ? (
                    <>
                        <View className={`px-8 py-6 border-b flex-row justify-between items-center ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"}`}>
                            <View>
                                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Mark Attendance
                                </Text>
                                <Text className={`text-slate-500 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {selectedSchedule.class.name} • {selectedSchedule.subject.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={submitting}
                                className={`px-6 py-3 rounded-xl flex-row items-center space-x-2 ${submitting ? "bg-emerald-400" : "bg-emerald-600 hover:bg-emerald-700"
                                    }`}
                            >
                                {submitting && <ActivityIndicator size="small" color="white" className="mr-2" />}
                                <Text className="text-white font-bold">Submit Attendance</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingStudents ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" />
                            </View>
                        ) : (
                            <ScrollView contentContainerStyle={{ padding: 32 }}>
                                <View className="flex-row flex-wrap gap-4">
                                    {students.map((student) => {
                                        const status = getStatus(student.$id);
                                        return (
                                            <TouchableOpacity
                                                key={student.$id}
                                                onPress={() => markAttendance(student.$id, status === "PRESENT" ? "ABSENT" : "PRESENT")}
                                                className={`w-[200px] p-4 rounded-xl border items-center transition-all duration-200 ${status === "PRESENT"
                                                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                                    }`}
                                            >
                                                <Image
                                                    source={{ uri: `https://ui-avatars.com/api/?name=${student.name}` }}
                                                    className="w-16 h-16 rounded-full mb-3"
                                                />
                                                <Text className={`font-bold text-center mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                                                    {student.name}
                                                </Text>
                                                <Text className={`text-xs text-center mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                    {student.rollNumber}
                                                </Text>
                                                <View className={`px-3 py-1 rounded-full ${status === "PRESENT" ? "bg-emerald-200 dark:bg-emerald-800" : "bg-red-200 dark:bg-red-800"
                                                    }`}>
                                                    <Text className={`text-xs font-bold ${status === "PRESENT" ? "text-emerald-800 dark:text-emerald-100" : "text-red-800 dark:text-red-100"
                                                        }`}>
                                                        {status}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        )}
                    </>
                ) : (
                    <View className="flex-1 items-center justify-center opacity-50">
                        <MaterialCommunityIcons name="gesture-tap" size={64} color={isDark ? "#475569" : "#cbd5e1"} />
                        <Text className={`text-xl font-semibold mt-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            Select an active class to start
                        </Text>
                    </View>
                )}
            </View>

            <WebAddScheduleModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={fetchActiveSchedules}
            />
        </View>
    );
}
