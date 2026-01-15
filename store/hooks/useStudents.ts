import { useAppDispatch, useAppSelector } from "../hooks";
import { createStudent, fetchStudents } from "../slices/student.slice";

export const useStudents = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.students);

  return {
    ...state,
    fetchStudents: (institutionId: string, classIds?: string[]) =>
      dispatch(fetchStudents({ institutionId, classIds })),
    createStudent: (data: Partial<any>) =>
      dispatch(createStudent(data)),
  };
};
