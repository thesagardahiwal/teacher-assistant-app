import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchTeachers } from "../slices/teacher.slice";

export const useTeachers = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.teachers);

  return {
    ...state,
    fetchTeachers: (institutionId: string) =>
      dispatch(fetchTeachers(institutionId)),
  };
};
