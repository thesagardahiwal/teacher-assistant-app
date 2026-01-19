import EditTeacher from "@/app/(admin)/teachers/[id]";
import { userService } from "@/services/user.service";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

// Mock Hooks
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("@/store/hooks/useTheme", () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock("@/store/hooks/useAuth", () => ({ useAuth: () => ({ user: { role: "ADMIN" } }) }));
jest.mock("@/utils/useInstitutionId", () => ({ useInstitutionId: () => "inst1" }));
jest.mock("@/store/hooks/useTeachers", () => ({ useTeachers: () => ({ fetchTeachers: jest.fn() }) }));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "t1" }),
}));

jest.mock("@/services/user.service", () => ({
    userService: {
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
    const { Text, View } = require('react-native');
    return { PageHeader: ({ title }: any) => <View><Text>{title}</Text></View> };
});

jest.spyOn(Alert, 'alert');

describe("EditTeacher", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (userService.get as jest.Mock).mockResolvedValue({
            $id: "t1",
            name: "Teacher One",
            email: "t1@test.com",
            department: "Math",
            designation: "Prof"
        });
    });

    it("loads data and updates successfully as Admin", async () => {
        (userService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<EditTeacher />);

        await waitFor(() => getByText("Edit Teacher"));
        expect(getByTestId("input-Full Name").props.value).toBe("Teacher One");

        fireEvent.changeText(getByTestId("input-Full Name"), "Teacher Modified");
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(userService.update).toHaveBeenCalledWith("t1", expect.objectContaining({
                name: "Teacher Modified",
                department: "Math",
                designation: "Prof"
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Teacher updated successfully");
        });
    });
});
