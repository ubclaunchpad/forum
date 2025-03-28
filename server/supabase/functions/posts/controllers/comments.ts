import { supa } from "../../_shared/db.ts";

import { PostComment } from "@shared/mod.ts";
import { commentExists, postExists } from "./helpers.ts";

/**
 * Create a comment under post
 * @param postId UUID of post
 * @param userId UUID of user
 */
export async function createPostComment(
  postId: string,
  userId: string,
  content: string,
): Promise<PostComment> {
  // Check if post exists
  const { isFound } = await postExists(postId);
  if (!isFound) {
    throw new Error("Post does not exist");
  }

  const newCommentArg = {
    "post_id": postId,
    "content": content,
  };

  const comment = await supa.from("post_comments").insert(newCommentArg)
    .select().single();

  if (!comment.data) {
    throw new Error("comment unsuccesfully added to post_comments");
  }
  const result: PostComment = {
    id: comment.data.id,
    postId: comment.data.post_id,
    content: comment.data.content,
    number_id: comment.data.number_id,
    created_at: comment.data.created_at,
    updated_at: comment.data.updated_at,
    replies: [],
  };

  const { status, error: postAuthorError } = await supa.from("post_authors")
    .insert({
      "post_id": postId,
      "user_id": userId,
      "comment_id": result.id,
    });

  if (postAuthorError) {
    throw postAuthorError;
  }

  if (status !== 201) {
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
  // TODO: Implement check for user in course with post

  // Check if comment exists
  const { isFound } = await commentExists(commentId);

  if (!isFound) {
    throw new Error("Comment does not exist");
  }

  const { data, error } = await supa.from("post_comments").select("*").eq(
    "id",
    commentId,
  ).single();

  if (error) {
    throw error;
  }

  return data as PostComment;
}

export async function getPostComments(
  postId: string,
  userId: string,
): Promise<PostComment[]> {
  // TODO: Implement check for user in course with post
  // Check if post exists
  const { isFound } = await postExists(postId);
  if (!isFound) {
    throw new Error("Post does not exist");
  }

  const { data: comments, error: commentsError } = await supa
    .from("post_comments")
    .select()
    .eq("post_id", postId)
    .order("number_id", { ascending: true });

  if (commentsError) {
    throw new Error(`Error fetching comments: ${commentsError.message}`);
  }

  if (!comments || comments.length === 0) {
    return [];
  }
  return comments as PostComment[];
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
  // Check if comment exists
  const { isFound } = await commentExists(commentId);

  if (!isFound) {
    throw new Error("Comment does not exist");
  }
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
  // Check if comment exists
  const { isFound } = await commentExists(commentId);

  if (!isFound) {
    throw new Error("Comment does not exist");
  }
}

export const postCommentController = {
  createPostComment,
  getPostComment,
  getPostComments,
  deleteComment,
  updateComment,
};
