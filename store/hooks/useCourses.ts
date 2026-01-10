import { useAppDispatch, useAppSelector } from "../hooks";
import { createCourse, fetchCourses } from "../slices/course.slice";

export const useCourses = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.courses);

  return {
    ...state,
    fetchCourses: (institutionId: string) =>
      dispatch(fetchCourses(institutionId)),
    createCourse: (data: any) => dispatch(createCourse(data)),
  };
};
