import CreateCourse from "@/app/(admin)/courses/create";
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

const mockCreateCourse = jest.fn();
jest.mock("@/store/hooks/useCourses", () => ({
    useCourses: () => ({ createCourse: mockCreateCourse })
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
jest.mock("@/components/admin/ui/PageHeader", () => {
    const { Text } = require('react-native');
    return { PageHeader: ({ title }: any) => <Text>{title}</Text> };
});

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
}));

jest.spyOn(Alert, 'alert');

describe("CreateCourse", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates course successfully", async () => {
        mockCreateCourse.mockResolvedValue({});

        const { getByText, getByTestId } = render(<CreateCourse />);

        fireEvent.changeText(getByTestId("input-Course Name"), "Computer Science");
        fireEvent.changeText(getByTestId("input-Course Code"), "CS");
        fireEvent.changeText(getByTestId("input-Duration (Years)"), "4");

        fireEvent.press(getByText("Create Course"));

        await waitFor(() => {
            expect(mockCreateCourse).toHaveBeenCalledWith(expect.objectContaining({
                name: "Computer Science",
                code: "CS",
                durationYears: 4,
                institution: "inst1",
                isActive: true
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Course created successfully", expect.any(Array));
        });
    });
});
