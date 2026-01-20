import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";
import StudentTeacherDirectory from "../../../app/(student)/teachers/index";
import { useAuth } from "../../../store/hooks/useAuth";
import { useTeachers } from "../../../store/hooks/useTeachers";
import { useTheme } from "../../../store/hooks/useTheme";
import { useInstitutionId } from "../../../utils/useInstitutionId";

// Mocks
jest.mock("expo-router", () => ({
    useRouter: jest.fn(),
}));
jest.mock("../../../store/hooks/useAuth");
jest.mock("../../../store/hooks/useTeachers");
jest.mock("../../../store/hooks/useTheme");
jest.mock("../../../utils/useInstitutionId");
jest.mock("@/components/admin/ui/PageHeader", () => ({
    PageHeader: ({ title }: any) => <>{title}</>, // Simple mock
}));
jest.mock("@/components/ui/FilterBar", () => ({
    FilterBar: ({ onSearch }: any) => (
        // Simulate search input for testing
        <></>
    ),
}));

describe("StudentTeacherDirectory Screen", () => {
    const mockRouter = { push: jest.fn() };
    const mockFetchTeachers = jest.fn();

    const mockTeachers = [
        { $id: "t1", name: "John Doe", email: "john@example.com", department: "Math" },
        { $id: "t2", name: "Jane Smith", email: "jane@example.com", department: "Science" },
    ];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useTheme as jest.Mock).mockReturnValue({ isDark: false });
        (useAuth as jest.Mock).mockReturnValue({ user: { $id: "s1" } });
        (useInstitutionId as jest.Mock).mockReturnValue("inst1");
        (useTeachers as jest.Mock).mockReturnValue({
            data: mockTeachers,
            loading: false,
            fetchTeachers: mockFetchTeachers,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the list of teachers", async () => {
        const { getByText } = render(<StudentTeacherDirectory />);

        await waitFor(() => {
            expect(getByText("John Doe")).toBeTruthy();
            expect(getByText("Math")).toBeTruthy();
            expect(getByText("Jane Smith")).toBeTruthy();
        });
    });

    it("navigates to teacher detail on press", async () => {
        const { getByText } = render(<StudentTeacherDirectory />);

        await waitFor(() => {
            fireEvent.press(getByText("John Doe"));
        });

        expect(mockRouter.push).toHaveBeenCalledWith("/(student)/teachers/t1");
    });
});
