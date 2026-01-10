import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Course } from "./course.type";
import { Institution } from "./institution.type";
import { User } from "./user.type";

export interface Student extends Models.Document {
    $id: string;
    user: User;     // relationship
    rollNumber: string;
    course: Course;
    class: Class;
    currentYear: number;
    isActive: boolean;
    institution: Institution; // Institution ID
    createdAt: string;
    updatedAt: string;
}


export interface StudentPayload extends Models.Document {
    $id: string;
    user: User;     // relationship
    rollNumber: string;
    course: string;
    class: string;
    currentYear: number;
    isActive: boolean;
    institution: string; // Institution ID
    createdAt: string;
    updatedAt: string;
}
