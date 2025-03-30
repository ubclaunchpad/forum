import { supa } from "../../../_shared/db.ts";

export async function removeTagFromPost(post_id: string, tag_id: string) {
    const { error: deleteError } = await supa.from("post_tags")
        .delete()
        .eq("post_id", post_id)
        .eq("tag_id", tag_id);

    if (deleteError) {
        console.error(deleteError.message);
        throw new Error(`Failed to untag post ${post_id} from tag ${tag_id}: ${deleteError.message}`);
    }
}