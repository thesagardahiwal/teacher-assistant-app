import { Models } from "react-native-appwrite";
import { AcademicYear } from "./academic-year.type";
import { Course } from "./course.type";
import { Institution } from "./institution.type";

export interface Class extends Models.Document {
    $id: string;
    course: Course;         // relationship
    academicYear: AcademicYear;
    name: string;
    semester: number;
    institution: Institution;
}


export interface ClassPayload extends Models.Document {
    $id: string;
    academicYear: string;
    semester: number;                // 1–8
    institution: string;
    course: string;
    name: string;
}
