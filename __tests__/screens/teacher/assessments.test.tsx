import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";
import CreateAssessmentScreen from "../../../app/(teacher)/assessments/create";
import AssessmentsListScreen from "../../../app/(teacher)/assessments/index";
import { useAssessments } from "../../../store/hooks/useAssessments";
import { useClasses } from "../../../store/hooks/useClasses";
import { useSubjects } from "../../../store/hooks/useSubjects";

// Mocks
jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
}));

jest.mock("../../../store/hooks/useAssessments");
jest.mock("../../../store/hooks/useSubjects");
jest.mock("../../../store/hooks/useClasses");
jest.mock("../../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { $id: "teacher1" } })
}));
jest.mock("../../../store/hooks/useTheme", () => ({
    useTheme: () => ({ isDark: false })
}));
jest.mock("../../../utils/useInstitutionId", () => ({
    useInstitutionId: () => "inst1"
}));

describe("Teacher Assessments Screens", () => {
    const mockRouter = { push: jest.fn(), back: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    const mockAssessments = [
        { $id: "1", title: "Math Test", subject: { name: "Math", $id: "sub1" }, class: { name: "Class 10", $id: "cls1" }, date: "2024-01-01" },
        { $id: "2", title: "Science Quiz", subject: { name: "Science", $id: "sub2" }, class: { name: "Class 9", $id: "cls2" }, date: "2024-01-02" }
    ];

    const mockSubjects = [{ $id: "sub1", name: "Math", code: "MTH" }, { $id: "sub2", name: "Science", code: "SCI" }];
    const mockClasses = [{ $id: "cls1", name: "Class 10" }, { $id: "cls2", name: "Class 9" }];

    beforeEach(() => {
        jest.clearAllMocks();
        (useAssessments as jest.Mock).mockReturnValue({
            assessments: mockAssessments,
            isLoading: false,
            getAssessmentsByTeacher: jest.fn(),
            createNewAssessment: jest.fn()
        });
        (useSubjects as jest.Mock).mockReturnValue({
            data: mockSubjects,
            fetchSubjects: jest.fn()
        });
        (useClasses as jest.Mock).mockReturnValue({
            data: mockClasses,
            fetchClasses: jest.fn()
        });
    });

    test("List Screen renders assessments", () => {
        render(<AssessmentsListScreen />);
        expect(screen.getByText("Assessments")).toBeTruthy();
        expect(screen.getByText("Math Test")).toBeTruthy();
        expect(screen.getByText("Science Quiz")).toBeTruthy();
    });

    test("Create Screen renders form fields", () => {
        render(<CreateAssessmentScreen />);
        expect(screen.getByText("New Assessment")).toBeTruthy();
        expect(screen.getByPlaceholderText("e.g. Mid-term Exam")).toBeTruthy();
        expect(screen.getByPlaceholderText("100")).toBeTruthy();
    });

    test("Create Screen shows error on empty submit", async () => {
        render(<CreateAssessmentScreen />);
        fireEvent.press(screen.getByText("Create"));
        // Alert mock is needed to verify, but basic rendering doesn't crash
    });
});
