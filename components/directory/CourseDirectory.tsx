import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { useCourses } from "@/store/hooks/useCourses";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { CourseCard } from "./CourseCard";

interface CourseDirectoryProps {
    showAddButton?: boolean;
    onItemPress?: (id: string) => void;
    readonly?: boolean;
}

export function CourseDirectory({
    showAddButton = false,
    onItemPress,
    readonly = false
}: CourseDirectoryProps) {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchCourses } = useCourses();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "name",
        order: "asc",
    });

    useEffect(() => {
        if (institutionId) fetchCourses(institutionId);
    }, [institutionId]);

    const onRefresh = React.useCallback(async () => {
        if (institutionId) {
            setRefreshing(true);
            await fetchCourses(institutionId);
            setRefreshing(false);
        }
    }, [institutionId]);

    const filteredData = useMemo(() => {
        if (!data) return [];
        let result = [...data];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.name?.toLowerCase().includes(q) ||
                    c.code?.toLowerCase().includes(q)
            );
        }

        // Sort
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

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2 w-full">
                <PageHeader
                    title="Courses"
                    rightAction={
                        showAddButton ? (
                            <TouchableOpacity
                                onPress={() => router.push("/(admin)/courses/create")}
                                className="bg-blue-600 p-2 rounded-full shadow-sm"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        ) : null
                    }
                />
                <FilterBar
                    onSearch={setSearchQuery}
                    onSortChange={(key, order) => setSortConfig({ key, order })}
                    sortOptions={[
                        { label: "Name", value: "name" },
                        { label: "Code", value: "code" },
                    ]}
                />
            </View>

            {loading && !refreshing && filteredData.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={({ item, index }) => (
                        <CourseCard
                            course={item}
                            index={index}
                            onPress={onItemPress ? () => onItemPress(item.$id) : undefined}
                            readonly={readonly}
                        />
                    )}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="search-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {searchQuery ? "No matching courses found." : "No courses found."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
