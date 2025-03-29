import { supa } from "../../_shared/db.ts";

import { PostAuthor, PostComment } from "@shared/mod.ts";
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
  const { isFound, data: postData } = await postExists(postId);
  if (!isFound) {
    throw new Error("Post does not exist");
  }

  const courseId = postData?.course_id;

  // Check if user is in the course with the post
  const { data: courseCheck, error: courseCheckError } = await supa
    .from("course_members")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (courseCheckError) {
    throw courseCheckError;
  }

  if (!courseCheck || courseCheck.length === 0) {
    throw new Error("User is not in the course with the post");
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
  // Check if comment exists
  const { isFound, data: commentData } = await commentExists(commentId);

  if (!isFound) {
    throw new Error("Comment does not exist");
  }

  const postId = commentData?.post_id;

  // Get the course_id from the post
  const { data: postData, error: postError } = await supa
    .from("posts")
    .select("course_id")
    .eq("id", postId)
    .single();

  if (postError) {
    throw new Error(`Error fetching post: ${postError.message}`);
  }

  const courseId = postData.course_id;

  // Check if user is in the course with the post
  const { data: courseCheck, error: courseCheckError } = await supa
    .from("course_members")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (courseCheckError) {
    throw courseCheckError;
  }

  if (!courseCheck || courseCheck.length === 0) {
    throw new Error("User is not in the course with the post");
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
  // Check if post exists
  const { isFound, data: postData } = await postExists(postId);
  if (!isFound) {
    throw new Error("Post does not exist");
  }

  const courseId = postData?.course_id;

  // Check if user is in the course with the post
  const { data: courseCheck, error: courseCheckError } = await supa
    .from("course_members")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (courseCheckError) {
    throw courseCheckError;
  }

  if (!courseCheck || courseCheck.length === 0) {
    throw new Error("User is not in the course with the post");
  }

  const { data: comments, error: commentsError } = await supa
    .from("post_comments")
    .select();

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
export async function deletePostComment(
  commentId: string,
  userId: string,
): Promise<void> {
  // Check if comment exists
  const { isFound } = await commentExists(commentId);

  if (!isFound) {
    throw new Error("Comment does not exist");
  }

  // Check if comment is created by author
  const { error: postAuthorError } = await supa.from("post_authors").select()
    .eq("comment_id", commentId).eq("user_id", userId).single();

  if (postAuthorError) {
    throw new Error(
      "Comment could not be deleted: " + postAuthorError.message,
    );
  }

  // Assuming cascade from deleting comment, don't need to delete others
  const { error: deletionError } = await supa.from("post_comments").delete().eq(
    "id",
    commentId,
  );

  if (deletionError) {
    throw new Error("Failed to delete post");
  }
}

/**
 * Update specific comment on post
 * @param commentId UUID of comment
 * @param userId UUID of user
 * NOTE: Only user that is apart of course with post can edit comment
 */
export async function updatePostComment(
  commentId: string,
  userId: string,
  commentEditInfo: {
    content: string;
    userVisibility: string;
    userPseudonym: string;
  },
): Promise<void> {
  // Check if comment exists
  const { isFound, data: commentData } = await commentExists(commentId);

  if (!isFound) {
    throw new Error("Comment does not exist");
  }

  const postId = commentData?.post_id;

  // Get the course_id from the post
  const { data: postData, error: postError } = await supa
    .from("posts")
    .select("course_id")
    .eq("id", postId)
    .single();

  if (postError) {
    throw new Error(`Error fetching post: ${postError.message}`);
  }

  const courseId = postData.course_id;

  // Check if user is in the course with the post
  const { data: courseCheck, error: courseCheckError } = await supa
    .from("course_members")
    .select("*")
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (courseCheckError) {
    throw courseCheckError;
  }

  if (!courseCheck || courseCheck.length === 0) {
    throw new Error("User is not in the course with the comment");
  }
  const { error: updateError } = await supa.from("post_comments").update({
    content: commentEditInfo.content,
    updated_at: new Date(),
  }).eq("id", commentId);

  if (updateError) {
    throw new Error("Error updating comment");
  }

  // Check if user is already a part of post_authors
  const { count: userAuthorCount, error: userAuthorError } = await supa
    .from("post_authors")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("comment_id", commentId);

  if (userAuthorError) {
    throw userAuthorError;
  }

  // If user is already a part of post_authors, update entry
  if (userAuthorCount == 1) {
    const { error: _ } = await supa.from(
      "post_authors",
    ).update({
      visibility: commentEditInfo.userVisibility,
      pseudonym: commentEditInfo.userPseudonym,
    })
      .eq("user_id", userId)
      .eq("post_id", postId)
      .eq("comment_id", commentId);
    return;
  }

  // Otherwise, add them to table
  const { error: _ } = await supa.from(
    "post_authors",
  ).insert({
    comment_id: commentId,
    user_id: userId,
    visibility: commentEditInfo.userVisibility,
    pseudonym: commentEditInfo.userPseudonym,
  }).select().single();
}

export async function getCommentAuthorsByCommentId(
  commentId: string,
): Promise<PostAuthor[]> {
  const { data, error } = await supa.from("post_authors").select("*").eq(
    "comment_id",
    commentId,
  );

  if (error) {
    throw error;
  }

  return data as PostAuthor[];
}

export const postCommentController = {
  createPostComment,
  getPostComment,
  getPostComments,
  deletePostComment,
  updatePostComment,
  getCommentAuthorsByCommentId,
};
