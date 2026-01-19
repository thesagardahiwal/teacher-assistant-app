import Login from "@/app/(auth)/login";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock useAuth hook
const mockLogin = jest.fn();
jest.mock("@/store/hooks/useAuth", () => ({
    useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
    }),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
    useLocalSearchParams: () => ({ type: "teacher" }),
    router: { push: jest.fn(), replace: jest.fn() },
}));

describe("Login Screen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly", () => {
        const { getByText, getByPlaceholderText } = render(<Login />);
        expect(getByText("Teachora")).toBeTruthy();
        expect(getByPlaceholderText("Email")).toBeTruthy();
        expect(getByPlaceholderText("Password")).toBeTruthy();
    });

    it("validates empty inputs", () => {
        const { getByText } = render(<Login />);
        fireEvent.press(getByText("Login"));
        expect(getByText("Please enter both email and password.")).toBeTruthy();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("validates invalid email", () => {
        const { getByText, getByPlaceholderText } = render(<Login />);
        fireEvent.changeText(getByPlaceholderText("Email"), "invalid-email");
        fireEvent.changeText(getByPlaceholderText("Password"), "password123");
        fireEvent.press(getByText("Login"));
        expect(getByText("Please enter a valid email address.")).toBeTruthy();
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("calls login on valid submission", async () => {
        const { getByText, getByPlaceholderText } = render(<Login />);
        fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
        fireEvent.changeText(getByPlaceholderText("Password"), "password123");
        fireEvent.press(getByText("Login"));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123", "teacher");
        });
    });
});
