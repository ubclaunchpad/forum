import { supa } from "../../_shared/db.ts";

import { Course, NewCourse } from "@shared/mod.ts";
import { NotFoundError, InputValidationError } from '../../_shared/errors.ts';

export async function createCourse(
  newCourse: NewCourse,
  userId: string,
): Promise<Course> {
  const { data: course, error: courseError } = await supa.from("courses")
    .insert({
      ...newCourse,
    }).select().single();

  if (courseError) {
    throw new InputValidationError("Failed to create course: " + courseError.message);
  }

  console.log(userId);

  console.log("course", course);

  await createCourseRoles(course.id);

  await addInstructorToCourse(course.id, userId);

  return course as Course;
}

async function createCourseRoles(courseId: string) {
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
    course_id: courseId,
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
}

async function addInstructorToCourse(courseId: string, userId: string) {
  const { data: instructorRoleData, error: instructorRoleError } = await supa
    .from("account_roles")
    .select("id")
    .eq("name", "instructor")
    .single();

  if (instructorRoleError || !instructorRoleData) {
    throw new NotFoundError(
      "Failed retrieving instructor role: " + 
      (instructorRoleError?.message || "Retrieved nothing")
    );
  }

  const { data: instructorData, error: instructorError } = await supa
    .from("course_members")
    .insert({
      course_id: courseId,
      user_id: userId,
      role_id: instructorRoleData.id
    })
    .select()
    .single();

  if (instructorError) {
    throw new NotFoundError("Failed to associate user " + userId + " with course: " + instructorError.message);
  }
}