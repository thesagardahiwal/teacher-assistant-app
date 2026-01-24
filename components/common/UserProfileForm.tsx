import { FormInput } from "@/components/admin/ui/FormInput";
import { ProfileFieldConfig } from "@/config/user-profile.config";
import { useTheme } from "@/store/hooks/useTheme";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface UserProfileFormProps {
    initialData: any;
    config: ProfileFieldConfig[];
    onSubmit: (data: any) => Promise<void>;
    loading?: boolean;
    saving?: boolean;
    onCancel?: () => void;
    showCancel?: boolean;
    readOnly?: boolean;
}

export const UserProfileForm = ({
    initialData,
    config,
    onSubmit,
    loading = false,
    saving = false,
    onCancel,
    showCancel = false,
    readOnly = false
}: UserProfileFormProps) => {
    const { isDark } = useTheme();
    const [formData, setFormData] = useState<any>({});
    const [changed, setChanged] = useState(false);

    // Helper to access nested paths like "institution.name"
    const getValue = (obj: any, path: string) => {
        if (!obj) return "";
        return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    };

    useEffect(() => {
        if (initialData) {
            // Initialize form data based on config to ensure we have keys
            const data: any = {};
            config.forEach(field => {
                const val = getValue(initialData, field.name);
                data[field.name] = val !== undefined && val !== null ? String(val) : "";
            });
            setFormData(data);
        }
    }, [initialData]); // Run only when initialData changes reference or is loaded

    const handleChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
        setChanged(true);
    };

    const handleSubmit = async () => {
        await onSubmit(formData);
        setChanged(false); // Reset changed status after successful submit if parent doesn't unmount
    };

    // Group fields by section
    const sections: { [key: string]: ProfileFieldConfig[] } = {};
    const noSection: ProfileFieldConfig[] = [];

    config.forEach(field => {
        if (field.section) {
            if (!sections[field.section]) sections[field.section] = [];
            sections[field.section].push(field);
        } else {
            noSection.push(field);
        }
    });

    const renderField = (field: ProfileFieldConfig) => {
        // If global readOnly is true, force not editable. Otherwise check field config.
        const isEditable = !readOnly && field.editable;

        if (!isEditable) {
            return (
                <View key={field.name} className="mb-4">
                    <Text className={`text-xs uppercase font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {field.label}
                    </Text>
                    <View className={`p-3.5 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                        <Text className={`text-base font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {formData[field.name] || "Not Set"}
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <FormInput
                key={field.name}
                label={field.label}
                value={formData[field.name]}
                onChangeText={(text) => handleChange(field.name, text)}
                placeholder={field.placeholder || field.label}
                editable={!loading && !saving}
                multiline={field.type === 'textarea'}
                numberOfLines={field.type === 'textarea' ? 3 : 1}
                keyboardType={
                    field.type === 'email' ? 'email-address' :
                        field.type === 'phone' ? 'phone-pad' : 'default'
                }
            />
        );
    };

    if (loading) {
        return (
            <View className="py-10">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View>
            {/* Fields without section */}
            <View className="mb-2">
                {noSection.map(renderField)}
            </View>

            {/* Sections */}
            {Object.keys(sections).map((sectionName) => (
                <View key={sectionName} className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                        {sectionName}
                    </Text>
                    {sections[sectionName].map(renderField)}
                </View>
            ))}

            {/* Actions - Only show if not readOnly */}
            {!readOnly && (
                <View className="flex-row gap-3 mt-4 mb-8">
                    {showCancel && onCancel && (
                        <TouchableOpacity
                            onPress={onCancel}
                            disabled={saving}
                            className={`flex-1 py-4 rounded-xl items-center border ${isDark ? "border-gray-700" : "border-gray-300"}`}
                        >
                            <Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={saving || (!changed && !showCancel)}
                        className={`flex-1 py-4 rounded-xl items-center ${(changed || showCancel) ? "bg-blue-600 shadow-lg shadow-blue-600/20" : "bg-gray-300 dark:bg-gray-800"
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold ${changed || showCancel ? "text-white" : "text-gray-500"}`}>
                                Save Changes
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
