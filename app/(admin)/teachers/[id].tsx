import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { userService } from "@/services/user.service";
import { useAuth } from "@/store/hooks/useAuth";
import { useTeachers } from "@/store/hooks/useTeachers";
import { useTheme } from "@/store/hooks/useTheme";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditTeacher() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { isDark } = useTheme();
    const institutionId = useInstitutionId();
    const { user } = useAuth();
    const { fetchTeachers } = useTeachers();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const doc = await userService.get(id as string);
            setName(doc.name);
            setEmail(doc.email);
            setDepartment(doc.department || "");
            setDesignation(doc.designation || "");
        } catch (error) {
            Alert.alert("Error", "Failed to load teacher");
            router.back();
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        Alert.alert("Delete", "Are you sure you want to delete this teacher? This will NOT delete their Auth account, only their profile.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await userService.delete(id as string);
                        if (institutionId) await fetchTeachers(institutionId);
                        router.back();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete");
                    }
                }
            }
        ])
    }

    const handleSubmit = async () => {
        if (!name || !email) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            await userService.update(id as string, {
                name,
                department,
                designation
            });

            if (institutionId) await fetchTeachers(institutionId);
            Alert.alert("Success", "Teacher updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update teacher");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        )
    }



    const isAdmin = user?.role === "ADMIN";

    return (
        <View className={`flex-1 px-6 pt-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <PageHeader
                title={isAdmin ? "Edit Teacher" : "Teacher Details"}
                rightAction={
                    isAdmin ? (
                        <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    ) : null
                }
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className={`p-6 rounded-2xl mb-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                    <FormInput
                        label="Full Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                        editable={isAdmin}
                    />

                    <View className="opacity-50">
                        <FormInput
                            label="Email Address"
                            value={email}
                            editable={false}
                        />
                    </View>

                    <FormInput
                        label="Department"
                        placeholder="Science"
                        value={department}
                        onChangeText={setDepartment}
                        editable={isAdmin}
                    />

                    <FormInput
                        label="Designation"
                        placeholder="Senior Teacher"
                        value={designation}
                        onChangeText={setDesignation}
                        editable={isAdmin}
                    />
                </View>

                {isAdmin && (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={saving}
                        className={`py-4 rounded-xl items-center mb-10 ${saving ? "bg-blue-400" : "bg-blue-600"
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}
