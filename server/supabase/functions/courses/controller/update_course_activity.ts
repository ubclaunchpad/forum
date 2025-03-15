import { supa } from "../../_shared/db.ts";
import { Course } from "@shared/schema/course.ts";
import { NotFoundError } from "../../_shared/errors.ts";
import { UpdateCourseReq } from "@shared/schema/course.ts";
import { v4 as uuidv4 } from "uuid";

export async function updateCourse(createCourseReq: UpdateCourseReq, course_id: string): Promise<Course | null> {
    const client = supa.from('courses');
    try {
        const { data: course, error } = await client.select('*').eq('id', course_id).single();
        if (error || !course) {
            throw new NotFoundError("Course not found");
        }

        const updateDict = createCourseReq.model_dump({ exclude_unset: true });

        if (updateDict.config) {
            updateDict.config = JSON.stringify(updateDict.config);
        }

        const { data: updatedCourse, error: updateError } = await client.update(updateDict).eq('id', course_id).single();
        if (updateError) {
            throw new Error(`Failed to update course: ${updateError.message}`);
        }

        return updatedCourse;
    } catch (e) {
        throw new Error(`Failed to update course: ${e.message}`);
    }
}
