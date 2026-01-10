import { configureStore } from "@reduxjs/toolkit";
import academicYearReducer from "./slices/academicYear.slice";
import adminOnboardingReducer from "./slices/adminOnboarding.slice";
import assignmentReducer from "./slices/assignment.slice";
import authReducer from "./slices/auth.slice";
import classesReducer from "./slices/class.slice";
import courseReducer from "./slices/course.slice";
import studentReducer from "./slices/student.slice";
import subjectsReducer from "./slices/subject.slice";
import teacherReducer from "./slices/teacher.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    academicYears: academicYearReducer,
    classes: classesReducer,
    subjects: subjectsReducer,
    teachers: teacherReducer,
    students: studentReducer,
    assignments: assignmentReducer,
    adminOnboarding: adminOnboardingReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
