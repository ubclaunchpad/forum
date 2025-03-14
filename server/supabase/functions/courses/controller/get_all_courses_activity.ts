import { supa } from "../../_shared/db.ts";

export async function getAllCourses() {
  const { data, error } = await supa.from("courses").select("*");
  if (error) {
    throw new Error("Failed to get all courses: " + error.message);
  }
  return data;
}