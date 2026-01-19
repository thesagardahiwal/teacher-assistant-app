import StudentsScreen from "@/app/(teacher)/students";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));
const mockUser = { $id: "t1" };
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: mockUser }) }));

const mockAssignments: any[] = [];
jest.mock("@/store/hooks/useAssignments", () => ({
    useAssignments: () => ({
        data: mockAssignments, // Handled by fetchAssignments return value in useEffect
        fetchAssignments: jest.fn().mockResolvedValue({ payload: [{ class: { $id: "cl1" } }] })
    })
}));

const mockStudents = [
    { $id: "st1", name: "Alice", rollNumber: "101", class: { name: "Class A" } },
    { $id: "st2", name: "Bob", rollNumber: "102", class: { name: "Class A" } }
];
jest.mock("@/store/hooks/useStudents", () => ({
    useStudents: () => ({
        data: mockStudents,
        loading: false,
        fetchStudents: jest.fn()
    })
}));

describe("StudentsScreen", () => {
    it("loads students and filters by search", async () => {
        const { getByPlaceholderText, getByText, queryByText } = render(<StudentsScreen />);

        // Wait for students load
        await waitFor(() => getByText("Alice"));
        expect(getByText("Bob")).toBeTruthy();

        // Search
        fireEvent.changeText(getByPlaceholderText("Search students..."), "Ali");

        // Verify filtering
        expect(getByText("Alice")).toBeTruthy();
        expect(queryByText("Bob")).toBeNull();
    });
});
