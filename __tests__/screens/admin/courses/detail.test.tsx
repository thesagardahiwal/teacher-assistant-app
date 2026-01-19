import EditCourse from "@/app/(admin)/courses/[id]";
import { courseService } from "@/services/course.service";
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
jest.mock("@/store/hooks/useCourses", () => ({ useCourses: () => ({ fetchCourses: jest.fn() }) }));

jest.mock("expo-router", () => ({
    useRouter: () => ({ back: jest.fn() }),
    useLocalSearchParams: () => ({ id: "c1" }),
}));

jest.mock("@/services/course.service", () => ({
    courseService: {
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

describe("EditCourse", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (courseService.get as jest.Mock).mockResolvedValue({
            $id: "c1",
            name: "Course 1",
            code: "COD",
            durationYears: 3
        });
    });

    it("loads data and updates successfully as Admin", async () => {
        (courseService.update as jest.Mock).mockResolvedValue({});

        const { getByText, getByTestId } = render(<EditCourse />);

        await waitFor(() => getByText("Edit Course"));
        expect(getByTestId("input-Course Name").props.value).toBe("Course 1");

        fireEvent.changeText(getByTestId("input-Course Name"), "Course Updated");
        fireEvent.press(getByText("Save Changes"));

        await waitFor(() => {
            expect(courseService.update).toHaveBeenCalledWith("c1", expect.objectContaining({
                name: "Course Updated",
                code: "COD",
                durationYears: 3
            }));
            expect(Alert.alert).toHaveBeenCalledWith("Success", "Course updated successfully");
        });
    });
});
