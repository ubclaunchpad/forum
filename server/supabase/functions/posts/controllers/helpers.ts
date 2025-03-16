import { supa } from "../../_shared/db.ts";

/**
 * Checks whether post exists or not
 * @returns True if the post exists, false otherwise
 */
export async function postExists(postId: string) : Promise<boolean> {
    const {count, error} = await supa.from("posts").select('*', { count: 'exact', head: true }).eq("id", postId);

    if (error) {
        throw error;
    }

    if (count == 0) {
        return false
    }

    return true
}

/**
 * Checks whether post exists within scope of course or not
 * @returns True if the post does exist, false otherwise
 */
export async function postExistsInCourse(numberId: string, courseId: string) : Promise<boolean> {
    const {count, error} = await supa.from("posts").select('*', { count: 'exact', head: true })
                            .eq("number_id", numberId).eq("course_id", courseId);

    if (error) {
        throw error;
    }

    if (count == 0) {
        return false
    }

    return true
}

/**
 * Checks if user is able to perform operation on given post 
 * @param postId 
 * @param userId 
 * @param operation 
 */
export async function getPostPermission(postId: string, userId: string, operation: 'create' | 'delete' | 'update' | 'get') {
  
}

