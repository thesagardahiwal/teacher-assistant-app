import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { assignmentService } from "../../services/admin";
import { TeacherAssignment, TeacherAssignmentPayload } from "../../types";

interface AssignmentState {
  data: TeacherAssignment[];
  loading: boolean;
  error: string | null;
}

const initialState: AssignmentState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchAssignments = createAsyncThunk(
  "assignments/fetch",
  async (institutionId: string) => {
    const res = await assignmentService.list(institutionId);
    return res.documents;
  }
);

export const createAssignment = createAsyncThunk(
  "assignments/create",
  async (data: Partial<TeacherAssignmentPayload>) => {
    return await assignmentService.create(data);
  }
);

export const deleteAssignment = createAsyncThunk(
  "assignments/delete",
  async (assignmentId: string) => {
    await assignmentService.delete(assignmentId);
    return assignmentId;
  }
);

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (a) => a.$id !== action.payload
        );
      });
  },
});

export default assignmentSlice.reducer;
