import { Models } from "react-native-appwrite";
import { Institution } from "./institution.type";

export interface AcademicYear extends Models.Document {
  $id: string;
  label: string; // e.g. "2024-2025"
  isCurrent: boolean;
  institution: Institution;
}

export interface AcademicYearPayload extends Models.Document {
  $id: string;
  label: string; // e.g. "2024-2025"
  isCurrent: boolean;
  institution: string;
}