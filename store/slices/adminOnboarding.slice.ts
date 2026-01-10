import { createSlice } from "@reduxjs/toolkit";

interface AdminOnboardingState {
  completed: boolean;
}

const initialState: AdminOnboardingState = {
  completed: false,
};

const adminOnboardingSlice = createSlice({
  name: "adminOnboarding",
  initialState,
  reducers: {
    setCompleted(state) {
      state.completed = true;
    },
    reset(state) {
      state.completed = false;
    },
  },
});

export const { setCompleted, reset } =
  adminOnboardingSlice.actions;

export default adminOnboardingSlice.reducer;
