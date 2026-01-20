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

export default function TeachersIndex() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { data, loading, fetchTeachers } = useTeachers();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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
          t.department?.toLowerCase().includes(q) ||
          t.designation?.toLowerCase().includes(q)
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
      onPress={() => router.push(`/(admin)/teachers/${item.$id}`)}
      className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
    >
      <View>
        <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          {item.name}
        </Text>
        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {item.email}
        </Text>
        {(item.department || item.designation) && (
          <Text className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {item.designation} • {item.department}
          </Text>
        )}
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
        rightAction={
          isAdmin ? (
            <TouchableOpacity
              onPress={() => router.push("/(admin)/teachers/create")}
              className="bg-blue-600 p-2 rounded-full"
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
          { label: "Department", value: "department" },
          { label: "Designation", value: "designation" },
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
              {searchQuery ? "No matching teachers found." : "No teachers found."}
            </Text>
          }
        />
      )}
    </View>
  );
}
