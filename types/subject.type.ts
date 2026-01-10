import { Models } from "react-native-appwrite";
import { Course } from "./course.type";
import { Institution } from "./institution.type";

export interface Subject extends Models.Document {
    $id: string;
    name: string;
    code: string;
    course: string | Course;   // relationship
    year: number;
    semester: number;
    institution: Institution;
    createdAt: string;
    updatedAt: string;
}


export interface SubjectPayload extends Models.Document {
    $id: string;
    name: string;
    code: string;
    course: string | Course;   // relationship
    year: number;
    semester: number;
    institution: string;
    createdAt: string;
    updatedAt: string;
}