import EditSchedule from "@/app/(admin)/schedules/[id]";
import { scheduleService } from "@/services";
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

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "sc1" }),
}));

jest.mock("@/services", () => ({
    academicYearService: { list: jest.fn().mockResolvedValue({ documents: [{ $id: "ay1", label: "2024" }] }) },
    classService: { listByAcademicYear: jest.fn().mockResolvedValue({ documents: [{ $id: "cl1", name: "Class A" }] }) },
    assignmentService: { listByClass: jest.fn().mockResolvedValue({ documents: [{ $id: "as1", teacher: { $id: "t1", name: "T1" }, subject: { $id: "sub1", name: "S1", code: "C1" } }] }) },
    scheduleService: {
        get: jest.fn(),
        update: jest.fn(),
        deactivate: jest.fn(),
    }
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
    const { Text, View } = require('react-native');
    return { PageHeader: ({ title }: any) => <View><Text>{title}</Text></View> };
});

jest.spyOn(Alert, 'alert');

describe("EditSchedule", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (scheduleService.get as jest.Mock).mockResolvedValue({
            $id: "sc1",
            academicYear: { $id: "ay1" },
            class: { $id: "cl1", name: "Class A" },
            teacher: { $id: "t1", name: "T1" },
            subject: { $id: "sub1", name: "S1" },
            dayOfWeek: "MON",
            startTime: "09:00",
            endTime: "10:00",
            isActive: true
        });
    });

    it("loads data and updates successfully", async () => {
        (scheduleService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId, queryByText } = render(<EditSchedule />);

        // Wait for data load and seeds
        // The seeds manually set options so they shouldn't be empty
        // Then useEffects kick in to refresh lists.
        // We can wait for "Teacher (1)" because seed puts 1 option, and list puts 1 option (same t1).
        await waitFor(() => getByText("Edit Schedule"));

        // Wait for loading assignments to finish (triggered by selectedClass)
        await waitFor(() => expect(queryByText("Loading class assignments...")).toBeNull());

        fireEvent.press(getByText("Update Schedule"));

        await waitFor(() => {
            expect(scheduleService.update).toHaveBeenCalledWith("sc1", expect.objectContaining({
                teacher: "t1",
                class: "cl1",
                subject: "sub1",
                dayOfWeek: "MON"
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Schedule updated", expect.any(Array));
        });
    });
});
