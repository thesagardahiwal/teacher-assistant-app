import Signup from "@/app/(auth)/signup";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

const mockSignUp = jest.fn();

jest.mock("@/store/hooks/useAuth", () => ({
    useAuth: () => ({
        signUp: mockSignUp,
        isLoading: false,
        error: null,
    }),
}));

describe("Signup Screen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders form fields", () => {
        const { getByPlaceholderText, getByText } = render(<Signup />);
        expect(getByPlaceholderText("Full Name")).toBeTruthy();
        expect(getByPlaceholderText("Email")).toBeTruthy();
        expect(getByPlaceholderText("Password")).toBeTruthy();
        expect(getByText("Sign Up")).toBeTruthy();
    });

    it("submits form with correct data", async () => {
        const { getByPlaceholderText, getByText } = render(<Signup />);

        fireEvent.changeText(getByPlaceholderText("Full Name"), "Test User");
        fireEvent.changeText(getByPlaceholderText("Email"), "test@user.com");
        fireEvent.changeText(getByPlaceholderText("Password"), "password");

        fireEvent.press(getByText("Sign Up"));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                name: "Test User",
                email: "test@user.com",
                password: "password",
                institutionId: "",
                role: "ADMIN",
            });
        });
    });
});
