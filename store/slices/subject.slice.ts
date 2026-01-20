import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { subjectService } from "../../services";
import { Subject, SubjectPayload } from "../../types";

interface SubjectState {
  data: Subject[];
  loading: boolean;
  error: string | null;
}

const initialState: SubjectState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchSubjects = createAsyncThunk(
  "subjects/fetch",
  async (institutionId: string) => {
    const res = await subjectService.list(institutionId);
    return res.documents;
  }
);

export const fetchSubjectsByTeacher = createAsyncThunk(
  "subjects/fetchByTeacher",
  async ({ institutionId, teacherId }: { institutionId: string; teacherId: string }) => {
    const res = await subjectService.listByTeacher(institutionId, teacherId);
    return res.documents;
  }
);

export const createSubject = createAsyncThunk(
  "subjects/create",
  async (data: Partial<SubjectPayload>) => {
    return await subjectService.create(data);
  }
);

const subjectSlice = createSlice({
  name: "subjects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load subjects";
      })
      .addCase(fetchSubjectsByTeacher.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjectsByTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubjectsByTeacher.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load teacher subjects";
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.data.push(action.payload);
      });
  },
});

export default subjectSlice.reducer;
