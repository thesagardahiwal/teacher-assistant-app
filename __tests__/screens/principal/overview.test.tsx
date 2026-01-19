import Overview from "@/app/(principal)/overview";
import { render } from "@testing-library/react-native";
import React from "react";

describe("Principal Overview", () => {
    it("renders correctly", () => {
        const { getByText } = render(<Overview />);
        expect(getByText("Overview")).toBeTruthy();
    });
});
