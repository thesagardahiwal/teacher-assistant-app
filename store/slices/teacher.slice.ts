import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teacherService } from "../../services";
import { User } from "../../types";

interface TeacherState {
  data: User[];
  loading: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchTeachers = createAsyncThunk(
  "teachers/fetch",
  async (institutionId: string) => {
    const res = await teacherService.list(institutionId);
    return res.documents;
  }
);

const teacherSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load teachers";
      });
  },
});

export default teacherSlice.reducer;
