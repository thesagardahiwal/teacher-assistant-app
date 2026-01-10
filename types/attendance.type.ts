import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Institution } from "./institution.type";
import { Subject } from "./subject.type";
import { User } from "./user.type";

export interface Attendance extends Models.Document {
  $id: string;
  class: string | Class;
  subject: string | Subject;
  teacher: string | User;
  date: string; // YYYY-MM-DD
  institution: Institution;
  createdAt: string;
  updatedAt: string;
}
