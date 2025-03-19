import { supa } from "../../_shared/db.ts"; 
import { Course, DefaultRoles, studentRole } from '../../../../../shared/schema/course.ts';
import { NotFoundError, PermissionError, InputValidationError } from '../../_shared/errors.ts';

export async function addUserToCourse(
  course_id: string,
  user_id: string,
  role?: DefaultRoles 
) { 
    const course = await getCourse(course_id);

    await checkIfUserExistsAndInCourse(user_id, course_id);

    const roleData = await getRole(role);

    const { error: joinError } = await supa
        .from("course_members")
        .insert([{ 
            course_id: course_id, 
            user_id: user_id, 
            role_id: roleData.id 
        }]);

    if (joinError) {
        throw new Error(`Failed to add user to course: ${joinError.message}`);
    }
}

async function getCourse(course_id: string): Promise<Course> { 
    const { data: course, error: courseError } = await supa.from("courses")
        .select("*").eq("id", course_id);

    if (courseError) {
        throw new Error(`Database error when retrieving course with id ${course_id}: ${courseError.message}`);
    }

    if (!course || course.length !== 1) {
        throw new NotFoundError(`Course with id ${course_id} not found`);
    }

    if (course[0].access === "private") {
        throw new PermissionError("Cannot join a private course");
    }
    
    return course[0] as Course;
}

async function checkIfUserExistsAndInCourse(user_id: string, course_id: string) {
    const { data: user, error: userError } = await supa.from("profiles").select("*").eq("id", user_id);

    if (userError) {
        throw new Error(`Database error when retrieving user with id ${user_id}: ${userError.message}`);
    } 
    if (!user || user.length !== 1) {
        throw new NotFoundError(`User ${user_id} not found`);
    }

    const { data: existingUserCourse } = await supa
        .from("course_members")
        .select("*")
        .eq("course_id", course_id)
        .eq("user_id", user_id)
        .single();

    if (existingUserCourse) {
        throw new InputValidationError(`User ${user_id} already registered in course ${course_id}`);
    }
}

async function getRole(role: DefaultRoles | undefined ): Promise<{ id: string }> {
    if (!role) {
        role = studentRole; // use student by default
    }

    const { data: roleData, error: roleError } = await supa.from("account_roles")
        .select("id")
        .eq("name", role);

    if (roleError) {
        throw new Error("Database error ")
    }

    if (!roleData || roleData.length !== 1) {
        throw new NotFoundError(`Role ${role} not found`);
    }

    return roleData[0];
}