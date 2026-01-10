import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Institution } from "./institution.type";
import { Subject } from "./subject.type";
import { User } from "./user.type";

export interface TeacherAssignment extends Models.Document {
    $id: string;
    teacher: string | User;     // relationship
    subject: string | Subject;
    class: string | Class;
    institution: Institution; // Institution ID
    createdAt: string;
    updatedAt: string;
}


export interface TeacherAssignmentPayload extends Models.Document {
    $id: string;
    teacher: string | User;     // relationship
    subject: string | Subject;
    class: string | Class;
    institution: string; // Institution ID
    createdAt: string;
    updatedAt: string;
}
