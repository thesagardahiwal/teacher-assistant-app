import CreateStudent from "@/app/(admin)/students/create";
import { studentService } from "@/services";
import { authService } from "@/services/appwrite/auth.service";
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

jest.mock("@/store/hooks/useStudents", () => ({ useStudents: () => ({ fetchStudents: jest.fn() }) }));
jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ data: [{ $id: "c1", name: "Course1" }], fetchCourses: jest.fn() }) }));
jest.mock("@/store/hooks/useClasses", () => ({ useClasses: () => ({ data: [{ $id: "cl1", course: { $id: "c1" }, academicYear: { label: "2024" } }], fetchClasses: jest.fn() }) }));

jest.mock("@/services", () => ({
    studentService: { create: jest.fn() }
}));
jest.mock("@/services/appwrite/auth.service", () => ({
    authService: { createUser: jest.fn() }
}));

// Mock components
jest.mock("@/components/admin/ui/FormInput", () => {
    const { TextInput } = require('react-native');
    return {
        FormInput: ({ label, value, onChangeText, placeholder }: any) => (
            <TextInput testID={`input-${label}`} value={value} onChangeText={onChangeText} placeholder={placeholder} />
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
    const { Text } = require('react-native');
    return { PageHeader: ({ title }: any) => <Text>{title}</Text> };
});

const mockBack = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({ back: mockBack }),
}));

jest.spyOn(Alert, 'alert');

describe("CreateStudent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates student account and document", async () => {
        (authService.createUser as jest.Mock).mockResolvedValue({ $id: "u1" });
        (studentService.create as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<CreateStudent />);

        fireEvent.changeText(getByTestId("input-Full Name"), "John Doe");
        fireEvent.changeText(getByTestId("input-Email Address"), "john@example.com");
        fireEvent.changeText(getByTestId("input-Roll Number"), "101");

        fireEvent.press(getByTestId("select-Course")); // Select c1
        fireEvent.press(getByTestId("select-Class")); // Select cl1

        fireEvent.press(getByText("Create Student"));

        await waitFor(() => {
            expect(authService.createUser).toHaveBeenCalledWith(expect.objectContaining({
                name: "John Doe",
                email: "john@example.com",
                role: "STUDENT",
                institutionId: "inst1"
            }));
            expect(studentService.create).toHaveBeenCalledWith(expect.objectContaining({
                rollNumber: "101",
                userId: "u1",
                class: "cl1",
                institution: "inst1"
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", expect.stringContaining("Student created successfully"), expect.any(Array));
        });
    });
});
