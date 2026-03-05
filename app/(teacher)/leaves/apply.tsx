import { FormDatePicker } from "@/components/admin/ui/FormDatePicker";
import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useLeaves } from "@/store/hooks/useLeaves";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { LeaveType } from "@/types/leave.type";
import { showAlert } from "@/utils/alert";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

const LEAVE_TYPES: { label: string; value: LeaveType }[] = [
    { label: "Sick", value: "SICK" },
    { label: "Casual", value: "CASUAL" },
    { label: "Paid", value: "PAID" },
    { label: "Unpaid", value: "UNPAID" },
    { label: "Emergency", value: "EMERGENCY" },
    { label: "Other", value: "OTHER" },
];

export default function ApplyLeaveScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const { applyLeave } = useLeaves();

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    const [leaveType, setLeaveType] = useState("");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [reason, setReason] = useState("");
    const [errors, setErrors] = useState<{ leaveType?: string; startDate?: string; endDate?: string; reason?: string }>({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const nextErrors: typeof errors = {};

        if (!leaveType) nextErrors.leaveType = "Leave type is required.";
        if (!startDate) nextErrors.startDate = "Start date is required.";
        if (!endDate) nextErrors.endDate = "End date is required.";
        if (!reason.trim()) nextErrors.reason = "Reason is required.";

        if (startDate && endDate) {
            const start = new Date(`${startDate}T00:00:00`);
            const end = new Date(`${endDate}T00:00:00`);
            if (start > end) {
                nextErrors.endDate = "End date must be on or after start date.";
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!institutionId || !user?.$id) {
            showAlert("Error", "Missing user or institution details.");
            return;
        }

        if (!validate()) return;

        try {
            setSubmitting(true);
            await applyLeave({
                teacher: user.$id,
                institution: institutionId,
                leaveType: leaveType as LeaveType,
                startDate,
                endDate,
                reason: reason.trim(),
            }).unwrap();
            showAlert("Success", "Leave request submitted.");
            router.back();
        } catch (error) {
            showAlert("Error", (error as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
            <View className="flex-1 px-6 pt-6">
                <PageHeader
                    title="Apply for Leave"
                    subtitle="Submit a new leave request"
                    rightAction={
                        submitting ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                <Ionicons
                                    name="checkmark"
                                    size={24}
                                    color="#2563EB"
                                    onPress={handleSubmit}
                                />
                            </View>
                        )
                    }
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    <FormSelect
                        label="Leave Type"
                        placeholder="Select Leave Type"
                        value={leaveType}
                        options={LEAVE_TYPES}
                        onChange={setLeaveType}
                        required
                        error={errors.leaveType}
                        delay={100}
                    />

                    <FormDatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                        required
                        error={errors.startDate}
                        delay={150}
                    />

                    <FormDatePicker
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                        required
                        error={errors.endDate}
                        minDate={startDate}
                        delay={200}
                    />

                    <FormInput
                        label="Reason"
                        placeholder="Reason for leave"
                        value={reason}
                        onChangeText={setReason}
                        required
                        multiline
                        numberOfLines={4}
                        error={errors.reason}
                        delay={250}
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
