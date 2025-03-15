import { supa } from "../../_shared/db.ts";
import { Course } from "@shared/schema/course.ts";
import { NotFoundError } from "../../_shared/errors.ts";
import { UpdateCourseReq } from "@shared/schema/course.ts";

export async function updateCourse(createCourseReq: UpdateCourseReq, course_id: string) {
    let course = await getCourse(course_id);

    const { id, ...updatedCourse } = { ...course, ...createCourseReq }; 

    const { error: updateError } = await supa.from("courses").update(updatedCourse).eq("id", course_id);

    if (updateError) {
        throw new Error(`Failed to update course: ${updateError.message}`);
    }
}

async function getCourse(course_id: string): Promise<Course> {
    const { data: course, error } = await supa.from("courses").select('*').eq('id', course_id);

    if (error) {
        throw new Error(`Failed to get course ${course_id}: ${error.message}`);
    }

    if (!course || course.length === 0) {
        throw new NotFoundError(`Course with id ${course_id} not found`);
    }

    return course[0] as Course;
}
