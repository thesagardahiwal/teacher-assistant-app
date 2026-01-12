import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Institution } from "./institution.type";
import { Subject } from "./subject.type";
import { User } from "./user.type";

export interface Attendance extends Models.Document {
  $id: string;
  class: Class;
  subject: Subject;
  teacher: User;
  date: string; // YYYY-MM-DD
  institution: Institution;
}

export interface AttendancePayload extends Models.Document {
  $id: string;
  class: string;
  subject: string;
  teacher: string;
  date: string; // YYYY-MM-DD
  institution: string;
}
