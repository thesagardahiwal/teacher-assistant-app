import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { useAuth } from "@/store/hooks/useAuth";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function StudentTeacherDirectory() {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchTeachers } = useTeachers();
    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "name",
        order: "asc",
    });

    useEffect(() => {
        if (institutionId) fetchTeachers(institutionId);
    }, [institutionId]);

    const onRefresh = React.useCallback(async () => {
        if (institutionId) {
            setRefreshing(true);
            await fetchTeachers(institutionId);
            setRefreshing(false);
        }
    }, [institutionId]);

    const filteredData = useMemo(() => {
        let result = [...data];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name?.toLowerCase().includes(q) ||
                    t.email?.toLowerCase().includes(q) ||
                    t.department?.toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a: any, b: any) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            // Handle nulls
            if (!valA) valA = "";
            if (!valB) valB = "";

            if (valA < valB) return sortConfig.order === "asc" ? -1 : 1;
            if (valA > valB) return sortConfig.order === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [data, searchQuery, sortConfig]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(student)/teachers/${item.$id}`)}
            className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
        >
            <View className="flex-row items-center flex-1">
                {/* Avatar */}
                <View className={`w-12 h-12 rounded-full mr-4 items-center justify-center ${isDark ? "bg-purple-900/30" : "bg-purple-50"
                    }`}>
                    <Text className={`text-lg font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                        {item.name?.charAt(0).toUpperCase()}
                    </Text>
                </View>

                <View className="flex-1">
                    <Text className={`text-base font-bold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {item.email}
                    </Text>
                    {(item.department || item.designation) && (
                        <View className="flex-row items-center mt-1">
                            <Text className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {item.designation} {item.designation && item.department ? "•" : ""} {item.department}
                            </Text>
                        </View>
                    )}
                </View>
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
                title="Teachers"
                subtitle="Your course instructors"
                showBack={true}
            />

            <FilterBar
                onSearch={setSearchQuery}
                onSortChange={(key, order) => setSortConfig({ key, order })}
                sortOptions={[
                    { label: "Name", value: "name" },
                    { label: "Department", value: "department" },
                ]}
            />

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="school-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {searchQuery ? "No matching teachers found." : "No teachers found."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
