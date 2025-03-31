import { sqlClient, supa } from "../../_shared/db.ts";

import { MutatePostOptions, MutatePostComment, PostComment } from "@shared/mod.ts";
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
  commentEditInfo: MutatePostOptions  ,
): Promise<PostComment> {
  // Check if post exists
  const { isFound } = await postExists(postId);
  if (!isFound) {
    throw new Error("Post does not exist");
  }

  const sql = sqlClient();
  const commentRes = await sql.begin(async (tx) => {
    const [comment] = await tx`
      INSERT INTO post_comments (post_id, content)
      VALUES (${postId}, ${content})
      RETURNING *
    `;

    if (!comment || comment.length === 0) {
      throw new Error("Failed to create comment");
    }

    let pseudonym = null;
     const [hasPseudonym] = await tx`
      SELECT * FROM post_author_pseudonyms WHERE user_id = ${userId} AND post_id = ${postId}
     `;

    

    const [author] = await tx`
      INSERT INTO post_authors (comment_id, user_id, post_id, visibility, is_anonymous)
      VALUES (${comment.id}, ${userId}, ${postId}, ${commentEditInfo.visibility}, ${
        commentEditInfo.use_pseudonym ?? false
      })
      RETURNING *
    `;


    if (!hasPseudonym) {
      const [newPseudonym] = await tx`
        INSERT INTO post_author_pseudonyms (user_id, post_id, pseudonym)
        VALUES (${userId}, ${postId}, ${commentEditInfo.use_pseudonym ?? false})
        RETURNING *
      `;

      pseudonym = newPseudonym.pseudonym;
    }

    return {
      ...comment,
      authors: [
        {
          ...author,
          pseudonym: hasPseudonym ? pseudonym : null,
        },
      ],
    } as PostComment;
  });


  await sql.end();
  return commentRes;
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
  const sql = sqlClient();
  // First get the matching post id
  const [postResult] = await sql`
    SELECT post_comments.post_id 
    FROM post_comments
    INNER JOIN posts ON post_comments.post_id = posts.id
    WHERE post_comments.id = ${commentId}
    AND posts.course_id IN (
      SELECT course_id FROM course_members WHERE user_id = ${userId}
    )
  `;

  // Check if we found a matching post
  if (!postResult || !postResult.post_id) {
    throw new Error("Comment not found or you don't have permission to delete it");
  }

  // Now delete the comment
  await sql`
    DELETE FROM post_comments 
    WHERE id = ${commentId}
  `;

  return;
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
