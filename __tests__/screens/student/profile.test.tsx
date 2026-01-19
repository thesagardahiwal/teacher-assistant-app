import ProfileScreen from "@/app/(student)/profile";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));

const mockLogout = jest.fn();
const mockUser = { $id: "u2", name: "Student User", email: "student@test.com", institution: { name: "Test Inst" } };

jest.mock("@/store/hooks/useAuth", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout,
    })
}));

jest.mock("expo-router", () => ({
    Link: ({ children }: any) => <>{children}</>,
    Stack: { Screen: () => null },
    useRouter: () => ({ replace: jest.fn() }),
}));

describe("Student ProfileScreen", () => {
    it("displays user info and logout", async () => {
        const { getByText } = render(<ProfileScreen />);

        expect(getByText("Student User")).toBeTruthy();
        expect(getByText("student@test.com")).toBeTruthy();
        expect(getByText("Test Inst")).toBeTruthy();

        fireEvent.press(getByText("Log Out"));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});
