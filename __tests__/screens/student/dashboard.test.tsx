import Dashboard from "@/app/(student)/dashboard";
import { attendanceRecordService } from "@/services/attendanceRecord.service";
import { render } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { $id: "s1", name: "Student", institution: { name: "Inst" } } }) }));
jest.mock("@/services/attendanceRecord.service", () => ({ attendanceRecordService: { listByStudent: jest.fn() } }));
jest.mock("expo-router", () => ({ Link: ({ children }: any) => children }));

// Mock components
jest.mock("@/components/Student/AttendanceCard", () => {
    const { Text } = require("react-native");
    return ({ record }: any) => <Text>Record: {record.$id}</Text>;
});

describe("Student Dashboard", () => {
    it("renders correctly with attendance stats", async () => {
        (attendanceRecordService.listByStudent as jest.Mock).mockResolvedValue({
            documents: [
                { $id: "r1", present: true },
                { $id: "r2", present: false }
            ]
        });

        const { findByText, findAllByText } = render(<Dashboard />);

        expect(await findByText("Welcome back,")).toBeTruthy();
        expect(await findByText("Student")).toBeTruthy();
        expect(await findByText("50%")).toBeTruthy();
        const presentLabels = await findAllByText("Present");
        expect(presentLabels.length).toBeGreaterThan(0);
        expect(await findByText("Record: r1")).toBeTruthy();
    });

    it("handles empty states", async () => {
        (attendanceRecordService.listByStudent as jest.Mock).mockResolvedValue({ documents: [] });

        const { findByText } = render(<Dashboard />);

        expect(await findByText("0%")).toBeTruthy();
        expect(await findByText("No records found")).toBeTruthy();
    });
});
