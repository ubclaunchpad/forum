import { supa } from "../../../_shared/db.ts";
import { NotFoundError } from "../../../_shared/errors.ts";

export async function addTagToPost(post_id: string, tag_id: string) {
    const { data: postData, error: postError } = await supa.from("posts")
        .select("*")
        .eq("id", post_id);
    
    if (postError) {
        console.error(postError);
        throw new Error(`Failed to retrieve post ${post_id}: ${postError.message}`);
    }

    if (!postData || postData.length === 0) {
        throw new NotFoundError(`Post ${post_id} not found`);
    }

    const { data: tagData, error: tagError } = await supa.from("tags")
        .select("*")
        .eq("id", tag_id);
    
    if (tagError) {
        console.error(tagError.message);
        throw new Error(`Failed to retrieve tag ${tag_id}: ${tagError.message}`);
    }

    if (!tagData || tagData.length === 0) {
        throw new NotFoundError(`Tag ${tag_id} not found`);
    }

    const postCourse = postData[0].course_id;
    const tagCourse = tagData[0].course_id;
    if (postCourse !== tagCourse) {
        throw new Error(`Post ${post_id} cannot be tagged with tag ${tag_id} as they are from different courses`);
    }

    const { data: tagData}

    const { error: postTagError } = await supa.from("post_tags")
        .insert({ post_id: post_id, tag_id: tag_id });

    if (postTagError) {
        console.error(postTagError.message);
        throw new Error(`Failed to tag post ${post_id} with tag ${tag_id}: ${postTagError.message}`);
    }
}