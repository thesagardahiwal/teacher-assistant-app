import EditSubject from "@/app/(admin)/subjects/[id]";
import { subjectService } from "@/services";
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
jest.mock("@/store/hooks/useSubjects", () => ({ useSubjects: () => ({ fetchSubjects: jest.fn() }) }));
jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ data: [{ $id: "c1", name: "Course1", code: "C1" }], fetchCourses: jest.fn() }) }));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "s1" }),
}));

jest.mock("@/services", () => ({
    subjectService: {
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

describe("EditSubject", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (subjectService.get as jest.Mock).mockResolvedValue({
            $id: "s1",
            name: "Subject 1",
            code: "S1",
            semester: 1,
            course: { $id: "c1" }
        });
    });

    it("loads data and updates successfully", async () => {
        (subjectService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<EditSubject />);

        await waitFor(() => getByText("Edit Subject"));
        expect(getByTestId("input-Subject Name").props.value).toBe("Subject 1");

        fireEvent.changeText(getByTestId("input-Subject Name"), "Subject Modified");
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(subjectService.update).toHaveBeenCalledWith("s1", expect.objectContaining({
                name: "Subject Modified",
                code: "S1",
                semester: 1,
                course: "c1"
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Subject updated successfully");
        });
    });
});
