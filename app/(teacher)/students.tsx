import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, View } from "react-native";
import { useStudents } from "../../store/hooks/useStudents";
import { useTheme } from "../../store/hooks/useTheme";
import { Student } from "../../types";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function StudentsScreen() {
    const { isDark } = useTheme();
    const { data: students, loading, fetchStudents } = useStudents();
    const institutionId = useInstitutionId();
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (institutionId) {
            fetchStudents(institutionId);
        }
    }, [institutionId]);

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        return students.filter(student =>
            student.user?.name.toLowerCase().includes(search.toLowerCase()) ||
            student.rollNumber.toLowerCase().includes(search.toLowerCase())
        );
    }, [students, search]);

    const renderItem = ({ item }: { item: Student }) => (
        <View className={`flex-row items-center p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}>
            <View className="w-10 h-10 rounded-full bg-indigo-500 items-center justify-center mr-4">
                <Text className="text-white font-bold">{item.user?.name?.charAt(0) || "?"}</Text>
            </View>
            <View className="flex-1">
                <Text className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{item.user?.name}</Text>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>Roll No: {item.rollNumber}</Text>
            </View>
            <View className={`px-2 py-1 rounded-md ${isDark ? "bg-indigo-900/50" : "bg-indigo-50"}`}>
                <Text className="text-indigo-500 font-medium text-xs">{item.class?.division ? `${item.class.year}-${item.class.division}` : "No Class"}</Text>
            </View>
        </View>
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className="px-5 py-4">
                <Text className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Students</Text>

                {/* Search Bar */}
                <View className={`flex-row items-center px-4 py-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-white"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <Ionicons name="search" size={20} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                    <TextInput
                        placeholder="Search students..."
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        className={`flex-1 ml-3 ${isDark ? "text-white" : "text-gray-900"}`}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {loading && filteredStudents.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={filteredStudents}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>No students found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
