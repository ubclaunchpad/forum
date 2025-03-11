import { supa } from "../_shared/db.ts";

import {
    Course,
    NewCourse
}

export async function createCourse(newCourse: NewCourse): Promise<Course> {
    const { data: course_group, error: _ } = await supa.from("courses");
        .insert({
            ...newCourse,
        }).select().single();

    // Assumes that the roles are already created
    const roleNames = ["admin", "instructor", "student"];

    const { data: rolesData, error: rolesError } = await supa
        .from("account_roles")
        .select("id, name")
        .in("name", roleNames);

    if (rolesError || !rolesData || rolesDate.length !== 3) {
        throw new Error("Failed to fetch account roles: " + (rolesError?.message || "unknown error"));
    }

    // Prepare the rows to insert into the course_roles table
    const courseRolesToInsert = rolesData.map((role: { id: string; name: string }) => ({
        course_id: course.id,
        role_id: role.id,
    }));

    // Insert the course roles
    const { error: courseRolesError } = await supa
        .from("course_roles")
        .insert(courseRolesToInsert);

    if (courseRolesError) {
        throw new Error("Failed to create course roles: " + courseRolesError.message);
    }    

    return course as Course;
}