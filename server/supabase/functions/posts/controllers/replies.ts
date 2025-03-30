import { createReply } from "./replies/create_reply_activity.ts";
import { deleteReply } from "./replies/delete_reply_activity.ts";
import { getReply } from "./replies/get_reply_activity.ts";
import { updateReply } from "./replies/update_reply_activity.ts";

export const postCommentReplyController = {
    createReply,
    getReply,
    deleteReply,
    updateReply
};