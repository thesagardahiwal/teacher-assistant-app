import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchClasses, fetchClassesByTeacher } from "../slices/class.slice";

export const useClasses = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.classes);

  return {
    ...state,
    fetchClasses: (institutionId: string) =>
      dispatch(fetchClasses(institutionId)),
    fetchClassesByTeacher: (institutionId: string, teacherId: string) =>
      dispatch(fetchClassesByTeacher({ institutionId, teacherId })),
  };
};
