import { supa } from "../../_shared/db.ts";
import {
    Course
} from "@shared/schema/course.ts";
import { NotFoundError } from "../../_shared/errors.ts";

// get course by course ID
export async function getCourse(course_id: string): Promise<Course> {
    const { data: course, error: _ } = await supa.from("courses")
        .select("*").eq("id", course_id).single();

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    return course as Course;
}

// get courses by user ID
export async function getCourses(user_id: string): Promise<[]Course > {
    const { data: courses, error: _ } = await supa.from("courses")
        .select("*").eq("id", user_id).all();

    if(len(courses) === 0) {
        throw new NotFoundError("Courses not found");
    };

    return courses as []Course;
}