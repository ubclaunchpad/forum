import { supa } from "../../_shared/db.ts";
import {
    Course
} from "@shared/schema/course.ts";
import { NotFoundError } from "../../_shared/errors.ts";

export async function getCourse(course_id: string): Promise<Course> {
    const { data: course, error: _ } = await supa.from("courses")
        .select("*").eq("id", course_id).single();

  if (!course) {
    throw new NotFoundError("Course not found");
  }
  
  return course as Course;
}

