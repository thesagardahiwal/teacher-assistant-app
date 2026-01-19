import CreateAcademicYear from "@/app/(admin)/academic-years/create";
import { academicYearService } from "@/services/academicYear.service";
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
jest.mock("@/store/hooks/useAcademicYears", () => ({ useAcademicYears: () => ({ fetchAcademicYears: jest.fn() }) }));

jest.mock("@/services/academicYear.service", () => ({
    academicYearService: { create: jest.fn() }
}));

// Mock wrapper components
jest.mock("@/components/admin/ui/FormInput", () => {
    const { TextInput } = require('react-native');
    return {
        FormInput: ({ value, onChangeText, placeholder }: any) => (
            <TextInput testID="label-input" value={value} onChangeText={onChangeText} placeholder={placeholder} />
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

describe("CreateAcademicYear", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders correctly", () => {
        const { getByText, getByTestId } = render(<CreateAcademicYear />);
        expect(getByText("New Academic Year")).toBeTruthy();
        expect(getByTestId("label-input")).toBeTruthy();
    });

    it("creates academic year on submit", async () => {
        (academicYearService.create as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<CreateAcademicYear />);

        fireEvent.changeText(getByTestId("label-input"), "2024-2025");
        fireEvent.press(getByText("Create Academic Year"));

        await waitFor(() => {
            expect(academicYearService.create).toHaveBeenCalledWith({
                label: "2024-2025",
                isCurrent: false,
                institution: "inst1",
            });
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Academic Year created successfully", expect.any(Array));
        });
    });
});
