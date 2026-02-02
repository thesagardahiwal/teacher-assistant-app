import { TeacherDirectory } from "@/components/directory/TeacherDirectory";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TeachersIndex() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <TeacherDirectory
        showAddButton={true}
        onItemPress={(id) => router.push(`/(admin)/teachers/${id}`)}
        title="Teachers"
        subtitle="Manage institution teachers"
      />
    </View>
  );
}
