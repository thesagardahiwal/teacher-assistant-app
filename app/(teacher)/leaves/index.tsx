import { FormInput } from "@/components/admin/ui/FormInput";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { pdfService } from "@/services/local/pdf.service";
import { useLeaves } from "@/store/hooks/useLeaves";
import { useAuth } from "@/store/hooks/useAuth";
import { useTheme } from "@/store/hooks/useTheme";
import { Leave, LeaveStatus, LeaveType } from "@/types/leave.type";
import { showAlert } from "@/utils/alert";
import { pdfTemplates } from "@/utils/pdf/pdfTemplates";
import { toSafeFileName } from "@/utils/pdf/pdfUtils";
import { useInstitutionId } from "@/utils/useInstitutionId";
import { getVaultRouteForRole } from "@/utils/vault";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Text, TouchableOpacity, View } from "react-native";

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    SICK: "Sick",
    CASUAL: "Casual",
    PAID: "Paid",
    UNPAID: "Unpaid",
    EMERGENCY: "Emergency",
    OTHER: "Other",
};

const STATUS_FILTERS: LeaveStatus[] = ["PENDING", "APPROVED", "REJECTED"];

const getTeacherName = (leave: Leave) => {
    if (!leave.teacher) return "Unknown Teacher";
    return typeof leave.teacher === "string" ? "Teacher" : leave.teacher.name;
};

const RejectLeaveModal = ({
    visible,
    onClose,
    onSubmit,
    isDark,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
    isDark: boolean;
}) => {
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!visible) setComment("");
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/60 px-4">
                <View className={`w-full max-w-md rounded-2xl p-6 ${isDark ? "bg-gray-900" : "bg-white"}`}>
                    <Text className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Reject Leave
                    </Text>
                    <Text className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Please provide a reason for rejection.
                    </Text>
                    <FormInput
                        label="Comment"
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Add review comment"
                        multiline
                        numberOfLines={4}
                    />
                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity
                            onPress={onClose}
                            className={`flex-1 py-3 rounded-xl border items-center ${isDark ? "border-gray-700" : "border-gray-200"}`}
                        >
                            <Text className={`${isDark ? "text-gray-200" : "text-gray-700"}`}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onSubmit(comment)}
                            className="flex-1 py-3 rounded-xl bg-red-600 items-center"
                        >
                            <Text className="text-white font-semibold">Reject</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function TeacherLeavesIndex() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const {
        data,
        loading,
        fetchTeacherLeaves,
        fetchInstitutionLeaves,
        cancelLeave,
        approveLeave,
        rejectLeave,
    } = useLeaves();

    const isApprover = user?.role === "PRINCIPAL" || user?.role === "VICE_PRINCIPAL";
    const [view, setView] = useState<"MY" | "REQUESTS">("MY");
    const [statusFilter, setStatusFilter] = useState<LeaveStatus>("PENDING");
    const [refreshing, setRefreshing] = useState(false);
    const [cancelTarget, setCancelTarget] = useState<Leave | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Leave | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [vaultModalVisible, setVaultModalVisible] = useState(false);
    const [savedFileName, setSavedFileName] = useState("");

    const loadLeaves = async () => {
        if (!institutionId || !user?.$id) return;
        if (view === "REQUESTS") {
            await fetchInstitutionLeaves(institutionId, statusFilter);
        } else {
            await fetchTeacherLeaves(institutionId, user.$id);
        }
    };

    useEffect(() => {
        loadLeaves();
    }, [institutionId, user?.$id, view, statusFilter]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLeaves();
        setRefreshing(false);
    };

    const handleCancel = async () => {
        if (!cancelTarget || !institutionId || !user?.$id) return;
        setActionLoading(true);
        try {
            await cancelLeave(cancelTarget.$id, institutionId, user.$id).unwrap();
            setCancelTarget(null);
        } catch (error) {
            showAlert("Error", (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (leave: Leave) => {
        if (!institutionId || !user?.$id) return;
        setActionLoading(true);
        try {
            await approveLeave(leave.$id, institutionId, user.$id).unwrap();
            await loadLeaves();
        } catch (error) {
            showAlert("Error", (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (comment: string) => {
        if (!rejectTarget || !institutionId || !user?.$id) return;
        setActionLoading(true);
        try {
            await rejectLeave(rejectTarget.$id, institutionId, user.$id, comment).unwrap();
            setRejectTarget(null);
            await loadLeaves();
        } catch (error) {
            showAlert("Error", (error as Error).message);
        } finally {
            setActionLoading(false);
        }
    };

    const emptyMessage = view === "REQUESTS" ? "No leave requests found." : "No leaves found.";

    const listTitle = view === "REQUESTS" ? "Leave Requests" : "My Leaves";

    const renderFilters = useMemo(() => {
        if (!isApprover || view !== "REQUESTS") return null;
        return (
            <View className="flex-row flex-wrap gap-2 mb-4">
                {STATUS_FILTERS.map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full border ${statusFilter === status
                            ? "bg-blue-600 border-blue-600"
                            : isDark
                                ? "border-gray-700"
                                : "border-gray-200"}`}
                    >
                        <Text className={`${statusFilter === status
                            ? "text-white"
                            : isDark
                                ? "text-gray-200"
                                : "text-gray-700"}`}>
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }, [isApprover, view, statusFilter, isDark]);

    const renderItem = ({ item }: { item: Leave }) => {
        const isPending = item.status === "PENDING";
        return (
            <View className={`p-4 mb-3 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                        <Text className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {LEAVE_TYPE_LABELS[item.leaveType]} Leave
                        </Text>
                        {view === "REQUESTS" && (
                            <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {getTeacherName(item)}
                            </Text>
                        )}
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                <Text className={`text-sm mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    {item.startDate} → {item.endDate} • {item.totalDays} day{item.totalDays > 1 ? "s" : ""}
                </Text>

                {item.reason ? (
                    <Text className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {item.reason}
                    </Text>
                ) : null}

                {item.status === "REJECTED" && item.reviewComment ? (
                    <Text className={`text-xs mt-2 ${isDark ? "text-red-300" : "text-red-600"}`}>
                        Rejection: {item.reviewComment}
                    </Text>
                ) : null}

                {view === "MY" && isPending && (
                    <View className="mt-4">
                        <TouchableOpacity
                            onPress={() => setCancelTarget(item)}
                            className="px-4 py-2 rounded-xl border border-red-200 bg-red-50"
                        >
                            <Text className="text-red-600 font-semibold text-center">Cancel Leave</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {view === "REQUESTS" && isPending && (
                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            onPress={() => handleApprove(item)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-xl bg-green-600 items-center"
                        >
                            <Text className="text-white font-semibold">Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setRejectTarget(item)}
                            disabled={actionLoading}
                            className="flex-1 py-2 rounded-xl bg-red-600 items-center"
                        >
                            <Text className="text-white font-semibold">Reject</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}>
            <View className="px-6 pt-6">
                <PageHeader
                    title={listTitle}
                    rightAction={
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={async () => {
                                    if (!data.length || !user) return;
                                    try {
                                        setExporting(true);
                                        const institutionName =
                                            typeof user.institution === "object" ? user.institution?.name || "" : "";
                                        const html = pdfTemplates.leaveRegister({
                                            title: view === "REQUESTS" ? "Institution Leave Register" : "My Leave Register",
                                            institutionName,
                                            rows: data.map((leave) => ({
                                                teacher: view === "MY"
                                                    ? user.name || "Teacher"
                                                    : typeof leave.teacher === "object"
                                                        ? leave.teacher.name
                                                        : "Teacher",
                                                type: LEAVE_TYPE_LABELS[leave.leaveType],
                                                range: `${leave.startDate} - ${leave.endDate}`,
                                                days: leave.totalDays,
                                                status: leave.status,
                                                reason: leave.reason || "-",
                                            })),
                                        });

                                        const fileName = `${toSafeFileName(view === "REQUESTS" ? "Leave_Register_All" : "My_Leave_Register")}_${new Date().toISOString().split("T")[0]}.pdf`;

                                        const result = await pdfService.exportAndSave({
                                            html,
                                            fileName,
                                            addedByRole: user.role as any,
                                            tags: ["leave", "register"],
                                        });

                                        setSavedFileName(result.file.fileName);
                                        setVaultModalVisible(true);
                                    } catch (error) {
                                        console.error(error);
                                    } finally {
                                        setExporting(false);
                                    }
                                }}
                                className={`p-2 rounded-full ${exporting ? "bg-blue-400" : "bg-blue-600"}`}
                            >
                                {exporting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="download-outline" size={22} color="white" />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => router.push("/(teacher)/leaves/apply")}
                                className="bg-blue-600 p-2 rounded-full"
                            >
                                <Ionicons name="add" size={22} color="white" />
                            </TouchableOpacity>
                        </View>
                    }
                />

                {isApprover && (
                    <View className="flex-row gap-2 mb-4">
                        <TouchableOpacity
                            onPress={() => setView("MY")}
                            className={`flex-1 py-2 rounded-xl border ${view === "MY"
                                ? "bg-blue-600 border-blue-600"
                                : isDark
                                    ? "border-gray-700"
                                    : "border-gray-200"}`}
                        >
                            <Text className={`text-center font-semibold ${view === "MY"
                                ? "text-white"
                                : isDark
                                    ? "text-gray-200"
                                    : "text-gray-700"}`}>
                                My Leaves
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setView("REQUESTS")}
                            className={`flex-1 py-2 rounded-xl border ${view === "REQUESTS"
                                ? "bg-blue-600 border-blue-600"
                                : isDark
                                    ? "border-gray-700"
                                    : "border-gray-200"}`}
                        >
                            <Text className={`text-center font-semibold ${view === "REQUESTS"
                                ? "text-white"
                                : isDark
                                    ? "text-gray-200"
                                    : "text-gray-700"}`}>
                                Requests
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {renderFilters}
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#2563EB" />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    ListEmptyComponent={
                        <Text className={`text-center mt-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {emptyMessage}
                        </Text>
                    }
                />
            )}

            <ConfirmationModal
                visible={!!cancelTarget}
                title="Cancel Leave?"
                message="This will cancel your pending leave request."
                onCancel={() => setCancelTarget(null)}
                onConfirm={handleCancel}
                confirmText={actionLoading ? "Cancelling..." : "Yes, Cancel"}
                type="destructive"
            />

            <RejectLeaveModal
                visible={!!rejectTarget}
                onClose={() => setRejectTarget(null)}
                onSubmit={handleReject}
                isDark={isDark}
            />

            <ConfirmationModal
                visible={vaultModalVisible}
                title="Saved to Study Vault"
                message={savedFileName ? `${savedFileName} was saved to your vault.` : "PDF saved to your vault."}
                confirmText="Open Vault"
                cancelText="Close"
                onConfirm={() => {
                    setVaultModalVisible(false);
                    router.push(getVaultRouteForRole(user?.role) as any);
                }}
                onCancel={() => setVaultModalVisible(false)}
            />
        </View>
    );
}
