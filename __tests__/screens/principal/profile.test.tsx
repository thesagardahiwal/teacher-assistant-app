import PrincipalProfile from "@/app/(principal)/principal-profile";
import { userService } from "@/services/user.service";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// Mock Hooks
const mockLogout = jest.fn();
const mockUser = {
    $id: "u1",
    name: "Principal User",
    email: "principal@test.com",
    role: "PRINCIPAL",
};

jest.mock("@/store/hooks/useAuth", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout
    }),
}));

jest.mock("@/store/hooks/useTheme", () => ({
    useTheme: () => ({ isDark: false })
}));

jest.mock("@/services/user.service", () => ({
    userService: { update: jest.fn() }
}));

// Mock wrapper components since they might not process props as expected in unit tests without extensive mocking
jest.mock("@/components/admin/ui/FormInput", () => {
    const React = require('react');
    const { TextInput, View, Text } = require('react-native');
    // Simple mock of FormInput
    return {
        FormInput: ({ label, value, onChangeText, editable }: any) => (
            <View>
                <Text>{label}</Text>
                <TextInput
                    testID={`input-${label}`}
                    value={value}
                    onChangeText={onChangeText}
                    editable={editable}
                />
            </View>
        )
    };
});

jest.mock("@/components/admin/ui/PageHeader", () => {
    const React = require('react');
    const { Text } = require('react-native');
    return { PageHeader: ({ title }: any) => <Text>{title}</Text> };
});


const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ replace: mockReplace }),
}));

jest.spyOn(Alert, 'alert');

describe("PrincipalProfile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders profile details", () => {
        const { getByText } = render(<PrincipalProfile />);
        expect(getByText("Principal User")).toBeTruthy();
        expect(getByText("principal@test.com")).toBeTruthy();
        expect(getByText("PRINCIPAL")).toBeTruthy();
    });

    it("toggles edit mode and updates profile", async () => {
        (userService.update as jest.Mock).mockResolvedValue({});
        const { getByText, getByTestId, queryByText } = render(<PrincipalProfile />);

        expect(queryByText("Save Changes")).toBeNull();
        fireEvent.press(getByText("Edit"));
        expect(getByText("Save Changes")).toBeTruthy();

        fireEvent.changeText(getByTestId("input-Full Name"), "Principal Updated");
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(userService.update).toHaveBeenCalledWith("u1", { name: "Principal Updated" });
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Profile updated successfully");
        });
    });

    it("handles logout", () => {
        const { getByText } = render(<PrincipalProfile />);
        fireEvent.press(getByText("Logout"));

        // Check if alert shows up with logout option
        expect(Alert.alert).toHaveBeenCalledWith(
            "Logout",
            "Are you sure you want to logout?",
            expect.any(Array)
        );
    });
});
