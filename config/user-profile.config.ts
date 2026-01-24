export type FieldType = 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date';

export interface FieldOption {
    label: string;
    value: string | number;
}

export interface ProfileFieldConfig {
    name: string; // Key in the data object
    label: string;
    type: FieldType;
    editable: boolean;
    required?: boolean;
    options?: FieldOption[]; // For 'select' type
    placeholder?: string;
    section?: string; // To group fields
}

export const AdminTeacherProfileConfig: ProfileFieldConfig[] = [
    { name: 'name', label: 'Full Name', type: 'text', editable: true, required: true, section: 'Basic Details' },
    { name: 'email', label: 'Email Address', type: 'email', editable: true, required: true, section: 'Basic Details' },
    { name: 'department', label: 'Department', type: 'text', editable: true, section: 'Professional Details' },
    { name: 'designation', label: 'Designation', type: 'text', editable: true, section: 'Professional Details' },
    { name: 'phone', label: 'Phone Number', type: 'phone', editable: true, section: 'Contact Information' },
    { name: 'address', label: 'Address', type: 'textarea', editable: true, section: 'Contact Information' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'text', editable: true, section: 'Personal Details' },
    // Read Only / System Fields could be added here if needed to be shown
];

export const TeacherSelfProfileConfig: ProfileFieldConfig[] = [
    { name: 'name', label: 'Full Name', type: 'text', editable: true, required: true, section: 'Basic Details' },
    { name: 'email', label: 'Email Address', type: 'email', editable: false, section: 'Basic Details' }, // Often email is locked for self-edit
    { name: 'department', label: 'Department', type: 'text', editable: false, section: 'Professional Details' },
    { name: 'designation', label: 'Designation', type: 'text', editable: false, section: 'Professional Details' },
    { name: 'phone', label: 'Phone Number', type: 'phone', editable: true, section: 'Contact Information' },
    { name: 'address', label: 'Address', type: 'textarea', editable: true, section: 'Contact Information' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'text', editable: true, section: 'Personal Details' },
];

export const StudentProfileConfig: ProfileFieldConfig[] = [
    { name: 'name', label: 'Full Name', type: 'text', editable: false, section: 'Basic Details' },
    { name: 'email', label: 'Email Address', type: 'email', editable: true, required: true, section: 'Basic Details' },
    { name: 'phone', label: 'Phone Number', type: 'phone', editable: true, section: 'Contact Information' },
    { name: 'address', label: 'Address', type: 'textarea', editable: true, section: 'Contact Information' },
    { name: 'bloodGroup', label: 'Blood Group', type: 'text', editable: true, section: 'Personal Details' },
    // Academic Fields (Read Only)
    { name: 'rollNumber', label: 'Roll Number', type: 'text', editable: false, section: 'Academic Information' },
    { name: 'currentYear', label: 'Current Year', type: 'text', editable: false, section: 'Academic Information' },
    { name: 'institution.name', label: 'Institution', type: 'text', editable: false, section: 'Academic Information' },
    { name: 'course.name', label: 'Course', type: 'text', editable: false, section: 'Academic Information' },
    { name: 'class.name', label: 'Class', type: 'text', editable: false, section: 'Academic Information' },
    { name: 'PRN', label: 'PRN', type: 'text', editable: false, section: 'Academic Information' },
    { name: 'seatNumber', label: 'Seat Number', type: 'text', editable: false, section: 'Academic Information' },
];
