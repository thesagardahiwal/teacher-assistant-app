import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { classService } from "../../services/admin";
import { Class } from "../../types";

export const fetchClasses = createAsyncThunk(
  "classes/fetch",
  async (institutionId: string) => {
    const res = await classService.list(institutionId);
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
    });
  },
});

export default classSlice.reducer;
