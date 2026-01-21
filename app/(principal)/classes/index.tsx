import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { useAuth } from "@/store/hooks/useAuth";
import { useClasses } from "@/store/hooks/useClasses";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function ClassesIndex() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchClasses } = useClasses();
    const { user } = useAuth();

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

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            // Navigate to PRINCIPAL detail route
            onPress={() => router.push(`/(principal)/classes/${item.$id}`)}
            className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
        >
            <View>
                <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Year • {item.academicYear?.label || "No Year"}
                </Text>
                <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {item.course?.name || "No Course"} •  Sem {item.semester || "(Not Selected)"}
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
                title="Classes"
            // No Create Action
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

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text className={`text-center mt-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {searchQuery ? "No matching classes found." : "No classes found."}
                        </Text>
                    }
                />
            )}
        </View>
    );
}
