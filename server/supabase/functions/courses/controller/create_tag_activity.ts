import { supa } from "../../_shared/db.ts";

import { NewTag, Tag } from "@shared/mod.ts";
import { NotFoundError } from "../../_shared/errors.ts";

export async function createTag(newTagData: NewTag, course_id: string): Promise<Tag> {
    const { data: course, error: courseError } = await supa.from("courses")
        .select("id")
        .eq("id", course_id);
    
    if (courseError) {
        throw new Error(`Failed to fetch course ${course_id}: ${courseError.message}`);
    }

    if (!course || course.length !== 1) {
        throw new NotFoundError(`Course ${course_id} not found`);
    }

    const { data: tag, error: tagError } = await supa.from("tags")
        .insert({
            ...newTagData,
            course_id: course_id
        })
        .select()
        .single();

    if (tagError) {
        throw new Error(`Failed to create tag: ${tagError.message}`);   
    }

    return tag as Tag;
}