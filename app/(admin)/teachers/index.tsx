import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useAuth } from "@/store/hooks/useAuth";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function TeachersIndex() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { data, loading, fetchTeachers } = useTeachers();

  useEffect(() => {
    if (institutionId) fetchTeachers(institutionId);
  }, [institutionId]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    if (institutionId) {
      setRefreshing(true);
      await fetchTeachers(institutionId);
      setRefreshing(false);
    }
  }, [institutionId]);

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

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text className={`text-center mt-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              No teachers found.
            </Text>
          }
        />
      )}
    </View>
  );
}
