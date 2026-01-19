import CreateSchedule from "@/app/(admin)/schedules/create";
import academicYearReducer from "@/store/slices/academicYear.slice"; // Assuming this exists
import authReducer from "@/store/slices/auth.slice";
import classReducer from "@/store/slices/class.slice"; // Assuming this exists or mocking it
import subjectReducer from "@/store/slices/subject.slice"; // Assuming this exists or mocking it
import teacherReducer from "@/store/slices/teacher.slice"; // Assuming this exists or mocking it
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react-native";
import { Provider } from "react-redux";

// Mock the store
const store = configureStore({
    reducer: {
        auth: authReducer,
        teachers: teacherReducer, // Add other reducers as needed by the screen
        classes: classReducer,
        subjects: subjectReducer,
        academicYears: academicYearReducer
    },
});

jest.mock("@/utils/useInstitutionId", () => ({
    useInstitutionId: () => "inst1",
}));

describe("CreateSchedule Screen", () => {
    it("renders form", () => {
        const { getByText } = render(
            <Provider store={store}>
                <CreateSchedule />
            </Provider>
        );
        expect(getByText("Create Schedule")).toBeTruthy();
    });

    it("shows error if submit empty", () => {
        const { getByText } = render(
            <Provider store={store}>
                <CreateSchedule />
            </Provider>
        );
        fireEvent.press(getByText("Create Schedule"));
        expect(getByText("Please fill all fields")).toBeTruthy();
    });
});
