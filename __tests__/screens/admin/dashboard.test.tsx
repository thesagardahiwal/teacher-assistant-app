import AdminDashboard from "@/app/(admin)/dashboard";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Admin", institution: "inst1" } }) }));
jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ data: [], fetchCourses: jest.fn() }) }));
jest.mock("@/store/hooks/useClasses", () => ({ useClasses: () => ({ data: [], fetchClasses: jest.fn() }) }));
jest.mock("@/store/hooks/useTeachers", () => ({ useTeachers: () => ({ data: [], fetchTeachers: jest.fn() }) }));
jest.mock("@/store/hooks/useStudents", () => ({ useStudents: () => ({ data: [], fetchStudents: jest.fn() }) }));
jest.mock("@/utils/institutionStorage", () => ({ institutionStorage: { getInstitutionId: jest.fn(() => Promise.resolve("inst1")) } }));

const mockPush = jest.fn();
const mockNavigate = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
}));

describe("AdminDashboard", () => {
    it("renders correctly", async () => {
        const { getByText } = render(<AdminDashboard />);

        await waitFor(() => {
            expect(getByText("Welcome back,")).toBeTruthy();
            expect(getByText("Admin")).toBeTruthy();
            expect(getByText("Courses")).toBeTruthy();
            expect(getByText("Quick Actions")).toBeTruthy();
        });
    });

    it("navigates on quick action", async () => {
        const { getByText } = render(<AdminDashboard />);

        await waitFor(() => {
            fireEvent.press(getByText("Add Course"));
            expect(mockNavigate).toHaveBeenCalledWith("/(admin)/courses/create");
        });
    });
});
