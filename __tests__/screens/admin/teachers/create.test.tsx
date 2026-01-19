import CreateTeacher from "@/app/(admin)/teachers/create";
import { authService } from "@/services/appwrite/auth.service";
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

jest.mock("@/store/hooks/useTeachers", () => ({ useTeachers: () => ({ fetchTeachers: jest.fn() }) }));

jest.mock("@/services/appwrite/auth.service", () => ({
    authService: { createUser: jest.fn() }
}));

// Mock components
jest.mock("@/components/admin/ui/FormInput", () => {
    const { TextInput } = require('react-native');
    return {
        FormInput: ({ label, value, onChangeText, placeholder }: any) => (
            <TextInput testID={`input-${label}`} value={value} onChangeText={onChangeText} placeholder={placeholder} />
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

describe("CreateTeacher", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates teacher account successfully", async () => {
        (authService.createUser as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<CreateTeacher />);

        fireEvent.changeText(getByTestId("input-Full Name"), "Jane Doe");
        fireEvent.changeText(getByTestId("input-Email Address"), "jane@example.com");

        fireEvent.press(getByText("Create Teacher"));

        await waitFor(() => {
            expect(authService.createUser).toHaveBeenCalledWith(expect.objectContaining({
                name: "Jane Doe",
                email: "jane@example.com",
                role: "TEACHER",
                institutionId: "inst1",
                password: "Teachora@123"
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", expect.stringContaining("Teacher created successfully"), expect.any(Array));
        });
    });
});
