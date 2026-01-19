import ClassesScreen from "@/app/(teacher)/classes";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { $id: "t1" } }) }));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));
jest.mock("@/store/hooks/useAssignments", () => ({
    useAssignments: () => ({
        data: [],
        loading: false,
        fetchAssignments: jest.fn()
    })
}));

describe("ClassesScreen", () => {
    it("renders empty state", () => {
        const { getByText } = render(<ClassesScreen />);
        expect(getByText("My Classes")).toBeTruthy();
        expect(getByText("No classes assigned")).toBeTruthy();
    });

    it("renders list of classes", async () => {
        // Redefine mock for this test
        const assignmentsData = [{
            $id: "a1",
            subject: { name: "Mathematics" },
            class: { name: "Class 10", semester: 1 }
        }];

        jest.spyOn(require("@/store/hooks/useAssignments"), "useAssignments").mockReturnValue({
            data: assignmentsData,
            loading: false,
            fetchAssignments: jest.fn()
        });

        // Re-render
        const { getByText } = render(<ClassesScreen />);

        await waitFor(() => {
            expect(getByText("Mathematics")).toBeTruthy();
            expect(getByText("Class 10 (Sem 1)")).toBeTruthy();
        });
    });
});
