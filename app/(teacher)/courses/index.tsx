import { CourseDirectory } from "@/components/directory/CourseDirectory";
import React from "react";

export default function CoursesIndex() {
    return (
        <CourseDirectory
            showAddButton={false}
            readonly={true} // No detail navigation for teacher (as per previous logic)
        />
    );
}
