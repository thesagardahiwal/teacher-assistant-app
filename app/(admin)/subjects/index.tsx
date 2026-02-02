import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useSubjects } from "@/store/hooks/useSubjects";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function SubjectsIndex() {
  const router = useRouter();
  const { isDark } = useTheme();
  const institutionId = useInstitutionId();
  const { data, loading, fetchSubjects } = useSubjects();

  useEffect(() => {
    if (institutionId) fetchSubjects(institutionId);
  }, [institutionId]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/subjects/${item.$id}`)}
      className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
    >
      <View>
        <Text className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
          {item.name}
        </Text>
        <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Code: {item.code} • Year {item.year} - Sem {item.semester}
        </Text>
        <Text className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {item.course?.name || "No Course"}
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
    <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-dark-background" : "bg-background"}`}>
      <PageHeader
        title="Subjects"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push("/(admin)/subjects/create")}
            className="bg-blue-600 p-2 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.$id}
          ListEmptyComponent={
            <Text className={`text-center mt-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              No subjects found.
            </Text>
          }
        />
      )}
    </View>
  );
}
