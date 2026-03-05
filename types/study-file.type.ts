export interface StudyFile {
    id: string;              // UUID
    fileName: string;        // "math_notes.pdf"
    fileType: string;        // "pdf", "jpg"
    localPath: string;       // relative path e.g., "study_vault/uuid.pdf" (sandbox relative)
    fileSize: number;        // bytes
    addedByRole: "TEACHER" | "STUDENT" | "ADMIN" | "PRINCIPAL" | "VICE_PRINCIPAL";
    addedAt: string;         // ISO timestamp
    tags: string[];          // ["math", "homework"]

    // Optional linkages
    subjectId?: string;
    classId?: string;
}
