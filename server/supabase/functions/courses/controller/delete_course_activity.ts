import { supa } from "../../_shared/db.ts";
import { NotFoundError } from '../../_shared/errors.ts';

export async function deleteCourse(courseId: string) {
  const { error } = await supa.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error("Failed to delete course: " + error.message);
  }
}