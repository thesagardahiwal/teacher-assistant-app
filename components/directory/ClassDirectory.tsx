import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { useClasses } from "@/store/hooks/useClasses";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { ClassCard } from "./ClassCard";

interface ClassDirectoryProps {
    showAddButton?: boolean;
    onItemPress?: (id: string) => void;
    readonly?: boolean;
    title?: string;
    subtitle?: string;
}

export function ClassDirectory({
    showAddButton = false,
    onItemPress,
    readonly = false,
    title = "Classes",
    subtitle
}: ClassDirectoryProps) {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchClasses } = useClasses();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "year",
        order: "asc",
    });

    useEffect(() => {
        if (institutionId) fetchClasses(institutionId);
    }, [institutionId]);

    const onRefresh = React.useCallback(async () => {
        if (institutionId) {
            setRefreshing(true);
            await fetchClasses(institutionId);
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
                    c.academicYear?.label?.toLowerCase().includes(q) ||
                    c.course?.name?.toLowerCase().includes(q) ||
                    String(c.semester || "").includes(q)
            );
        }

        // Sort
        result.sort((a: any, b: any) => {
            let valA = "";
            let valB = "";

            switch (sortConfig.key) {
                case "year":
                    valA = a.academicYear?.label || "";
                    valB = b.academicYear?.label || "";
                    break;
                case "course":
                    valA = a.course?.name || "";
                    valB = b.course?.name || "";
                    break;
                case "semester":
                    valA = String(a.semester || "");
                    valB = String(b.semester || "");
                    break;
                default:
                    valA = a[sortConfig.key];
                    valB = b[sortConfig.key];
            }

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

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
                    title={title}
                    subtitle={subtitle}
                    rightAction={
                        showAddButton ? (
                            <TouchableOpacity
                                onPress={() => router.push("/(admin)/classes/create")}
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
                        { label: "Academic Year", value: "year" },
                        { label: "Course", value: "course" },
                        { label: "Semester", value: "semester" },
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
                        <ClassCard
                            classItem={item}
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
                                {searchQuery ? "No matching classes found." : "No classes found."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
