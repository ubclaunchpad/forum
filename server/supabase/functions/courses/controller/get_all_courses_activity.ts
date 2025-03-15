import { supa } from "../../_shared/db.ts";
import { Course } from '../../../../../shared/schema/course.ts';

export async function getAllCourses() {
  const { data, error } = await supa.from("courses").select("*");
  if (error) {
    throw new Error(`Database error when retrieving courses: ${error.message}`);
  }
  return data;
}

export async function getUserCourses(user_id: string): Promise<Course[]> {
    const { data: courses, error: coursesError } = await supa.from("course_members")
        .select("courses(*)").eq("user_id", user_id);

    if(coursesError || !courses) {
        throw new Error(`Database error when retrieving courses for user with id ${user_id}: ${coursesError.message}`);
    }

    return courses.flatMap(entry => entry.courses) as Course[];
}