import { supa } from "../../_shared/db.ts";
import { User } from '../../../../../shared/schema/users.ts';

export async function getCourseMembers(course_id: string): Promise<User[]> {
    const { data: courses, error: coursesError } = await supa.from("course_members")
        .select("profiles(*)").eq("course_id", course_id);

    if(coursesError || !courses) {
        throw new Error(`Database error when retrieving members for course with id ${course_id}: ${coursesError.message}`);
    }

    return courses.flatMap(entry => entry.profiles) as User[];
}