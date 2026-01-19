import EditStudent from "@/app/(admin)/students/[id]";
import { studentService } from "@/services";
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
jest.mock("@/store/hooks/useStudents", () => ({ useStudents: () => ({ fetchStudents: jest.fn() }) }));

jest.mock("@/store/hooks/useCourses", () => ({
    useCourses: () => ({
        data: [{ $id: "c1", name: "Course1", code: "C1" }],
        fetchCourses: jest.fn()
    })
}));

jest.mock("@/store/hooks/useClasses", () => ({
    useClasses: () => ({
        data: [{ $id: "cl1", name: "Class1", course: { $id: "c1" } }],
        fetchClasses: jest.fn()
    })
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "st1" }),
}));

jest.mock("@/services", () => ({
    studentService: {
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
jest.mock("@/components/admin/ui/FormSelect", () => {
    const { TouchableOpacity, Text } = require('react-native');
    return {
        FormSelect: ({ label, onChange, options }: any) => (
            <TouchableOpacity testID={`select-${label}`} onPress={() => options.length > 0 && onChange(options[0].value)}>
                <Text>{label}</Text>
            </TouchableOpacity>
        )
    };
});
jest.mock("@/components/admin/ui/PageHeader", () => {
    const { Text, View } = require('react-native');
    return { PageHeader: ({ title }: any) => <View><Text>{title}</Text></View> };
});

jest.spyOn(Alert, 'alert');

describe("EditStudent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // The component calls get twice: once for student profile, once for user details
        (studentService.get as jest.Mock).mockResolvedValue({
            $id: "st1",
            userId: "u1",
            name: "Student One",
            email: "s1@test.com",
            rollNumber: "101",
            course: { $id: "c1" },
            class: { $id: "cl1" }
        });
    });

    it("loads data and updates successfully as Admin", async () => {
        (studentService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<EditStudent />);

        await waitFor(() => getByText("Edit Student"));

        expect(getByTestId("input-Full Name").props.value).toBe("Student One");

        fireEvent.changeText(getByTestId("input-Full Name"), "Student Modified");
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(studentService.update).toHaveBeenCalledWith("st1", expect.objectContaining({
                rollNumber: "101",
                course: "c1",
                class: "cl1"
            }));
            // It might call update for user name as well if userId is present
            // The mock returns $id="st1".
            // Component sets userId = doc.$id which is "st1" (assuming student ID == User ID in mock structure logic or separate)
            // In component: const userDoc = await studentService.get(doc.$id);
            // So calling get("st1") twice.
            // If userId is present, it calls update(userId, { name }).
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Student updated successfully");
        });
    });
});
