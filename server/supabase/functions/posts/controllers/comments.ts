import { sqlClient, supa } from "../../_shared/db.ts";

import { MutatePostComment, PostComment } from "@shared/mod.ts";
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
  commentEditInfo: MutatePostComment,
): Promise<PostComment> {
  const sql = sqlClient();

  await sql.begin(async (tx) => {
    // Check if comment exists
    const [comment] = await tx`
        SELECT * FROM post_comments WHERE id = ${commentId}
      `;

    if (!comment || comment.length === 0) {
      throw new Error("Comment does not exist");
    }

    const postId = comment.post_id;

    // Get the course_id from the post
    const [post] = await tx`
        SELECT * FROM posts WHERE id = ${postId}
      `;

    if (!post || post.length === 0) {
      throw new Error("Post does not exist");
    }

    const courseId = post.course_id;

    // Check if user is in the course with the post
    const [member] = await tx`
        SELECT * FROM course_members 
        WHERE course_id = ${courseId} AND user_id = ${userId}
      `;

    if (!member || member.length === 0) {
      throw new Error("User is not in the course with the comment");
    }

    const [updatedComment] = await tx`
        UPDATE post_comments 
        SET content = ${commentEditInfo.content}, updated_at = ${new Date()}
        WHERE id = ${commentId}
        RETURNING *
      `;

    if (!updatedComment || updatedComment.length === 0) {
      throw new Error("Failed to update comment");
    }

    const [author] = await tx`
        SELECT * FROM post_authors 
        WHERE user_id = ${userId}
      `;

    // If user is not a part of post_authors, add to table
    if (author && author.length > 0) {
      await tx`
        UPDATE post_authors
        SET visibility = ${commentEditInfo.visibility}
        WHERE user_id = ${userId} 
        AND post_id = ${postId}
        AND comment_id = ${commentId}
      `;
    } else {
      // Otherwise, add them to table
      await tx`
        INSERT INTO post_authors (comment_id, user_id, post_id, visibility, is_anonymous)
        VALUES (${commentId}, ${userId}, ${postId}, ${commentEditInfo.visibility}, ${
        commentEditInfo.use_pseudonym ?? false
      })
      `;
    }
  });

  // Get and return the updated comment
  await sql.end();
  return await getPostComment(commentId, userId);
}

export const postCommentController = {
  createPostComment,
  getPostComment,
  getPostComments,
  deletePostComment,
  updatePostComment,
};
