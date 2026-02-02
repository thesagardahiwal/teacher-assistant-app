import { ScheduleDirectory } from "@/components/directory/ScheduleDirectory";
import { useRouter } from "expo-router";
import React from "react";
import { useAuth } from "../../../store/hooks/useAuth";

export default function TeacherScheduleScreen() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <ScheduleDirectory
            viewMode="weekly"
            teacherId={user?.$id}
            showAddButton={true}
            onAddPress={() => router.push("/(teacher)/schedule/create")}
        />
    );
}
