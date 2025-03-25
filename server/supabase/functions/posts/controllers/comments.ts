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
  content: string
): Promise<PostComment> {
  const newCommentArg = {
    "post_id": postId,
    "content": content
  }
  const comment = await supa.from("post_comments").insert(newCommentArg).select().single();
  if (!comment.data){
    throw new Error("comment unsuccesfully added to post_comments");
  }
  const result: PostComment = {
    id: comment.data.id,
    postId: comment.data.post_id,
    content: comment.data.content,
    numberId: comment.data.number,
    createdAt: comment.data.created_at,
    updatedAt: comment.data.updated_at,
    replies: []
  }

  const author = await supa.from("post_authors").insert({
    "post_id": postId,
    "user_id": userId,
    "comment_id": result.id
  })
  if (!author.data){
    throw new Error("entry unsuccessfully added to post_authors");
  }

  return result;
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

  const ret: PostComment = {
    id: "",
    postId: "",
    content: "",
    numberId: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    replies: []
  }
  return ret
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
