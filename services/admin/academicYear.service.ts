import { Query } from "react-native-appwrite";
import { AcademicYear } from "../../types";
import { COLLECTIONS } from "../appwrite/collections";
import { databaseService } from "../appwrite/database.service";

export const academicYearService = {
  list(institutionId: string) {
    return databaseService.list<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      [Query.equal("institution", institutionId)]
    );
  },

  create(data: Partial<AcademicYear>) {
    return databaseService.create<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      data
    );
  },

  update(id: string, data: Partial<AcademicYear>) {
    return databaseService.update<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      id,
      data
    );
  },
};
