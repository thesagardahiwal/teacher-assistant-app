import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Course } from "./course.type";
import { Institution } from "./institution.type";

export interface Student extends Models.Document {
    $id: string;
    name: string;
    rollNumber: string;
    course: Course;
    class: Class;
    currentYear: number;
    isActive: boolean;
    email?: string;
    institution: Institution; // Institution ID
}


export interface StudentPayload extends Models.Document {
    $id: string;
    name: string;
    rollNumber: string;
    course: string;
    class: string;
    currentYear: number;
    isActive: boolean;
    institution: string; // Institution ID
}
