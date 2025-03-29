import { addTagToPost } from "./tags/add_tag_to_post_activity.ts";
import { getPostTags } from "./tags/get_post_tags_activity.ts";
import { removeTagFromPost } from "./tags/remove_tag_from_post_activity.ts";

export const postTagController = {
    addTagToPost,
    removeTagFromPost,
    getPostTags
};