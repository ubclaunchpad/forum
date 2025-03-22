import { supa } from "../../_shared/db.ts";

export async function deleteTag(tag_id: string, course_id: string) {
    const { error } = await supa.from("tags").delete().eq("id", tag_id).eq("course_id", course_id);

    if (error) {
        throw new Error(`Failed to delete tag ${tag_id}: ${error.message}`);
    }
} 