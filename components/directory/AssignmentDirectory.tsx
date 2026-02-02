import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { TeacherAssignmentCard } from "./TeacherAssignmentCard";

export function AssignmentDirectory() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchAssignments } = useAssignments();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (institutionId) fetchAssignments(institutionId);
    }, [institutionId]);

    const onRefresh = React.useCallback(async () => {
        if (institutionId) {
            setRefreshing(true);
            await fetchAssignments(institutionId);
            setRefreshing(false);
        }
    }, [institutionId]);

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <PageHeader
                title="Teacher Assignments"
                rightAction={
                    <TouchableOpacity
                        onPress={() => router.push("/(admin)/assignments/create")}
                        className="bg-blue-600 p-2 rounded-full shadow-sm"
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            {loading && !refreshing && data.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={({ item, index }) => (
                        <TeacherAssignmentCard
                            assignment={item}
                            index={index}
                            onPress={() => router.push(`/(admin)/assignments/${item.$id}`)}
                            showTeacherName={true}
                        />
                    )}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="document-text-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                No assignments found.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
