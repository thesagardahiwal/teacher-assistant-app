import { PageHeader } from "@/components/admin/ui/PageHeader";
import { academicYearService } from "@/services/academicYear.service";
import { attendanceRecordService } from "@/services/attendanceRecord.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { AttendanceRecord } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ResponsiveContainer } from "../ui/ResponsiveContainer";

const WebStatBox = ({ label, value, color, icon, delay }: any) => {
    const { isDark } = useTheme();
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).springify()}
            className={`flex-1 min-w-[200px] p-5 rounded-2xl ${isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border border-slate-200 shadow-sm"}`}
        >
            <View className={`w-12 h-12 rounded-xl ${color} items-center justify-center mb-4`}>
                <Ionicons name={icon} size={24} color="white" />
            </View>
            <Text className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{value}</Text>
            <Text className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</Text>
        </Animated.View>
    )
}

const WebStudentAttendance = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
    const [filter, setFilter] = useState<'All' | 'Present' | 'Absent'>('All');

    const fetchAttendance = async () => {
        try {
            if (!user?.$id) return;

            const institutionId = typeof user.institution === 'string' ? user.institution : user.institution.$id;
            const yearsRes = await academicYearService.list(institutionId);
            const currentYear = yearsRes.documents.find(y => y.isCurrent);

            const res = await attendanceRecordService.listByStudent(user.$id);

            // Filter by Current Academic Year
            const allRecords = res.documents.filter(r => {
                if (!currentYear) return true;
                const rYear = r.attendance?.class?.academicYear;
                const rYearId = typeof rYear === 'string' ? rYear : rYear?.$id;
                return rYearId === currentYear.$id;
            });

            // Sort by date desc
            allRecords.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());

            setRecords(allRecords);
            setStats({
                present: allRecords.filter(r => r.present).length,
                absent: allRecords.filter(r => !r.present).length,
                total: allRecords.length
            });

        } catch (error) {
            console.error("Failed to fetch student attendance", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [user?.$id]);

    const filteredRecords = useMemo(() => {
        if (filter === 'All') return records;
        return records.filter(r => filter === 'Present' ? r.present : !r.present);
    }, [records, filter]);

    const groupedRecords = useMemo(() => {
        const groups: Record<string, AttendanceRecord[]> = {};
        filteredRecords.forEach(record => {
            const date = new Date(record.$createdAt);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(record);
        });
        return groups;
    }, [filteredRecords]);

    if (loading) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-slate-50"}`}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 50 }}>
                <ResponsiveContainer className="p-8">
                    {/* Header */}
                    <View className="mb-8 w-full">
                        <PageHeader title="Attendance History" subtitle="Track your daily attendance" />
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row flex-wrap gap-6 mb-10 w-full">
                        <WebStatBox label="Total Classes" value={stats.total} color="bg-blue-500" icon="list" delay={100} />
                        <WebStatBox label="Present" value={stats.present} color="bg-emerald-500" icon="checkmark" delay={200} />
                        <WebStatBox label="Absent" value={stats.absent} color="bg-red-500" icon="close" delay={300} />
                    </View>

                    {/* Filters */}
                    <View className="flex-row mb-6 w-full">
                        {(['All', 'Present', 'Absent'] as const).map((opt) => (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => setFilter(opt)}
                                className={`px-5 py-2 rounded-full mr-3 border ${filter === opt
                                    ? "bg-blue-600 border-blue-600"
                                    : (isDark ? "bg-transparent border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-600")
                                    }`}
                            >
                                <Text className={`font-semibold ${filter === opt ? "text-white" : (isDark ? "text-slate-400" : "text-slate-600")}`}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* List Content */}
                    <View className="w-full">
                        {Object.keys(groupedRecords).length > 0 ? (
                            Object.entries(groupedRecords).map(([month, monthRecords], sectionIndex) => (
                                <View key={month} className="mb-8 w-full">
                                    <Text className={`text-lg font-bold mb-4 ml-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                        {month}
                                    </Text>

                                    <View className={`rounded-xl overflow-hidden border w-full ${isDark ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200"}`}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
                                            <View className="min-w-[600px] w-full">
                                                {/* Table Header */}
                                                <View className={`flex-row px-6 py-3 border-b ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"}`}>
                                                    <Text className={`w-24 font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Status</Text>
                                                    <Text className={`flex-[2] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Subject</Text>
                                                    <Text className={`flex-1 font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Date</Text>
                                                    <Text className={`flex-1 font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Teacher</Text>
                                                </View>

                                                {/* Rows */}
                                                {monthRecords.map((item) => (
                                                    <View
                                                        key={item.$id}
                                                        className={`flex-row px-6 py-4 items-center border-b last:border-0 ${isDark ? "border-slate-700 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}
                                                    >
                                                        <View className="w-24">
                                                            <View className={`self-start px-3 py-1 rounded-full ${item.present ? "bg-emerald-100 dark:bg-emerald-500/10" : "bg-red-100 dark:bg-red-500/10"}`}>
                                                                <Text className={`text-xs font-semibold ${item.present ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                                                                    {item.present ? "Present" : "Absent"}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <Text className={`flex-[2] font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                                                            {item.attendance?.subject?.name || "-"}
                                                        </Text>
                                                        <Text className={`flex-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                            {new Date(item.$createdAt).toLocaleDateString()}
                                                        </Text>
                                                        <Text className={`flex-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                            {typeof item.attendance?.teacher === 'object' ? item.attendance.teacher.name : "-"}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="py-20 items-center justify-center w-full">
                                <Ionicons name="filter-outline" size={48} color={isDark ? "#475569" : "#cbd5e1"} />
                                <Text className={`mt-4 ${isDark ? "text-slate-500" : "text-slate-400"}`}>No records found for this filter</Text>
                            </View>
                        )}
                    </View>
                </ResponsiveContainer>
            </ScrollView>
        </View>
    );
};

export default WebStudentAttendance;
