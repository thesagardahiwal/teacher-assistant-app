import TakeAttendanceScreen from "@/app/(teacher)/attendance/create";
import { attendanceRecordService, attendanceService } from "@/services";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));
const mockUser = { $id: "t1" };
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: mockUser }) }));

const mockAssignments = [{ $id: "a1", class: { $id: "cl1", name: "Class A" }, subject: { $id: "s1", name: "Math" } }];
jest.mock("@/store/hooks/useAssignments", () => ({
    useAssignments: () => ({
        data: mockAssignments,
        fetchAssignments: jest.fn()
    })
}));

const mockStudentsData = [
    { $id: "st1", name: "Student 1", rollNumber: "1", class: { $id: "cl1" } },
    { $id: "st2", name: "Student 2", rollNumber: "2", class: { $id: "cl1" } }
];
jest.mock("@/store/hooks/useStudents", () => ({
    useStudents: () => ({
        data: mockStudentsData,
        fetchStudents: jest.fn()
    })
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
}));

jest.mock("@/services", () => ({
    attendanceService: { create: jest.fn() },
    attendanceRecordService: { create: jest.fn() },
}));

jest.mock("@/components/Student/StudentDetailsModal", () => {
    const { View } = require('react-native');
    return ({ visible }: any) => visible ? <View testID="student-details-modal" /> : null;
});

jest.spyOn(Alert, 'alert');

describe("TakeAttendanceScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (attendanceService.create as jest.Mock).mockResolvedValue({ $id: "att1" });
        (attendanceRecordService.create as jest.Mock).mockResolvedValue({});
    });

    it("loads classes, selects class, toggles student, and submits attendance", async () => {
        const { getByText, getAllByText } = render(<TakeAttendanceScreen />);

        // Wait for class list (from assignments)
        await waitFor(() => getByText("Class A"));

        // Select Class
        fireEvent.press(getByText("Class A"));

        // Wait for students to appear
        await waitFor(() => getByText("Student 1"));
        await waitFor(() => getByText("Student 2"));

        // Check initial state: All Present (Green/Checkmark logic in UI, but we can just check existence)
        // Toggle Student 2 to Absent
        fireEvent.press(getByText("Student 2"));
        // UI updates state locally.

        // Submit
        fireEvent.press(getByText("Submit Attendance"));

        await waitFor(() => {
            // Verify Attendance Session Created
            expect(attendanceService.create).toHaveBeenCalledWith(expect.objectContaining({
                class: "cl1",
                subject: "s1",
                teacher: "t1",
                institution: "inst1"
            }));

            // Verify Records Created
            // We expect 2 records.
            // Student 1: Present (true)
            // Student 2: Absent (false) because we toggled it.
            // Note: studentStatus init to true. Toggle makes it false.
            expect(attendanceRecordService.create).toHaveBeenCalledTimes(2);
            expect(attendanceRecordService.create).toHaveBeenCalledWith(expect.objectContaining({
                student: "st1",
                present: true,
                attendance: "att1"
            }));
            expect(attendanceRecordService.create).toHaveBeenCalledWith(expect.objectContaining({
                student: "st2",
                present: false, // Toggled
                attendance: "att1"
            }));

            expect(Alert.alert).toHaveBeenCalledWith("Success", "Attendance submitted successfully", expect.any(Array));
        });
    });
});
