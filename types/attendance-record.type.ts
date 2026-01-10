import { Models } from "react-native-appwrite";
import { Attendance } from "./attendance.type";
import { Institution } from "./institution.type";
import { Student } from "./student.type";

export interface AttendanceRecord extends Models.Document {
  $id: string;
  attendance: string | Attendance;
  student: string | Student;
  present: boolean;
  institution: Institution;
  createdAt: string;
  updatedAt: string;

}
