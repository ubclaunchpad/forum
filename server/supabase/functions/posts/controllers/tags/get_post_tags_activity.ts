import { Tag } from "@shared/mod.ts";
import { supa } from "../../../_shared/db.ts";
import { NotFoundError } from "../../../_shared/errors.ts";

export async function getPostTags(post_id: string): Promise<Tag[]> {
    const [postResult, tagsResult] = await Promise.all([
        supa.from("posts").select("*").eq("id", post_id),
        supa.from("post_tags").select("tags(*)").eq("post_id", post_id),
    ]);

    if (postResult.error) {
        console.error(postResult.error);
        throw new Error(`Failed to retrieve post ${post_id}: ${postResult.error.message}`);
    }
    if (tagsResult.error) {
        console.error(tagsResult.error);
        throw new Error(`Failed to retrieve tags for post ${post_id}: ${tagsResult.error.message}`);
    }

    const postData = postResult.data;
    const tagsData = tagsResult.data;
    if (!postData || postData.length === 0) {
        throw new NotFoundError(`Post ${post_id} not found`);
    }
    if (!tagsData || tagsData.length === 0) {
        return [];
    }

    return tagsData.flatMap((entry) => entry.tags) as Tag[];
}