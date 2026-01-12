import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function AssignmentsIndex() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchAssignments } = useAssignments();

    useEffect(() => {
        if (institutionId) fetchAssignments(institutionId);
    }, [institutionId]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(admin)/assignments/${item.$id}`)}
            className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
        >
            <View>
                <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.teacher?.name || "Unknown Teacher"}
                </Text>
                <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {item.subject?.name || "No Subject"} ({item.subject?.code})
                </Text>
                <Text className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Class: Year {item.class?.year} - {item.class?.division}
                </Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#6B7280" : "#9CA3AF"}
            />
        </TouchableOpacity>
    );

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader
                title="Teacher Assignments"
                rightAction={
                    <TouchableOpacity
                        onPress={() => router.push("/(admin)/assignments/create")}
                        className="bg-blue-600 p-2 rounded-full"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    ListEmptyComponent={
                        <Text className={`text-center mt-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            No assignments found.
                        </Text>
                    }
                />
            )}
        </View>
    );
}
