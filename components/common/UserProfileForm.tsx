import { FormInput } from "@/components/admin/ui/FormInput";
import { ProfileFieldConfig } from "@/config/user-profile.config";
import { useTheme } from "@/store/hooks/useTheme";
import { getErrorMessage, validators } from "@/utils/validators";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface UserProfileFormProps<T> {
    initialData?: T | null;
    config: ProfileFieldConfig[];
    onSubmit: (data: T) => Promise<void>;
    loading?: boolean;
    saving?: boolean;
    onCancel?: () => void;
    showCancel?: boolean;
    readOnly?: boolean;
}

export const UserProfileForm = <T extends Record<string, any>>({
    initialData,
    config,
    onSubmit,
    loading = false,
    saving = false,
    onCancel,
    showCancel = false,
    readOnly = false,
}: UserProfileFormProps<T>) => {
    const { isDark } = useTheme();

    const [formData, setFormData] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [changed, setChanged] = useState(false);

    /** Safe getter for nested paths like "institution.name" */
    const getValue = (obj: any, path: string): string => {
        if (!obj || !path) return "";
        const value = path.split(".").reduce((acc, key) => acc?.[key], obj);
        return value === null || value === undefined ? "" : String(value);
    };

    /** Initialize form data */
    useEffect(() => {
        if (!initialData) return;

        const data: Record<string, string> = {};
        config.forEach((field) => {
            data[field.name] = getValue(initialData, field.name);
        });

        setFormData(data);
        setErrors({});
        setChanged(false);
    }, [initialData, config]);

    /** Field validation */
    const validateField = (
        value: string,
        field: ProfileFieldConfig
    ): string => {
        if (field.required && !validators.isRequired(value)) {
            return getErrorMessage("required", field.label);
        }

        if (value && field.type === "email" && !validators.isValidEmail(value)) {
            return getErrorMessage("email", field.label);
        }

        if (value && field.type === "phone" && !validators.isValidPhone(value)) {
            return getErrorMessage("phone", field.label);
        }

        return "";
    };

    const handleChange = (name: string, value: string) => {
        const field = config.find((f) => f.name === name);
        if (!field) return;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setChanged(true);

        const error = validateField(value, field);
        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    /** Full form validation */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let valid = true;

        config.forEach((field) => {
            if (readOnly || !field.editable) return;

            const value = formData[field.name] ?? "";
            const error = validateField(value, field);

            if (error) {
                newErrors[field.name] = error;
                valid = false;
            }
        });

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        const isValid = validateForm();
        if (!isValid) return;

        await onSubmit(formData as T);
        setChanged(false);
    };

    /** Section grouping */
    const { sections, noSection } = useMemo(() => {
        const s: Record<string, ProfileFieldConfig[]> = {};
        const ns: ProfileFieldConfig[] = [];

        config.forEach((field) => {
            if (field.section) {
                if (!s[field.section]) s[field.section] = [];
                s[field.section].push(field);
            } else {
                ns.push(field);
            }
        });

        return { sections: s, noSection: ns };
    }, [config]);

    const hasErrors = Object.values(errors).some(Boolean);

    const renderField = (field: ProfileFieldConfig, index: number) => {
        const value = formData[field.name] ?? "";
        const editable = !readOnly && field.editable;

        if (!editable) {
            return (
                <View key={field.name} className="mb-4">
                    <Text className={`text-xs uppercase font-bold mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {field.label}
                    </Text>
                    <View className={`p-3.5 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                        <Text className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            {value || "Not Set"}
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <FormInput
                key={field.name}
                label={field.label}
                value={value}
                onChangeText={(text) => handleChange(field.name, text)}
                placeholder={field.placeholder ?? field.label}
                editable={!saving}
                multiline={field.type === "textarea"}
                numberOfLines={field.type === "textarea" ? 3 : 1}
                keyboardType={
                    field.type === "email"
                        ? "email-address"
                        : field.type === "phone"
                            ? "phone-pad"
                            : "default"
                }
                required={field.required}
                error={errors[field.name]}
                delay={index * 100}
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
            {noSection.map((field, index) => renderField(field, index))}

            {Object.entries(sections).map(([section, fields], sectionIndex) => (
                <View key={section} className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
                        {section}
                    </Text>
                    {fields.map((field, fieldIndex) => renderField(field, noSection.length + (sectionIndex * 5) + fieldIndex))}
                </View>
            ))}

            {!readOnly && (
                <View className="flex-row gap-3 mt-4 mb-8">
                    {showCancel && onCancel && (
                        <TouchableOpacity
                            className={`flex-1 py-4 rounded-2xl items-center border mr-3 ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
                        >
                            <Text className={`font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className={`flex-1 py-4 rounded-2xl items-center shadow-lg ${changed && !hasErrors
                            ? "bg-primary shadow-primary/30"
                            : isDark ? "bg-gray-800" : "bg-gray-200"
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className={`font-bold text-lg ${changed && !hasErrors ? "text-white" : "text-gray-400"}`}>
                                Save Changes
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
