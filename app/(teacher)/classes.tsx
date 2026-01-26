import { PageHeader } from "@/components/admin/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAuth } from "../../store/hooks/useAuth";
import { useClasses } from "../../store/hooks/useClasses";
import { useTheme } from "../../store/hooks/useTheme";
import { TeacherAssignment } from "../../types";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function ClassesScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const isPrincipal = user?.role === "PRINCIPAL" || user?.role === "VICE_PRINCIPAL";

    // Teacher Data
    const { data: assignments, loading: loadingAssignments, fetchAssignments } = useAssignments();

    // Principal Data
    const { data: allClasses, loading: loadingClasses, fetchClasses } = useClasses();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
        key: "name",
        order: "asc",
    });

    useEffect(() => {
        if (institutionId) {
            if (isPrincipal) {
                fetchClasses(institutionId);
            } else if (user?.$id) {
                fetchAssignments(institutionId, user.$id);
            }
        }
    }, [institutionId, user, isPrincipal]);

    const onRefresh = React.useCallback(async () => {
        if (institutionId) {
            setRefreshing(true);
            if (isPrincipal) {
                await fetchClasses(institutionId);
            } else if (user?.$id) {
                await fetchAssignments(institutionId, user.$id);
            }
            setRefreshing(false);
        }
    }, [institutionId, user, isPrincipal]);

    // Filter Logic for Principal
    const filteredPrincipalData = useMemo(() => {
        if (!isPrincipal) return [];
        let result = [...allClasses];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.academicYear?.label?.toLowerCase().includes(q) ||
                c.course?.name?.toLowerCase().includes(q) ||
                String(c.semester || "").includes(q)
            );
        }

        // Simple sort (expand if needed)
        result.sort((a, b) => {
            const valA = (a as any).academicYear?.label || "";
            const valB = (b as any).academicYear?.label || "";
            return sortConfig.order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });

        return result;
    }, [allClasses, searchQuery, sortConfig, isPrincipal]);


    const renderPrincipalItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => {
                // Warning: Verify if this route exists in teacher layout, otherwise might need porting
                // Usually (teacher)/classes/[id] is mainly for a teacher's specific class view
                // For now, let's assume we might need to fix detail view later or it reuses same logic
            }}
            className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
        >
            <View>
                <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Year • {item.academicYear?.label || "No Year"}
                </Text>
                <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {item.course?.name || "No Course"} •  Sem {item.semester || "(Not Selected)"}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#6B7280" : "#9CA3AF"} />
        </TouchableOpacity>
    );

    const renderTeacherItem = ({ item }: { item: TeacherAssignment }) => (
        <TouchableOpacity className={`p-4 mb-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm`}>
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.subject?.name || "Unknown Subject"}</Text>
                    <Text className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>{item.class?.name ? `${item.class.name} (Sem ${item.class.semester})` : "Class N/A"}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${isDark ? "bg-blue-900/50" : "bg-blue-50"}`}>
                    <Text className="text-blue-500 font-medium text-xs">Room 101</Text>
                </View>
            </View>

            <View className="flex-row items-center mt-2">
                <MaterialCommunityIcons name="clock-outline" size={16} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`ml-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Scheduled</Text>
            </View>
        </TouchableOpacity>
    );

    const loading = isPrincipal ? loadingClasses : loadingAssignments;
    const data = isPrincipal ? filteredPrincipalData : assignments;

    return (
        <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <View className="px-5 pt-4 w-full">
                <PageHeader
                    title={isPrincipal ? "All Classes" : "My Classes"}
                    subtitle={isPrincipal ? "Manage institution classes" : undefined}
                />

                {isPrincipal && (
                    <FilterBar
                        onSearch={setSearchQuery}
                        onSortChange={(key, order) => setSortConfig({ key, order })}
                        sortOptions={[
                            { label: "Academic Year", value: "year" },
                        ]}
                    />
                )}
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={data as any}
                    keyExtractor={(item) => item.$id}
                    renderItem={isPrincipal ? renderPrincipalItem : renderTeacherItem}
                    contentContainerStyle={{ padding: 20 }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    className="w-full flex-1"
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {isPrincipal ? "No classes found" : "No classes assigned"}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
