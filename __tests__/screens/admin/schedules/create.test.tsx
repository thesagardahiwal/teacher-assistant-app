import CreateSchedule from "@/app/(admin)/schedules/create";
import { scheduleService } from "@/services";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { institution: "inst1" } }) }));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));

jest.mock("@/store/hooks/useTeachers", () => ({ useTeachers: () => ({ data: [], fetchTeachers: jest.fn() }) }));

jest.mock("@/services", () => ({
    academicYearService: { list: jest.fn().mockResolvedValue({ documents: [{ $id: "ay1", label: "2024", isCurrent: true }] }) },
    classService: { listByAcademicYear: jest.fn().mockResolvedValue({ documents: [{ $id: "cl1", name: "Class A" }] }) },
    assignmentService: { listByClass: jest.fn().mockResolvedValue({ documents: [{ $id: "as1", teacher: { $id: "t1", name: "T1" }, subject: { $id: "sub1", name: "Math", code: "M1" } }] }) },
    scheduleService: { create: jest.fn() }
}));

// Mock components
jest.mock("@/components/admin/ui/FormSelect", () => {
    const { TouchableOpacity, Text } = require('react-native');
    return {
        FormSelect: ({ label, onChange, options }: any) => (
            <TouchableOpacity testID={`select-${label}`} onPress={() => options.length > 0 && onChange(options[0].value)}>
                <Text>{label} ({options.length})</Text>
            </TouchableOpacity>
        )
    };
});
jest.mock("@/components/admin/ui/PageHeader", () => {
    const { Text } = require('react-native');
    return { PageHeader: ({ title }: any) => <Text>{title}</Text> };
});

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
}));

jest.spyOn(Alert, 'alert');

describe("CreateSchedule", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates schedule successfully", async () => {
        (scheduleService.create as jest.Mock).mockResolvedValue({});

        const { getByText, getByPlaceholderText, getByTestId, findAllByText, queryByText } = render(<CreateSchedule />);

        // Wait to load academic year
        await waitFor(() => expect(getByTestId("select-Academic Year")).toBeTruthy());

        // Select Academic Year (auto selects current)
        // Select Class
        await waitFor(() => getByText("Class (1)"));
        fireEvent.press(getByTestId("select-Class"));

        // Wait for assignments and teacher enabled
        await waitFor(() => expect(queryByText("Loading class assignments...")).toBeNull());

        // Wait for Teacher options
        await waitFor(() => getByText("Teacher (1)"));
        fireEvent.press(getByTestId("select-Teacher"));

        // Select Subject
        await waitFor(() => getByText("Subject (1)"));
        fireEvent.press(getByTestId("select-Subject"));

        // Select Day
        fireEvent.press(getByTestId("select-Day"));

        // Enter Time
        fireEvent.changeText(getByPlaceholderText("09:00"), "09:00");
        fireEvent.changeText(getByPlaceholderText("10:00"), "10:00");

        const submitBtn = (await findAllByText("Create Schedule"))[1];
        fireEvent.press(submitBtn);

        await waitFor(() => {
            expect(scheduleService.create).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Schedule created", expect.any(Array));
        });
    });
});
