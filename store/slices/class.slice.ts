import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { classService } from "../../services";
import { Class } from "../../types";

export const fetchClasses = createAsyncThunk(
  "classes/fetch",
  async (institutionId: string) => {
    const res = await classService.list(institutionId);
    return res.documents;
  }
);

export const fetchClassesByTeacher = createAsyncThunk(
  "classes/fetchByTeacher",
  async ({ institutionId, teacherId }: { institutionId: string; teacherId: string }) => {
    const res = await classService.listByTeacher(institutionId, teacherId);
    return res.documents;
  }
);

const classSlice = createSlice({
  name: "classes",
  initialState: { data: [] as Class[], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchClasses.fulfilled, (s, a) => {
      s.data = a.payload;
    })
      .addCase(fetchClassesByTeacher.fulfilled, (s, a) => {
        s.data = a.payload;
      });
  },
});

export default classSlice.reducer;
