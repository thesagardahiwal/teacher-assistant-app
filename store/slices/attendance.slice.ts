import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Query } from "react-native-appwrite";
import { attendanceService } from "../../services";
import { Attendance } from "../../types";

interface AttendanceState {
    data: Attendance[];
    loading: boolean;
    error: string | null;
}

const initialState: AttendanceState = {
    data: [],
    loading: false,
    error: null,
};

export const fetchAttendance = createAsyncThunk(
    "attendance/fetch",
    async ({ institutionId, teacherId }: { institutionId: string, teacherId?: string }) => {
        const queries = [];
        if (teacherId) {
            queries.push(Query.equal("teacher", teacherId));
        }
        // Sort by date desc
        queries.push(Query.orderDesc("date"));

        const res = await attendanceService.list(institutionId, queries);
        return res.documents;
    }
);

const attendanceSlice = createSlice({
    name: "attendance",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAttendance.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAttendance.rejected, (state) => {
                state.loading = false;
                state.error = "Failed to load attendance";
            });
    },
});

export default attendanceSlice.reducer;
