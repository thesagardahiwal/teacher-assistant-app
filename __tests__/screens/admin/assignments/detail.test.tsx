import EditAssignment from "@/app/(admin)/assignments/[id]";
import { assignmentService } from "@/services";
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

jest.mock("@/store/hooks/useTeachers", () => ({ useTeachers: () => ({ data: [{ $id: "t1", name: "T1", email: "t1@test.com" }], fetchTeachers: jest.fn() }) }));
jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ data: [{ $id: "c1", name: "C1", code: "CODE" }], fetchCourses: jest.fn() }) }));
jest.mock("@/store/hooks/useClasses", () => ({ useClasses: () => ({ data: [{ $id: "cl1", year: "1", division: "A", course: { code: "CODE" } }], fetchClasses: jest.fn() }) }));
jest.mock("@/store/hooks/useSubjects", () => ({ useSubjects: () => ({ data: [{ $id: "sub1", name: "Sub1", code: "S1", semester: 1 }], fetchSubjects: jest.fn() }) }));
jest.mock("@/store/hooks/useAssignments", () => ({ useAssignments: () => ({ fetchAssignments: jest.fn() }) }));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "as1" }),
}));

jest.mock("@/services", () => ({
    assignmentService: {
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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

describe("EditAssignment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (assignmentService.get as jest.Mock).mockResolvedValue({
            $id: "as1",
            teacher: { $id: "t1" },
            subject: { $id: "sub1" },
            class: { $id: "cl1" }
        });
    });

    it("loads data and updates successfully", async () => {
        (assignmentService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<EditAssignment />);

        await waitFor(() => getByText("Edit Assignment"));

        // Verify initial load (values are set, so selects should presumably show them - though my mock shows label)
        // I can verify update flow
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(assignmentService.update).toHaveBeenCalledWith("as1", {
                teacher: "t1",
                class: "cl1",
                subject: "sub1",
            });
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Assignment updated successfully");
        });
    });
});
