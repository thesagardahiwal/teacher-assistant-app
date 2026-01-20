import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import AttendanceDetailScreen from "../../../../app/(teacher)/attendance/[id]";
import { attendanceService } from "../../../../services/attendance.service";
import { attendanceRecordService } from "../../../../services/attendanceRecord.service";
import { useAuth } from "../../../../store/hooks/useAuth";
import { useTheme } from "../../../../store/hooks/useTheme";
import { useInstitutionId } from "../../../../utils/useInstitutionId";

// Mocks
jest.mock("expo-router", () => ({
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(),
}));
jest.mock("../../../../store/hooks/useTheme");
jest.mock("../../../../store/hooks/useAuth");
jest.mock("../../../../utils/useInstitutionId");
jest.mock("../../../../services/attendance.service");
jest.mock("../../../../services/attendanceRecord.service");

// Mock Alert
jest.spyOn(Alert, "alert");

describe("AttendanceDetailScreen (Teacher)", () => {
    const mockRouter = { back: jest.fn() };

    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "att1" });
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useTheme as jest.Mock).mockReturnValue({ isDark: false });
        (useAuth as jest.Mock).mockReturnValue({ user: { $id: "teacher1", role: "TEACHER" } });
        (useInstitutionId as jest.Mock).mockReturnValue("inst1");

        (attendanceService.get as jest.Mock).mockResolvedValue({
            $id: "att1",
            date: "2023-10-01",
            class: { name: "Class 10A" },
            subject: { name: "Math" },
            teacher: { $id: "teacher1" },
        });

        (attendanceRecordService.listByAttendance as jest.Mock).mockResolvedValue({
            documents: [
                { $id: "rec1", student: { name: "Alice" }, present: true },
                { $id: "rec2", student: { name: "Bob" }, present: false },
            ],
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders student list and statuses", async () => {
        const { getByText, getAllByText } = render(<AttendanceDetailScreen />);

        await waitFor(() => {
            expect(attendanceService.get).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(getByText("Alice")).toBeTruthy();
            expect(getAllByText("Present").length).toBeGreaterThan(0);
            expect(getByText("Bob")).toBeTruthy();
            expect(getAllByText("Absent").length).toBeGreaterThan(0);
        });
    });

    it("toggles attendance and shows save button", async () => {
        const { getByText, getByTestId } = render(<AttendanceDetailScreen />);

        await waitFor(() => getByText("Alice"));

        // Find switches. Assuming Switch maps to a role or can be found by accessibility label if added.
        // Since React Native Switch doesn't have a default accessibility label in tests sometimes, rely on state change trigger.
        // But for this test environment, we might need value prop or testID.
        // Let's assume standard Switch behavior.

        // Simulating the toggle logic via props not easy without TestID. 
        // We will assume the component has rendered.

        // Find switch for Alice (rec1)
        const aliceSwitch = getByTestId("switch-rec1");

        // Toggle first switch (Alice: Present -> Absent)
        fireEvent(aliceSwitch, "valueChange", false);

        await waitFor(() => {
            // Save Changes button should appear
            expect(getByText("Save Changes")).toBeTruthy();
        });
    });

    it("calls update service on save", async () => {
        const { getByText, getByTestId } = render(<AttendanceDetailScreen />);

        await waitFor(() => getByText("Alice"));

        // Toggle Alice to Absent
        const aliceSwitch = getByTestId("switch-rec1");
        fireEvent(aliceSwitch, "valueChange", false);

        await waitFor(() => getByText("Save Changes"));

        fireEvent.press(getByText("Save Changes"));

        // Alert confirmation
        expect(Alert.alert).toHaveBeenCalled();

        // Simulate pressing "Save" in Alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const saveButton = alertCall[2].find((btn: any) => btn.text === "Save");

        await saveButton.onPress();

        expect(attendanceRecordService.update).toHaveBeenCalledWith("rec1", { present: false });
    });
});
