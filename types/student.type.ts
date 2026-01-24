import { Models } from "react-native-appwrite";
import { Class } from "./class.type";
import { Course } from "./course.type";
import { Institution } from "./institution.type";

export interface Student extends Models.Document {
    $id: string;
    name: string;
    rollNumber: string;
    course: Course;
    userId: string;
    class: Class;
    currentYear: number;
    isActive: boolean;
    email: string;
    institution: Institution; // Institution ID
    seatNumber?: string;
    PRN?: string;
    bloodGroup?: string;
    phone?: string;
    address?: string;
}


export interface StudentPayload {
    $id?: string;
    name: string;
    rollNumber: string;
    course: string;
    userId: string;
    class: string;
    currentYear: number;
    isActive: boolean;
    institution: string; // Institution ID
    email: string;
    seatNumber?: string;
    PRN?: string;
    bloodGroup?: string;
    phone?: string;
    address?: string;
}
