import CreateClass from "@/app/(admin)/classes/create";
import { classService } from "@/services";
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

jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ data: [{ $id: "c1", name: "Course1" }], fetchCourses: jest.fn() }) }));
jest.mock("@/store/hooks/useAcademicYears", () => ({ useAcademicYears: () => ({ data: [{ $id: "ay1", label: "2024" }], fetchAcademicYears: jest.fn() }) }));

jest.mock("@/services", () => ({
    classService: { create: jest.fn() }
}));

// Mock components
jest.mock("@/components/admin/ui/FormInput", () => {
    const { TextInput } = require('react-native');
    return {
        FormInput: ({ label, value, onChangeText }: any) => (
            <TextInput testID={`input-${label}`} value={value} onChangeText={onChangeText} />
        )
    };
});
jest.mock("@/components/admin/ui/FormSelect", () => {
    const { TouchableOpacity, Text } = require('react-native');
    return {
        FormSelect: ({ label, onChange, options }: any) => (
            <TouchableOpacity testID={`select-${label}`} onPress={() => options.length > 0 && onChange(options[0].value)}>
                <Text>{label}</Text>
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

describe("CreateClass", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates class successfully", async () => {
        (classService.create as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<CreateClass />);

        fireEvent.press(getByTestId("select-Course")); // Selects c1
        fireEvent.press(getByTestId("select-Academic Year")); // Selects ay1
        fireEvent.changeText(getByTestId("input-Semester"), "1");
        fireEvent.changeText(getByTestId("input-Name"), "Class A");

        fireEvent.press(getByText("Create Class"));

        await waitFor(() => {
            expect(classService.create).toHaveBeenCalledWith({
                semester: 1,
                course: "c1",
                academicYear: "ay1",
                institution: "inst1",
                name: "Class A",
            });
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Class created successfully", expect.any(Array));
        });
    });
});
