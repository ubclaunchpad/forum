import { supa } from "../_shared/db.ts";

import {
    Course
}

export async function getCourse(course_id: str): Promise<List<Course>> {
    const { data: course, error: _ } = await supa.from("courses")
        .select("*").eq("id", course_id);

  if (!data || data.length === 0) {
    throw new NotFoundError("Course not found");
  }
  
  return data[0] as User;
}

