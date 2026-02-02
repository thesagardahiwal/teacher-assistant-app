import { ScheduleDirectory } from "@/components/directory/ScheduleDirectory";
import { useRouter } from "expo-router";
import React from "react";

export default function SchedulesIndex() {
    const router = useRouter();

    return (
        <ScheduleDirectory
            showAddButton={true}
            viewMode="list"
            onItemPress={(id) => router.push(`/(admin)/schedules/${id}`)}
        />
    );
}
