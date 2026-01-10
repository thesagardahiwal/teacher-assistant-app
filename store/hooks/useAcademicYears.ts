import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchAcademicYears } from "../slices/academicYear.slice";

export const useAcademicYears = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.academicYears);

  return {
    ...state,
    fetchAcademicYears: (institutionId: string) =>
      dispatch(fetchAcademicYears(institutionId)),
  };
};
