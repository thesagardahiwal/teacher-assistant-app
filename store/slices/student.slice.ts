import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { studentService } from "../../services";
import { Student, StudentPayload } from "../../types";

interface StudentState {
  data: Student[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchStudents = createAsyncThunk(
  "students/fetch",
  async (institutionId: string) => {
    const res = await studentService.list(institutionId);
    return res.documents;
  }
);

export const createStudent = createAsyncThunk(
  "students/create",
  async (data: Partial<StudentPayload>) => {
    return await studentService.create(data);
  }
);

const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStudents.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load students";
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.data.push(action.payload);
      });
  },
});

export default studentSlice.reducer;
