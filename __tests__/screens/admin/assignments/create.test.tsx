import CreateAssignment from "@/app/(admin)/assignments/create";
import { assignmentService } from "@/services";
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

jest.mock("@/store/hooks/useTeachers", () => ({ useTeachers: () => ({ data: [{ $id: "t1", name: "T1", email: "t1@test" }], fetchTeachers: jest.fn() }) }));
jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ data: [{ $id: "c1", name: "C1", code: "101" }], fetchCourses: jest.fn() }) }));
jest.mock("@/store/hooks/useClasses", () => ({ useClasses: () => ({ data: [{ $id: "cl1", semester: 1, course: { $id: "c1" } }], fetchClasses: jest.fn() }) }));
jest.mock("@/store/hooks/useSubjects", () => ({ useSubjects: () => ({ data: [{ $id: "s1", name: "Math", code: "M1", semester: 1, course: { $id: "c1" } }], fetchSubjects: jest.fn() }) }));
jest.mock("@/store/hooks/useAssignments", () => ({ useAssignments: () => ({ fetchAssignments: jest.fn() }) }));

jest.mock("@/services", () => ({
    assignmentService: { create: jest.fn() }
}));

// Mock wrapper components
jest.mock("@/components/admin/ui/FormSelect", () => {
    const { TouchableOpacity, Text } = require('react-native');
    // Simple mock that calls onChange with first option value on press if available
    return {
        FormSelect: ({ label, value, onChange, options }: any) => (
            <TouchableOpacity testID={`select-${label}`} onPress={() => options.length > 0 && onChange(options[0].value)}>
                <Text>{label}: {value}</Text>
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

describe("CreateAssignment", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly", () => {
        const { getByText } = render(<CreateAssignment />);
        expect(getByText("New Assignment")).toBeTruthy();
    });

    it("submits form with selected values", async () => {
        (assignmentService.create as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<CreateAssignment />);

        // Select Teacher (first mock option: t1)
        fireEvent.press(getByTestId("select-Teacher"));
        // Select Course (c1)
        fireEvent.press(getByTestId("select-Filter by Course (Optional)"));
        // Select Class (cl1)
        fireEvent.press(getByTestId("select-Class"));
        // Select Subject (s1)
        fireEvent.press(getByTestId("select-Subject"));

        fireEvent.press(getByText("Assign Teacher"));

        await waitFor(() => {
            expect(assignmentService.create).toHaveBeenCalledWith({
                teacher: "t1",
                class: "cl1",
                subject: "s1",
                institution: "inst1",
            });
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Assignment created successfully", expect.any(Array));
        });
    });
});
