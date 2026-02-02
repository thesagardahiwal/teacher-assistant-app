import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TeacherCard } from "@/components/directory/TeacherCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

interface TeacherDirectoryProps {
    showAddButton?: boolean;
    onItemPress: (teacherId: string) => void;
    title?: string;
    subtitle?: string;
}

export function TeacherDirectory({ showAddButton = false, onItemPress, title = "Teachers", subtitle }: TeacherDirectoryProps) {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchTeachers } = useTeachers();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "name",
        order: "asc",
    });

    useEffect(() => {
        if (institutionId) fetchTeachers(institutionId);
    }, [institutionId]);

    const onRefresh = useCallback(async () => {
        if (institutionId) {
            setRefreshing(true);
            await fetchTeachers(institutionId);
            setRefreshing(false);
        }
    }, [institutionId]);

    const filteredData = useMemo(() => {
        let result = [...data];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name?.toLowerCase().includes(q) ||
                    t.email?.toLowerCase().includes(q) ||
                    t.department?.toLowerCase().includes(q)
            );
        }

        result.sort((a: any, b: any) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (!valA) valA = "";
            if (!valB) valB = "";

            if (valA < valB) return sortConfig.order === "asc" ? -1 : 1;
            if (valA > valB) return sortConfig.order === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [data, searchQuery, sortConfig]);

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <TeacherCard
            teacher={item}
            index={index}
            isDark={isDark}
            onPress={() => onItemPress(item.$id)}
        />
    );

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 w-full">
                <PageHeader
                    title={title}
                    subtitle={subtitle}
                    rightAction={
                        showAddButton ? (
                            <TouchableOpacity
                                onPress={() => router.push("/(admin)/teachers/create")}
                                className="bg-primary p-2 rounded-full shadow-lg shadow-primary/30"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        ) : null
                    }
                    showBack={true}
                />

                <FilterBar
                    onSearch={setSearchQuery}
                    onSortChange={(key, order) => setSortConfig({ key, order })}
                    sortOptions={[
                        { label: "Name", value: "name" },
                        { label: "Department", value: "department" },
                        { label: "Designation", value: "designation" },
                    ]}
                />
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    className="w-full flex-1"
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <View className={`w-20 h-20 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"} items-center justify-center mb-4`}>
                                <Ionicons name="people-outline" size={40} color={isDark ? "#6B7280" : "#9CA3AF"} />
                            </View>
                            <Text className={`text-center font-medium ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>
                                {searchQuery ? "No matching teachers found" : "No teachers found nearby"}
                            </Text>
                            <Text className={`text-center text-xs mt-1 ${isDark ? "text-dark-muted" : "text-muted"}`}>
                                {searchQuery ? "Try adjusting your search terms" : "Teachers will appear here once added"}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
