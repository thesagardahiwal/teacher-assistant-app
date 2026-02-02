import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { assessmentService } from "../../../services/assessment.service";
import { useAssessmentResults } from "../../../store/hooks/useAssessmentResults";
import { useAuth } from "../../../store/hooks/useAuth";
import { useStudents } from "../../../store/hooks/useStudents";
import { useTheme } from "../../../store/hooks/useTheme";
import { Assessment } from "../../../types/assessment.type";
import { showAlert } from "../../../utils/alert";
import { useInstitutionId } from "../../../utils/useInstitutionId";

import { useAppDispatch } from "../../../store/hooks";
import { clearResults } from "../../../store/slices/assessmentResult.slice";

export default function AssessmentDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();
    const dispatch = useAppDispatch();

    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { data: students, fetchStudents } = useStudents();
    const { results, getResultsByAssessment, saveResult, isLoading } = useAssessmentResults();

    // Map student ID to marks/remarks
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [remarks, setRemarks] = useState<Record<string, string>>({});

    const loadAssessment = async () => {
        try {
            setLoading(true);
            const res = await assessmentService.get(id);
            setAssessment(res);
            // Fetch students for this class
            if (res.class?.$id && institutionId) {
                fetchStudents(institutionId, [res.class.$id]);
            }
        } catch (error) {
            showAlert("Error", "Failed to load assessment details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && institutionId) {
            // Clear previous results and local state
            dispatch(clearResults());
            setMarks({});
            setRemarks({});

            loadAssessment();
            getResultsByAssessment(institutionId, id);
        }
    }, [id, institutionId, getResultsByAssessment, dispatch]);



    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadAssessment();
            if (institutionId && id) {
                getResultsByAssessment(institutionId, id, true);
            }
        } finally {
            setRefreshing(false);
        }
    };

    // Populate local state when results load
    useEffect(() => {
        if (results && results.length > 0) {
            const newMarks: Record<string, string> = {};
            const newRemarks: Record<string, string> = {};
            results.forEach(r => {
                if (r.student?.$id) {
                    newMarks[r.student.$id] = r.obtainedMarks.toString();
                    newRemarks[r.student.$id] = r.remarks || "";
                }
            });
            setMarks({ ...newMarks });
            setRemarks({ ...newRemarks });
        }
    }, [results]);

    const [savingStudentId, setSavingStudentId] = useState<string | null>(null);

    const handleSave = async (studentId: string) => {
        if (!assessment || !user?.$id || !institutionId) return;

        const obtained = marks[studentId];
        const remark = remarks[studentId];

        if (!obtained) {
            console.log("Marks empty");
            showAlert("Error", "Please enter marks");
            return;
        }

        const numMarks = parseFloat(obtained);
        if (isNaN(numMarks) || numMarks < 0 || numMarks > assessment.maxMarks) {
            showAlert("Error", `Marks must be between 0 and ${assessment.maxMarks}`);
            return;
        }

        setSavingStudentId(studentId);
        try {
            await saveResult({
                institution: institutionId as any,
                assessment: assessment.$id as any,
                student: studentId as any,
                evaluatedBy: user.$id as any,
                obtainedMarks: numMarks,
                totalMarks: assessment.maxMarks,
                remarks: remark,
                evaluatedAt: new Date().toISOString()
            });
            showAlert("Success", "Grade saved successfully");
        } catch (error) {
            showAlert("Error", "Failed to save grade");
        } finally {
            setSavingStudentId(null);
        }
    };

    const renderStudentRow = ({ item, index }: { item: any, index: number }) => {
        const hasResult = !!results.find(r => r.student?.$id === item.$id);

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <View className={`mb-4 p-5 rounded-2xl border ${isDark ? "bg-dark-card border-dark-border shadow-sm" : "bg-card border-border shadow-sm"}`}>
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className={`font-bold text-lg ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{item.name}</Text>
                            <Text className={`text-sm mt-0.5 ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>{item.rollNumber}</Text>
                        </View>
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${hasResult ? "bg-success/20" : "bg-background"}`}>
                            {hasResult ? (
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={20} color={isDark ? "#6B7280" : "#94A3B8"} />
                            )}
                        </View>
                    </View>

                    <View className="flex-row gap-4 items-end">
                        <View className="flex-1">
                            <Text className={`text-xs font-semibold mb-2 ml-1 ${isDark ? "text-dark-muted" : "text-muted"}`}>
                                MARKS (Max {assessment?.maxMarks})
                            </Text>
                            <View className={`flex-row items-center border rounded-xl overflow-hidden ${isDark ? "bg-dark-background border-dark-border" : "bg-background border-border"}`}>
                                <TextInput
                                    className={`flex-1 p-3 font-medium text-center ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}
                                    keyboardType="numeric"
                                    value={marks[item.$id] || ""}
                                    onChangeText={(t) => setMarks(prev => ({ ...prev, [item.$id]: t }))}
                                    placeholder="0"
                                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                                />
                            </View>
                        </View>

                        <View className="flex-[2]">
                            <Text className={`text-xs font-semibold mb-2 ml-1 ${isDark ? "text-dark-muted" : "text-muted"}`}>
                                REMARKS
                            </Text>
                            <View className={`flex-row items-center border rounded-xl overflow-hidden ${isDark ? "bg-dark-background border-dark-border" : "bg-background border-border"}`}>
                                <TextInput
                                    className={`flex-1 p-3 font-medium ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}
                                    value={remarks[item.$id] || ""}
                                    onChangeText={(t) => setRemarks(prev => ({ ...prev, [item.$id]: t }))}
                                    placeholder="Good work..."
                                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => handleSave(item.$id)}
                            disabled={savingStudentId !== null}
                            className={`h-12 w-12 items-center justify-center rounded-xl shadow-sm ${hasResult
                                ? "bg-success shadow-success/30"
                                : "bg-primary shadow-blue-500/30"}`}
                        >
                            {savingStudentId === item.$id ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name={hasResult ? "save" : "save-outline"} size={22} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        );
    };

    if (isLoading || loading || !assessment) {
        return (
            <View className={`flex-1 items-center justify-center ${isDark ? "bg-dark-background" : "bg-background"}`}>
                <ActivityIndicator size="large" color={isDark ? "#4C8DFF" : "#1A73E8"} />
            </View>
        );
    }

    // Calculate stats
    const totalStudents = students.length;
    const submittedCount = results.length;
    const totalMarks = results.reduce((acc, curr) => acc + curr.obtainedMarks, 0);
    const avgMarks = submittedCount > 0 ? (totalMarks / submittedCount).toFixed(1) : "0";

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-background"}`}
        >
            <View className={`px-6 pt-6 pb-2 border-b ${isDark ? "border-dark-border bg-dark-card" : "border-border bg-card"}`}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Ionicons name="arrow-back" size={24} color={isDark ? "#E5E7EB" : "#0F172A"} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className={`text-xl font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{assessment.title}</Text>
                        <Text className={`text-sm ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>
                            {assessment.subject?.name} • {assessment.class?.name}
                        </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${isDark ? "bg-dark-primary/30" : "bg-primary/10"}`}>
                        <Text className={`text-xs font-bold ${isDark ? "text-dark-primary" : "text-primary"}`}>
                            Max: {assessment.maxMarks}
                        </Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View className="flex-row gap-4 mb-2">
                    <View className="flex-1">
                        <Text className={`text-xs font-medium mb-1 ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>SUBMITTED</Text>
                        <Text className={`text-lg font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>
                            {submittedCount} <Text className={`text-sm font-normal ${isDark ? "text-dark-muted" : "text-muted"}`}>/ {totalStudents}</Text>
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className={`text-xs font-medium mb-1 ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>AVG SCORE</Text>
                        <Text className={`text-lg font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{avgMarks}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className={`text-xs font-medium mb-1 ${isDark ? "text-dark-textSecondary" : "text-textSecondary"}`}>TYPE</Text>
                        <Text className={`text-lg font-bold ${isDark ? "text-dark-textPrimary" : "text-textPrimary"}`}>{assessment.type}</Text>
                    </View>
                </View>
            </View>

            <Animated.FlatList
                data={students}
                keyExtractor={(item) => item.$id}
                renderItem={renderStudentRow}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#1A73E8"]}
                        tintColor={isDark ? "#ffffff" : "#1A73E8"}
                    />
                }
                ListHeaderComponent={
                    <Text className={`text-sm font-bold mb-4 tracking-wider ${isDark ? "text-dark-muted" : "text-muted"}`}>
                        STUDENT GRADES
                    </Text>
                }
            />
        </KeyboardAvoidingView>
    );
}
