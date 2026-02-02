import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ClassDirectory } from "@/components/directory/ClassDirectory";
import { TeacherAssignmentCard } from "@/components/directory/TeacherAssignmentCard";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useAssignments } from "../../store/hooks/useAssignments";
import { useAuth } from "../../store/hooks/useAuth";
import { useTheme } from "../../store/hooks/useTheme";
import { useInstitutionId } from "../../utils/useInstitutionId";

export default function ClassesScreen() {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const isPrincipal = user?.role === "PRINCIPAL" || user?.role === "VICE_PRINCIPAL";

    // Teacher Data
    const { data: assignments, loading: loadingAssignments, fetchAssignments } = useAssignments();

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (institutionId && !isPrincipal && user?.$id) {
            fetchAssignments(institutionId, user.$id);
        }
    }, [institutionId, user, isPrincipal]);

    const onRefresh = React.useCallback(async () => {
        if (institutionId && !isPrincipal && user?.$id) {
            setRefreshing(true);
            await fetchAssignments(institutionId, user.$id);
            setRefreshing(false);
        }
    }, [institutionId, user, isPrincipal]);

    // Role-based Rendering
    if (isPrincipal) {
        return (
            <ClassDirectory
                title="All Classes"
                subtitle="Manage institution classes"
                showAddButton={false}
                readonly={false} // Principal might want to click details? Assuming yes.
            />
        );
    }

    // Teacher View
    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6 pb-2 w-full">
                <PageHeader title="My Classes" />
            </View>

            {loadingAssignments && !refreshing && assignments.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#2563EB"} />
                </View>
            ) : (
                <FlatList
                    data={assignments}
                    keyExtractor={(item) => item.$id}
                    renderItem={({ item, index }) => (
                        <TeacherAssignmentCard
                            assignment={item}
                            index={index}
                            onPress={() => { }} // No detail view for assignments currently
                        />
                    )}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    className="w-full flex-1"
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                No classes assigned
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
