import TeacherScheduleScreen from "@/app/(teacher)/schedule";
import { scheduleService } from "@/services";
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

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
}));

jest.mock("@/services", () => ({
    scheduleService: { listByTeacher: jest.fn() },
}));

describe("TeacherScheduleScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (scheduleService.listByTeacher as jest.Mock).mockResolvedValue({
            documents: [
                {
                    $id: "sc1",
                    subject: { name: "Math" },
                    class: { name: "Class A" },
                    startTime: "09:00",
                    endTime: "10:00"
                }
            ]
        });
    });

    it("loads schedule for default day (MON)", async () => {
        const { getByText, queryByTestId } = render(<TeacherScheduleScreen />);

        // Wait for loading to finish
        await waitFor(() => expect(queryByTestId("loading-schedules")).toBeNull());

        await waitFor(() => getByText("Math"));
        expect(getByText("Class A")).toBeTruthy();
        expect(scheduleService.listByTeacher).toHaveBeenCalledWith("t1", "MON");
    });

    it("changes day and reloads schedule", async () => {
        const { getByText } = render(<TeacherScheduleScreen />);
        await waitFor(() => getByText("Math"));

        // Change mock for TUE
        (scheduleService.listByTeacher as jest.Mock).mockResolvedValue({
            documents: [
                {
                    $id: "sc2",
                    subject: { name: "Science" },
                    class: { name: "Class B" },
                    startTime: "10:00",
                    endTime: "11:00"
                }
            ]
        });

        fireEvent.press(getByText("Tue"));

        await waitFor(() => {
            expect(scheduleService.listByTeacher).toHaveBeenCalledWith("t1", "TUE");
            expect(getByText("Science")).toBeTruthy();
        });
    });
});
