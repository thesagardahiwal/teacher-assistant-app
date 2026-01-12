import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { academicYearService } from "../../services";
import { AcademicYear } from "../../types";

const initialState = {
  data: [] as AcademicYear[],
  loading: false,
  error: null as string | null,
};

export const fetchAcademicYears = createAsyncThunk(
  "academicYears/fetch",
  async (institutionId: string) => {
    const res = await academicYearService.list(institutionId);
    return res.documents;
  }
);

const academicYearSlice = createSlice({
  name: "academicYears",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAcademicYears.fulfilled, (s, a) => {
      s.data = a.payload;
    });
  },
});

export default academicYearSlice.reducer;
