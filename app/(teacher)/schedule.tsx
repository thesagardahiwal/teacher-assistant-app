import { ScheduleDirectory } from "@/components/directory/ScheduleDirectory";
import React from "react";
import { useAuth } from "../../store/hooks/useAuth";

export default function TeacherScheduleScreen() {
    const { user } = useAuth();

    return (
        <ScheduleDirectory
            viewMode="weekly"
            teacherId={user?.$id}
            showAddButton={false}
        // Add onPress handler here if we want to show details/edit modal
        />
    );
}
