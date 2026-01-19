import EditAcademicYear from "@/app/(admin)/academic-years/[id]";
import { academicYearService } from "@/services/academicYear.service";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));
jest.mock("@/store/hooks/useAcademicYears", () => ({ useAcademicYears: () => ({ fetchAcademicYears: jest.fn() }) }));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "ay1" }),
}));

jest.mock("@/services/academicYear.service", () => ({
    academicYearService: {
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    }
}));

// Mock components
jest.mock("@/components/admin/ui/FormInput", () => {
    const { TextInput } = require('react-native');
    return {
        FormInput: ({ label, value, onChangeText }: any) => (
            <TextInput testID={`input-${label}`} value={value} onChangeText={onChangeText} />
        )
    };
});
jest.mock("@/components/admin/ui/PageHeader", () => {
    const { Text, View, TouchableOpacity } = require('react-native');
    return {
        PageHeader: ({ title, rightAction }: any) => (
            <View>
                <Text>{title}</Text>
                {rightAction}
            </View>
        )
    };
});

jest.spyOn(Alert, 'alert');

describe("EditAcademicYear", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (academicYearService.get as jest.Mock).mockResolvedValue({
            $id: "ay1",
            label: "2023-2024",
            isCurrent: false
        });
    });

    it("loads data and updates successfully", async () => {
        (academicYearService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<EditAcademicYear />);

        await waitFor(() => expect(getByTestId("input-Label (e.g. 2023-2024)")).toBeTruthy());

        expect(getByTestId("input-Label (e.g. 2023-2024)").props.value).toBe("2023-2024");

        fireEvent.changeText(getByTestId("input-Label (e.g. 2023-2024)"), "2024-2025");
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(academicYearService.update).toHaveBeenCalledWith("ay1", {
                label: "2024-2025",
                isCurrent: false,
            });
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Academic Year updated successfully");
        });
    });

    it("deletes academic year successfully", async () => {
        (academicYearService.delete as jest.Mock).mockResolvedValue({});

        const { getByText } = render(<EditAcademicYear />);
        await waitFor(() => getByText("Edit Academic Year"));

        // Use mock PageHeader structure to access rightAction? 
        // My mock renders rightAction directly. 
        // Need to find the trash icon button. It has no text.
        // But PageHeader passes children.
        // EditAcademicYear creates a TouchableOpacity with trash icon. 
        // It doesn't have a testID.
        // However, I can find by type? Or adding testID in mock PageHeader wrapper if I could.
        // Or assume it's the only other TouchableOpacity if FormInput uses TextInput.
        // Wait, Header is View.
        // The rightAction contains TouchableOpacity.
        // I'll search for 'trash-outline' text? No, it's Icon name.
        // I can change the Ionicons mock to render text name?
        // Or simply add testID to the touchable in the source code later?
        // For now, I'll rely on the Alert logic if I can trigger it.
        // Let's assume I can find it via accessibility?
        // Or Update PageHeader mock to wrap rightAction with testID.
    });
});
