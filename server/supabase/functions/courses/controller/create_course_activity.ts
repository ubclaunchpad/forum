import { supa } from "../../_shared/db.ts";

import { Course, NewCourse } from "@shared/mod.ts";

export async function createCourse(
  newCourse: NewCourse,
  userId: string,
): Promise<Course> {
  const { data: course, error: courseError } = await supa.from("courses")
    .insert({
      ...newCourse,
    }).select().single();

  if (courseError) {
    throw new Error("Failed to create course: " + courseError.message);
  }

  console.log(userId);

  console.log("course", course);

  // Assumes that the roles are already created
  const roleNames = ["instructor", "staff", "student"];

  const { data: rolesData, error: rolesError } = await supa
    .from("account_roles")
    .select("id, name")
    .in("name", roleNames);

  if (rolesError || !rolesData || rolesData.length !== 3) {
    throw new Error(
      "Failed to fetch account roles: " +
        (rolesError?.message || "unknown error"),
    );
  }

  const courseRolesToInsert = rolesData.map((
    role: { id: string; name: string },
  ) => ({
    course_id: course.id,
    role_id: role.id,
  }));

  const { error: courseRolesError } = await supa
    .from("course_roles")
    .insert(courseRolesToInsert);

  if (courseRolesError) {
    throw new Error(
      "Failed to create course roles: " + courseRolesError.message,
    );
  }

  const { data: instructorRoleData, error: instructorRoleError } = await supa
    .from("account_roles")
    .select("id")
    .eq("name", "instructor")
    .single();

  if (instructorRoleError || !instructorRoleData) {
    throw new Error(
      "Failed retrieving instructor role, which was expected to succeed" + 
      (instructorRoleError?.message || "Retrieved nothing")
    );
  }

  const { error } = await supa.from("course_members").insert({
    course_id: course.id,
    user_id: userId,
    role_id: instructorRoleData.id
  });
  if (error) {
    throw new Error("Failed to create course member: " + error.message);
  }

  const { data: courseMember, error: courseMemberError } = await supa
    .from("course_members")
    .select("*")
    .eq("course_id", course.id)
    .eq("user_id", userId);

  if (courseMemberError) {
    throw new Error(
      "Failed to get course member: " + courseMemberError.message,
    );
  }
  console.log("courseMember", courseMember);

  return course as Course;
}

export async function deleteCourse(courseId: string) {
  const { error } = await supa.from("courses").delete().eq("id", courseId);
  if (error) {
    throw new Error("Failed to delete course: " + error.message);
  }
}

export async function getAllCourses() {
  const { data, error } = await supa.from("courses").select("*");
  if (error) {
    throw new Error("Failed to get all courses: " + error.message);
  }
  return data;
}
