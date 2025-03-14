import { supa } from "../../_shared/db.ts"; 

export async function addUserToCourse(
  course_id: string,
  user_id: string,
  role?: any // TODO: @victor: fix this
): Promise<boolean> { // TODO: @victor: probably good for this function to use one of error handling or return false/true instead of a mix of both
    const { data: course, error: courseError } = await supa.from("courses")
        .select("*").eq("id", course_id).single();

    if (courseError || !course) {
        throw new Error("Course not found");
    }

    if (course.access === "private") {
        throw new Error("Cannot join a private course");
    }

    const { data: user, error: userError } = await supa.from("profiles").select("*").eq("id", user_id).single();

    if (userError || !user) {
        throw new Error("User not found");
    }

    const { data: existingUserCourse } = await supa
        .from("course_members")
        .select("*")
        .eq("course_id", course_id)
        .eq("user_id", user_id)
        .single();

    if (existingUserCourse) {
        throw new Error("User already registered in course");
    }

    // TODO: @victor: check shared/schema/course.ts for notes on how to get this is a more type safe way
    if (!role) {
        role = "student"; // use student by default
    }

    const { data: roleData, error: roleError } = await supa.from("account_roles")
        .select("id")
        .eq("name", role)
        .single();

    if (roleError || !roleData) {
        throw new Error("Role not found: " + (roleError?.message || "No data returned"));
    }

    const { error: joinError } = await supa
        .from("user_courses")
        .insert([{ course_id: course_id, user_id: user_id, role_id: roleData.id }]);

    if (joinError) {
        throw new Error(`Failed to add user to course: ${joinError.message}`);
    }

    return true;
}
