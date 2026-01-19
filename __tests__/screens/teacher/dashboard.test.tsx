import TeacherDashboard from "@/app/(teacher)/index";
import { scheduleService } from "@/services";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { $id: "t1", name: "Teacher", institution: { name: "Inst" } } }) }));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));
jest.mock("@/store/hooks/useAssignments", () => ({ useAssignments: () => ({ data: [], fetchAssignments: jest.fn() }) }));
jest.mock("@/store/hooks/useAttendance", () => ({ useAttendance: () => ({ data: [], fetchAttendance: jest.fn() }) }));
jest.mock("@/store/hooks/useStudents", () => ({ useStudents: () => ({ data: [], fetchStudents: jest.fn() }) }));

jest.mock("@/services", () => ({
    scheduleService: {
        getNextClassForTeacher: jest.fn(),
        getPreviousClassForTeacher: jest.fn(),
    }
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ push: mockPush }),
}));

describe("TeacherDashboard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly", async () => {
        (scheduleService.getNextClassForTeacher as jest.Mock).mockResolvedValue({ documents: [] });
        (scheduleService.getPreviousClassForTeacher as jest.Mock).mockResolvedValue({ documents: [] });

        const { getByText } = render(<TeacherDashboard />);

        await waitFor(() => {
            expect(getByText("Welcome back,")).toBeTruthy();
            expect(getByText("Teacher")).toBeTruthy();
            expect(getByText("Quick Actions")).toBeTruthy();
        });
    });

    it("renders next class if available", async () => {
        (scheduleService.getNextClassForTeacher as jest.Mock).mockResolvedValue({
            documents: [{
                $id: "sc1",
                subject: { name: "Math" },
                class: { name: "10A" },
                startTime: "10:00",
                endTime: "11:00"
            }]
        });

        const { findByText } = render(<TeacherDashboard />);

        expect(await findByText("Upcoming Class")).toBeTruthy();
        expect(await findByText("Math")).toBeTruthy();
        expect(await findByText("Class 10A")).toBeTruthy();
    });

    it("navigates on quick action", async () => {
        (scheduleService.getNextClassForTeacher as jest.Mock).mockResolvedValue({ documents: [] });
        (scheduleService.getPreviousClassForTeacher as jest.Mock).mockResolvedValue({ documents: [] });

        const { getByText } = render(<TeacherDashboard />);

        await waitFor(() => {
            fireEvent.press(getByText("Take Attendance"));
            expect(mockPush).toHaveBeenCalledWith("/(teacher)/attendance/create");
        });
    });
});
