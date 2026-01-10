import { useAppDispatch, useAppSelector } from "../hooks";
import { createStudent, fetchStudents } from "../slices/student.slice";

export const useStudents = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.students);

  return {
    ...state,
    fetchStudents: (institutionId: string) =>
      dispatch(fetchStudents(institutionId)),
    createStudent: (data: Partial<any>) =>
      dispatch(createStudent(data)),
  };
};
