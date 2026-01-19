import ProfileScreen from "@/app/(teacher)/profile";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
const mockUpdateProfile = jest.fn();
// Stable user object
const mockUser = { $id: "u1", name: "Test User", email: "test@test.com", department: "Math", designation: "Teacher" };
jest.mock("@/store/hooks/useAuth", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: jest.fn(),
        updateProfile: mockUpdateProfile
    })
}));

jest.spyOn(Alert, 'alert');

describe("ProfileScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("displays user info and allows editing", async () => {
        mockUpdateProfile.mockResolvedValue({});
        const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

        expect(getByText("Test User")).toBeTruthy();
        expect(getByText("Math")).toBeTruthy();

        // Enable Edit
        fireEvent.press(getByText("Edit Profile Details"));

        // Change text and verify it changed
        const deptInput = getByPlaceholderText("Enter Department");
        fireEvent.changeText(deptInput, "Science");

        // Ensure state update
        expect(deptInput.props.value).toBe("Science");

        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith("u1", expect.objectContaining({
                department: "Science"
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Profile updated successfully");
        });
    });
});
