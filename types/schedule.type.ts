import { Models } from "react-native-appwrite";
import { AcademicYear } from "./academic-year.type";
import { Class } from "./class.type";
import { Institution } from "./institution.type";
import { Subject } from "./subject.type";
import { User } from "./user.type";


export interface ClassSchedule extends Models.Document {
    class: Class;
    subject: Subject;
    teacher: User;
    academicYear: AcademicYear;
    dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
    startTime: string;
    endTime: string;
    institution: Institution;
    isActive: boolean;
};

export interface ClassScheduleWithStatus extends ClassSchedule {
    status: 'Previous' | 'Upcoming';
}

export interface ClassSchedulePayload {
    $id: string;
    class: string;
    subject: string;
    teacher: string;
    academicYear: string;
    dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
    startTime: string;
    endTime: string;
    institution: string;
    isActive: boolean;
}