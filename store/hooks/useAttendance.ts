import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAttendance } from "../slices/attendance.slice";

export const useAttendance = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector((s) => s.attendance);

    return {
        ...state,
        fetchAttendance: (institutionId: string, teacherId?: string) =>
            dispatch(fetchAttendance({ institutionId, teacherId })),
    };
};
