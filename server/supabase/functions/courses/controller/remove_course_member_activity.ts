import { supa } from "../../_shared/db.ts"; 
import { Course, DefaultRoles, studentRole } from '../../../../../shared/schema/course.ts';
import { NotFoundError, PermissionError, InputValidationError } from '../../_shared/errors.ts';

export async function removeCourseMember(course_id: string, user_id: string) {
    await getCourse(course_id);
    await checkIfUserExists(user_id);
    await checkIfUserInCourse(user_id, course_id);

    const { error: deleteError } = await supa
        .from("course_members")
        .delete()
        .eq("course_id", course_id)
        .eq("user_id", user_id);
    
    if (deleteError) {
        throw new Error(`Failed to remove user from course: ${deleteError.message}`);
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
    
    return course[0] as Course;
}

async function checkIfUserExists(user_id: string) {
    const { data: user, error: userError } = await supa.from("profiles").select("*").eq("id", user_id);

    if (userError) {
        throw new Error(`Database error when retrieving user with id ${user_id}: ${userError.message}`);
    } 
    if (!user || user.length !== 1) {
        throw new NotFoundError(`User ${user_id} not found`);
    }
}

async function checkIfUserInCourse(user_id: string, course_id: string) {
    const { data: existingUserCourse } = await supa
        .from("course_members")
        .select("*")
        .eq("course_id", course_id)
        .eq("user_id", user_id)
        .single();

    if (!existingUserCourse) {
        throw new InputValidationError(`User ${user_id} not in course ${course_id}`);
    }
}