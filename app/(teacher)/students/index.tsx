import { StudentDirectory } from "@/components/directory/StudentDirectory";
import { useAssignments } from "@/store/hooks/useAssignments";
import { useAuth } from "@/store/hooks/useAuth";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function StudentsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const { fetchAssignments } = useAssignments();

    // State to hold derived class IDs
    const [filterClassIds, setFilterClassIds] = useState<string[]>([]);
    const [loadingIds, setLoadingIds] = useState(true);

    useEffect(() => {
        const loadClasses = async () => {
            if (institutionId && user?.$id) {
                setLoadingIds(true);
                try {
                    // Fetch teacher's assignments to determine relevant classes
                    const res = await fetchAssignments(institutionId, user.$id);
                    const payload = (res as any).payload as any[];
                    // Extract unique class IDs
                    const classIds = [...new Set(payload.map((a: any) => a.class?.$id).filter(Boolean))] as string[];
                    setFilterClassIds(classIds);
                } catch (e) {
                    console.error("Failed to load teacher classes", e);
                } finally {
                    setLoadingIds(false);
                }
            }
        };
        loadClasses();
    }, [institutionId, user?.$id]);

    if (loadingIds) return <View className="flex-1 bg-white dark:bg-gray-900" />;

    return (
        <StudentDirectory
            showAddButton={false}
            title="My Students"
            filterClassIds={filterClassIds} // Only show students in teacher's classes
            onItemPress={(id) => router.push(`/(teacher)/students/${id}`)}
        />
    );
}
