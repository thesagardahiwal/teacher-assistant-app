import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { courseService } from "../../services/admin";
import { Course, CoursePayload } from "../../types";

interface CourseState {
  data: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  "courses/fetch",
  async (institutionId: string) => {
    const res = await courseService.list(institutionId);
    return res.documents;
  }
);

export const createCourse = createAsyncThunk(
  "courses/create",
  async (data: Partial<CoursePayload>) => {
    const res = await courseService.create(data);
    return res;
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCourses.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load courses";
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.data.push(action.payload);
      });
  },
});

export default courseSlice.reducer;
