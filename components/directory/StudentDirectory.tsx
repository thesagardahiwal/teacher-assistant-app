import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { useStudents } from "@/store/hooks/useStudents";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { StudentCard } from "./StudentCard";

interface StudentDirectoryProps {
    showAddButton?: boolean;
    onItemPress?: (id: string) => void; // Optional override
    hideFilter?: boolean;
    title?: string;
    filterClassIds?: string[]; // If provided, only show students from these classes
}

export function StudentDirectory({
    showAddButton = false,
    onItemPress,
    hideFilter = false,
    title = "Students",
    filterClassIds
}: StudentDirectoryProps) {
    const router = useRouter();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { data, loading, fetchStudents } = useStudents();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "name",
        order: "asc",
    });

    // Custom Fetch Logic (handles filterClassIds for Teachers)
    const loadData = async () => {
        if (!institutionId) return;
        setRefreshing(true);
        try {
            // If filterClassIds provided (e.g. Teacher View), fetch specifically for those
            // Otherwise fetch all (Admin View)
            await fetchStudents(institutionId, filterClassIds);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [institutionId, JSON.stringify(filterClassIds)]);


    const filteredData = useMemo(() => {
        if (!data) return [];
        let result = [...data];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.name?.toLowerCase().includes(q) ||
                    s.email?.toLowerCase().includes(q) ||
                    s.rollNumber?.toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a: any, b: any) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (valA < valB) return sortConfig.order === "asc" ? -1 : 1;
            if (valA > valB) return sortConfig.order === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [data, searchQuery, sortConfig]);

    const handlePress = (id: string) => {
        if (onItemPress) {
            onItemPress(id);
        } else {
            // Default Routing based on likely usage context (can be improved or parameterized)
            // We can actually assume the parent handles navigation if they want custom, 
            // but here we can try to guess or use a standard route.
            // Actually, clearer to let individual screens pass the route action?
            // Or construct route based on current path?
            // Let's rely on standard ID nav for now, assuming relative path works or absolute.
            // But simpler: The implementation plan said:
            // Admin: /(admin)/students/[id]
            // Teacher: /(teacher)/students/[id]
            // So we might need a prop `baseRoute`.
            // OR, just checking router path is messy.
            // Let's default to Admin route if showAddButton is true, else Teacher? 
            // A bit loose. Let's adding `baseRoute` or just conditional.
        }
    };

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2 w-full">
                <PageHeader
                    title={title}
                    rightAction={
                        showAddButton ? (
                            <TouchableOpacity
                                onPress={() => router.push("/(admin)/students/create")}
                                className="bg-blue-600 p-2 rounded-full shadow-sm"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        ) : null
                    }
                />
                {!hideFilter && (
                    <FilterBar
                        onSearch={setSearchQuery}
                        onSortChange={(key, order) => setSortConfig({ key, order })}
                        sortOptions={[
                            { label: "Name", value: "name" },
                            { label: "Roll Number", value: "rollNumber" },
                            { label: "Year", value: "currentYear" },
                        ]}
                    />
                )}
            </View>

            {loading && !refreshing && filteredData.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={({ item, index }) => (
                        <StudentCard
                            student={item}
                            index={index}
                            onPress={() => onItemPress ? onItemPress(item.$id) : {}}
                        />
                    )}
                    keyExtractor={(item) => item.$id}
                    refreshing={refreshing}
                    onRefresh={loadData}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Ionicons name="search-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
                            <Text className={`text-center mt-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {searchQuery ? "No matching students found." : "No students found."}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
