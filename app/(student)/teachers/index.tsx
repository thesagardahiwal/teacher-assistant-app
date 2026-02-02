import { TeacherDirectory } from "@/components/directory/TeacherDirectory";
import { useRouter } from "expo-router";
import React from "react";

export default function StudentTeacherDirectory() {
    const router = useRouter();

    return (
        <TeacherDirectory
            showAddButton={false}
            onItemPress={(id) => router.push(`/(student)/teachers/${id}`)}
            title="Teachers"
            subtitle="Your course instructors"
        />
    );
}
