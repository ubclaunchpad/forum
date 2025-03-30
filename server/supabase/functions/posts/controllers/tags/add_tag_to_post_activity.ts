import { supa } from "../../../_shared/db.ts";
import { NotFoundError } from "../../../_shared/errors.ts";

export async function addTagToPost(post_id: string, tag_id: string) {
    const [postResult, tagResult] = await Promise.all([
        supa.from("posts").select("*").eq("id", post_id),
        supa.from("tags").select("*").eq("id", tag_id)
    ]);

    if (postResult.error) {
        console.error(postResult.error);
        throw new Error(`Failed to retrieve post ${post_id}: ${postResult.error.message}`);
    }

    if (tagResult.error) {
        console.error(tagResult.error);
        throw new Error(`Failed to retrieve tag ${tag_id}: ${tagResult.error.message}`);
    }

    const postData = postResult.data;
    const tagData = tagResult.data;
    if (!postData || postData.length === 0) {
        throw new NotFoundError(`Post ${post_id} not found`);
    }
    if (!tagData || tagData.length === 0) {
        throw new NotFoundError(`Tag ${tag_id} not found`);
    }

    const postCourse = postData[0].course_id;
    const tagCourse = tagData[0].course_id;
    if (postCourse !== tagCourse) {
        throw new Error(`Post ${post_id} cannot be tagged with tag ${tag_id} as they are from different courses`);
    }

    const { error: insertError } = await supa.from("post_tags")
        .upsert({ post_id, tag_id }, { ignoreDuplicates: true });

    if (insertError) {
        console.error(insertError.message);
        throw new Error(`Failed to tag post ${post_id} with tag ${tag_id}: ${insertError.message}`);
    }
}