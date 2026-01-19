import PrincipalDashboard from "@/app/(principal)/dashboard";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { name: "Principal", institution: "inst1" } }) }));
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

describe("PrincipalDashboard", () => {
    it("renders correctly", async () => {
        const { getByText } = render(<PrincipalDashboard />);

        await waitFor(() => {
            expect(getByText("Welcome back,")).toBeTruthy();
            expect(getByText("Principal")).toBeTruthy();
            expect(getByText("Principal Dashboard")).toBeTruthy();
            expect(getByText("Courses")).toBeTruthy();
        });
    });

    it("navigates on quick action", async () => {
        const { getByText } = render(<PrincipalDashboard />);

        await waitFor(() => {
            fireEvent.press(getByText("Assign Teacher"));
            expect(mockNavigate).toHaveBeenCalledWith("/(admin)/assignments/create");
        });
    });
});
