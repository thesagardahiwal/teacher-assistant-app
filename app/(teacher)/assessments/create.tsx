import { FormDatePicker } from "@/components/admin/ui/FormDatePicker";
import { FormInput } from "@/components/admin/ui/FormInput";
import { FormSelect } from "@/components/admin/ui/FormSelect";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AssessmentPayload } from "@/types/assessment.type";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useAcademicYears } from "../../../store/hooks/useAcademicYears";
import { useAssessments } from "../../../store/hooks/useAssessments";
import { useAuth } from "../../../store/hooks/useAuth";
import { useClasses } from "../../../store/hooks/useClasses";
import { useSubjects } from "../../../store/hooks/useSubjects";
import { useTeacherEligibility } from "../../../store/hooks/useTeacherEligibility";
import { useTheme } from "../../../store/hooks/useTheme";
import { showAlert } from "../../../utils/alert";
import { useInstitutionId } from "../../../utils/useInstitutionId";

const ASSESSMENT_TYPES = [
    { label: "Test", value: "TEST" },
    { label: "Quiz", value: "QUIZ" },
    { label: "Homework", value: "HOMEWORK" },
    { label: "Assignment", value: "ASSIGNMENT" },
];

export default function CreateAssessmentScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { user } = useAuth();
    const institutionId = useInstitutionId();

    const { createNewAssessment, isLoading } = useAssessments();
    const { data: academicYears, fetchAcademicYears } = useAcademicYears();
    const { data: subjects, fetchSubjectsByTeacher } = useSubjects();
    const { data: classes, fetchClassesByTeacher } = useClasses();
    const { isEligible, isLoading: loadingEligibility } = useTeacherEligibility();

    useEffect(() => {
        if (!loadingEligibility && !isEligible) {
            showAlert("Access Restricted", "You need to be assigned to a class and subject to create assessments.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        }
    }, [isEligible, loadingEligibility]);

    const [form, setForm] = useState<AssessmentPayload>({
        title: "",
        type: "TEST",
        subject: "",
        class: "",
        maxMarks: 1,
        weightage: 1,
        description: "",
        academicYear: "",
        institution: "",
        isActive: true,
        dueDate: new Date().toISOString().split('T')[0],
        teacher: user?.$id || ""
    });

    useEffect(() => {
        if (institutionId && user?.$id) {
            fetchAcademicYears(institutionId);
            fetchSubjectsByTeacher(institutionId, user.$id);
            fetchClassesByTeacher(institutionId, user.$id);
        }
    }, [institutionId, user?.$id]);

    // Set active academic year automatically
    useEffect(() => {
        const activeYear = academicYears.find(y => y.isCurrent);
        if (activeYear) {
            setForm(prev => ({ ...prev, academicYear: activeYear.$id }));
        }
    }, [academicYears]);

    const handleCreate = async () => {
        if (!form.title || !form.subject || !form.class || !form.maxMarks) {
            showAlert("Error", "Please fill in all required fields");
            return;
        }

        if (form.dueDate && isNaN(new Date(form.dueDate).getTime())) {
            showAlert("Error", "Invalid Due Date format");
            return;
        }

        if (!institutionId || !user?.$id) {
            showAlert("Error", "Missing user information");
            return;
        }

        if (!form.academicYear) {
            showAlert("Error", "No active academic year found");
            return;
        }

        try {
            await createNewAssessment({
                institution: institutionId,
                title: form.title,
                type: form.type as any,
                subject: form.subject,
                class: form.class,
                teacher: user.$id,
                maxMarks: form.maxMarks,
                weightage: form.weightage,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
                description: form.description,
                academicYear: form.academicYear,
                isActive: true
            });
            showAlert("Success", "Assessment created successfully");
            router.back();
        } catch (error) {
            showAlert("Error", (error as Error).message);
        }
    };

    const subjectOptions = subjects.map(s => ({ label: `${s.name} (${s.code})`, value: s.$id }));
    const classOptions = classes.map(c => ({ label: c.name, value: c.$id }));

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`flex-1 ${isDark ? "bg-gray-900" : "bg-white"}`}
        >
            <View className="flex-1 px-6 pt-6">
                <PageHeader
                    title="New Assessment"
                    subtitle="Create a new assessment for your class"
                    rightAction={
                        isLoading ? (
                            <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                <Ionicons
                                    name="checkmark"
                                    size={24}
                                    color="#2563EB"
                                    onPress={handleCreate}
                                />
                            </View>
                        )
                    }
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                    <FormInput
                        label="Assessment Title"
                        placeholder="e.g. Mid-term Exam"
                        value={form.title}
                        onChangeText={(t) => setForm({ ...form, title: t })}
                        required
                        delay={100}
                    />

                    <FormSelect
                        label="Type"
                        placeholder="Select Assessment Type"
                        value={form.type}
                        options={ASSESSMENT_TYPES}
                        onChange={(val) => setForm({ ...form, type: val as any })}
                        delay={200}
                    />

                    <View className="flex-row gap-4 z-50">
                        <View className="flex-1">
                            <FormSelect
                                label="Subject"
                                placeholder="Select Subject"
                                value={form.subject}
                                options={subjectOptions}
                                onChange={(val) => setForm({ ...form, subject: val })}
                                required
                                delay={300}
                            />
                        </View>
                        <View className="flex-1">
                            <FormSelect
                                label="Class"
                                placeholder="Select Class"
                                value={form.class}
                                options={classOptions}
                                onChange={(val) => setForm({ ...form, class: val })}
                                required
                                delay={300}
                            />
                        </View>
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <FormInput
                                label="Max Marks"
                                placeholder="100"
                                value={form.maxMarks.toString()}
                                onChangeText={(t) => setForm({ ...form, maxMarks: Number(t) })}
                                keyboardType="numeric"
                                required
                                delay={400}
                            />
                        </View>
                        <View className="flex-1">
                            <FormInput
                                label="Weightage %"
                                placeholder="20"
                                value={form.weightage.toString()}
                                onChangeText={(t) => setForm({ ...form, weightage: Number(t) })}
                                keyboardType="numeric"
                                delay={400}
                            />
                        </View>
                    </View>

                    <FormDatePicker
                        label="Due Date"
                        value={form.dueDate || ""}
                        onChange={(val) => setForm({ ...form, dueDate: val })}
                        minDate={new Date().toISOString().split('T')[0]}
                        delay={500}
                    />

                    <FormInput
                        label="Description"
                        placeholder="Add details about the assessment..."
                        value={form.description}
                        onChangeText={(t) => setForm({ ...form, description: t })}
                        multiline
                        numberOfLines={4}
                        style={{ minHeight: 100, textAlignVertical: 'top' }}
                        delay={600}
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
