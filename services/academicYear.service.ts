import { Query } from "react-native-appwrite";
import { AcademicYear, AcademicYearPayload } from "../types/academic-year.type";
import { COLLECTIONS } from "./appwrite/collections";
import { databaseService } from "./appwrite/database.service";

export const academicYearService = {
  list(institutionId: string) {
    return databaseService.list<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      [Query.equal("institution", institutionId), Query.select(["*", "institution.*"])]
    );
  },

  get(id: string) {
    return databaseService.get<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      id,
      [Query.select(["*", "institution.*"])]
    );
  },

  create(data: Partial<AcademicYearPayload>) {
    return databaseService.create<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      data
    );
  },

  update(id: string, data: Partial<AcademicYearPayload>) {
    return databaseService.update<AcademicYear>(
      COLLECTIONS.ACADEMIC_YEARS,
      id,
      data as any
    );
  },

  delete(id: string) {
    return databaseService.delete(
      COLLECTIONS.ACADEMIC_YEARS,
      id
    );
  },
};
