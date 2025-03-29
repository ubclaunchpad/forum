import { Tag } from "@shared/schema/tag.ts";
import { supa } from "../../_shared/db.ts";

export async function getAllTags(course_id: string): Promise<Tag[]> {
    const { data: tagData, error } = await supa.from("tags")
        .select("*")
        .eq("course_id", course_id);
    
    if (error) {
        throw new Error(`Failed to get tags of course ${course_id}: ${error.message}`);
    }

    return tagData as Tag[];
}