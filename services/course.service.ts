import { Query } from "react-native-appwrite";
import { Course, CoursePayload } from "../types";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const courseService = {
  list(institutionId: string) {
    return databaseService.list<Course>(
      COLLECTIONS.COURSES,
      [Query.equal("institution", institutionId)]
    );
  },

  get(courseId: string) {
    return databaseService.get<Course>(
      COLLECTIONS.COURSES,
      courseId
    );
  },

  create(data: Omit<CoursePayload, keyof CoursePayload | "$id"> & Partial<CoursePayload>) {
    return databaseService.create<Course>(
      COLLECTIONS.COURSES,
      data
    );
  },

  update(courseId: string, data: Partial<CoursePayload>) {
    return databaseService.update<Course>(
      COLLECTIONS.COURSES,
      courseId,
      data
    );
  },

  delete(courseId: string) {
    return databaseService.delete(
      COLLECTIONS.COURSES,
      courseId
    );
  },
};
