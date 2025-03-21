import { supa } from "../../_shared/db.ts";

import {
  DbPostSchema,
  NewPost,
  NewPostOptions,
  NewPostResults,
  PostAuthor,
  PostComment,
  PostEditInfo,
  PostList,
  PostResponse,
} from "@shared/mod.ts";
import { NotFoundError } from "../../_shared/errors.ts";
import { generatePseudonym, userInCourse } from "./helpers.ts";
import { getPostComments, postExists } from "./helpers.ts";

/**
 * Create a comment under post
 * @param postId UUID of post
 * @param userId UUID of user
 */
export async function createPostComment(
  postId: string,
  userId: string,
): Promise<PostComment> {
}

/**
 * Get specific comment on post
 * @param commentId UUID of comment
 * @param userId UUID of user
 */
export async function getPostComment(
  commentId: string,
  userId: string,
): Promise<PostComment> {
}

/**
 * Delete specific comment on post
 * @param commentId UUID of comment
 * @param userId UUID of user
 * NOTE: Only the poster can delete their comment from post
 */
export async function deleteComment(
  commentId: string,
  userId: string,
): Promise<void> {
}

/**
 * Update specific comment on post
 * @param commentId UUID of comment
 * @param userId UUID of user
 * NOTE: Only user that is apart of course with post can edit comment
 */
export async function updateComment(
  commentId: string,
  userId: string,
): Promise<void> {
}
