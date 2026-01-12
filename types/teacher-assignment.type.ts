import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Institution } from "./institution.type";
import { Subject } from "./subject.type";
import { User } from "./user.type";

export interface TeacherAssignment extends Models.Document {
    $id: string;
    teacher: User;     // relationship
    subject: Subject;
    class: Class;
    institution: Institution; // Institution ID
}


export interface TeacherAssignmentPayload extends Models.Document {
    $id: string;
    teacher: string;     // relationship
    subject: string;
    class: string;
    institution: string; // Institution ID
}
