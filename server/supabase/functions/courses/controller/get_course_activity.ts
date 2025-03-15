import { supa } from "../../_shared/db.ts";
import {
    Course
} from "@shared/schema/course.ts";
import { NotFoundError } from "../../_shared/errors.ts";

// get course by course ID
export async function getCourse(course_id: string): Promise<Course> {
    const { data: course, error: courseError } = await supa.from("courses")
        .select("*").eq("id", course_id);

    if (courseError) {
        throw new Error(`Database error when retrieving course with id ${course_id}: ${courseError.message}`);
    }

    if (!course || course.length === 0) {
        throw new NotFoundError("Course not found");
    }

    return course[0] as Course;
}