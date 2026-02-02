import { TeacherDirectory } from "@/components/directory/TeacherDirectory";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TeacherDirectoryScreen() {
    const router = useRouter();

    return (
        <View className="flex-1">
            <TeacherDirectory
                showAddButton={false}
                // Teachers can view details of other teachers (read-only likely handled in detail screen)
                onItemPress={(id) => router.push(`/(teacher)/teachers/${id}`)}
                title="Teachers Directory"
                subtitle="View and connect with colleagues"
            />
        </View>
    );
}
