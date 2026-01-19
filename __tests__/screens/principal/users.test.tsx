import Users from "@/app/(principal)/users";
import { render } from "@testing-library/react-native";
import React from "react";

describe("Principal Users", () => {
    it("renders correctly", () => {
        const { getByText } = render(<Users />);
        expect(getByText("Users")).toBeTruthy();
    });
});
