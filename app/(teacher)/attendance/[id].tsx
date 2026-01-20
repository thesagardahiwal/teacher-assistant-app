import { PageHeader } from "@/components/admin/ui/PageHeader";
import { attendanceService } from "@/services/attendance.service";
import { attendanceRecordService } from "@/services/attendanceRecord.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Attendance, AttendanceRecord } from "@/types";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function AttendanceDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const [attendance, setAttendance] = useState<Attendance | null>(null);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [originalRecords, setOriginalRecords] = useState<AttendanceRecord[]>([]); // To check for changes
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Track local changes: RecordID -> boolean (present/absent)
    const [changes, setChanges] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const att = await attendanceService.get(id as string);
            setAttendance(att);

            const recs = await attendanceRecordService.listByAttendance(id as string);
            const sortedRecs = recs.documents.sort((a, b) =>
                (a.student?.name || "").localeCompare(b.student?.name || "")
            );

            setRecords(sortedRecs);
            setOriginalRecords(sortedRecs);
        } catch (error) {
            Alert.alert("Error", "Failed to load attendance details");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const toggleAttendance = (recordId: string, currentStatus: boolean) => {
        setChanges(prev => {
            const newState = { ...prev };
            // If the new status is same as original, remove from changes
            const originalRecord = originalRecords.find(r => r.$id === recordId);
            const originalStatus = originalRecord?.present;

            if (currentStatus === originalStatus) {
                delete newState[recordId];
            } else {
                newState[recordId] = currentStatus;
            }
            return newState;
        });

        // Optimistically update UI list
        setRecords(prev => prev.map(r =>
            r.$id === recordId ? { ...r, present: currentStatus } : r
        ));
    };

    const hasChanges = Object.keys(changes).length > 0;

    const handleSave = async () => {
        if (!hasChanges) return;

        Alert.alert(
            "Confirm Save",
            `Are you sure you want to update attendance for ${Object.keys(changes).length} student(s)?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: async () => {
                        setSaving(true);
                        try {
                            const updates = Object.entries(changes).map(([recordId, present]) =>
                                attendanceRecordService.update(recordId, { present })
                            );
                            await Promise.all(updates);

                            Alert.alert("Success", "Attendance updated successfully");
                            setChanges({});

                            // Reload to sync state
                            await loadData();
                        } catch (error) {
                            Alert.alert("Error", "Failed to save changes");
                            // Revert UI to original if needed, but reloading is safer
                            loadData();
                        } finally {
                            setSaving(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!attendance) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <Text className={isDark ? "text-gray-400" : "text-gray-500"}>Attendance not found</Text>
            </View>
        );
    }

    // Role check: User requested to allow toggling without permission restrictions
    const canEdit = true;

    const presentCount = records.filter(r => r.present).length;
    const totalCount = records.length;

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className={`px-5 pt-4 ${isDark ? "bg-gray-900" : "bg-white"} border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
                <PageHeader title="Attendance Details" showBack={true} />

                <View className="mb-4">
                    <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {attendance.class?.name} • {attendance.subject?.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {new Date(attendance.date).toLocaleDateString()}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-4">
                        <View>
                            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Present</Text>
                            <Text className="text-lg font-bold text-green-600">{presentCount}</Text>
                        </View>
                        <View>
                            <Text className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Absent</Text>
                            <Text className="text-lg font-bold text-red-600">{totalCount - presentCount}</Text>
                        </View>
                    </View>
                    <View className={`bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full`}>
                        <Text className={`text-xs font-bold ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                            Total: {totalCount}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {records.map((record) => (
                    <View
                        key={record.$id}
                        className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${record.present ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
                                <Text className={`font-bold ${record.present ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                                    {record.student?.name?.charAt(0)}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {record.student?.name}
                                </Text>
                                <Text className={`text-xs ${record.present ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                    {record.present ? "Present" : "Absent"}
                                </Text>
                            </View>
                        </View>

                        {canEdit && (
                            <Switch
                                testID={`switch-${record.$id}`}
                                value={record.present}
                                onValueChange={(val) => toggleAttendance(record.$id, val)}
                                trackColor={{ false: "#EF4444", true: "#22C55E" }}
                                thumbColor={"#FFFFFF"}
                            />
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Sticky Footer */}
            {canEdit && hasChanges && (
                <View className={`absolute bottom-0 left-0 right-0 p-5 border-t ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => loadData()} // Reset
                            disabled={saving}
                            className={`flex-1 py-4 rounded-xl items-center border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"}`}
                        >
                            <Text className={`font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className={`flex-1 py-4 rounded-xl items-center ${saving ? "bg-blue-400" : "bg-blue-600"}`}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
