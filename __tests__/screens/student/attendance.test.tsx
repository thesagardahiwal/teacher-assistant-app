import Attendance from "@/app/(student)/attendance";
import { attendanceRecordService } from "@/services/attendanceRecord.service";
import { render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { $id: "s1" } }) }));
jest.mock("@/services/attendanceRecord.service", () => ({ attendanceRecordService: { listByStudent: jest.fn() } }));
jest.mock("expo-router", () => ({ Link: ({ children }: any) => children, Stack: { Screen: () => null } }));

// Mock components
jest.mock("@/components/Student/AttendanceCard", () => {
    const { Text } = require("react-native");
    return ({ record }: any) => <Text>Record: {record.$id}</Text>;
});

describe("Student Attendance Screen", () => {
    it("renders lists of records", async () => {
        (attendanceRecordService.listByStudent as jest.Mock).mockResolvedValue({
            documents: [
                { $id: "r1", present: true },
                { $id: "r2", present: true }
            ]
        });

        const { getByText } = render(<Attendance />);

        await waitFor(() => {
            expect(getByText("Attendance History")).toBeTruthy();
            expect(getByText("Record: r1")).toBeTruthy();
            expect(getByText("Record: r2")).toBeTruthy();
        });
    });
});
