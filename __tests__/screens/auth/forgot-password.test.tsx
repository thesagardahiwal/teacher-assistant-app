import ForgotPassword from "@/app/(auth)/forgot-password";
import { render } from "@testing-library/react-native";
import React from "react";

describe("ForgotPassword Screen", () => {
    it("renders", () => {
        const { getByText } = render(<ForgotPassword />);
        expect(getByText("ForgotPassword")).toBeTruthy();
    });
});
