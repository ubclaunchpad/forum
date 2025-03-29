import { supa } from "../../../_shared/db.ts";
import { NotFoundError } from "../../../_shared/errors.ts";

export async function deleteReply(reply_id: string) {
    const { data: replyData, error: replyError } = await supa.from("post_comment_replies")
        .select("*")
        .eq("id", reply_id);

    if (replyError) {
        console.error(replyError.message);
        throw new Error(`Failed to retrieve reply ${reply_id}: ${replyError.message}`);
    }
    if (!replyData || replyData.length === 0) {
        throw new NotFoundError(`Reply ${reply_id} not found`);
    }

    const { error: deletionError } = await supa.from("post_comment_replies")
        .delete()
        .eq("id", reply_id);

    if (deletionError) {
        throw new Error(`Failed to delete reply ${reply_id}: ${deletionError.message}`);
    }
}