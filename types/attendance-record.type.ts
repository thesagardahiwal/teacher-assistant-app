import { Models } from "react-native-appwrite";
import { Attendance } from "./attendance.type";
import { Institution } from "./institution.type";
import { Student } from "./student.type";

export interface AttendanceRecord extends Models.Document {
  $id: string;
  attendance: Attendance;
  student: Student;
  present: boolean;
  institution: Institution;
}

export interface AttendanceRecordPayload extends Models.Document {
  $id: string;
  attendance: string;
  student: string;
  present: boolean;
  institution: string;

}
