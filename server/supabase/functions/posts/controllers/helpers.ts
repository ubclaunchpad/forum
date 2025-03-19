import { PostComment, PostList } from "@shared/schema/posts.ts";
import { supa } from "../../_shared/db.ts";

/**
 * Checks whether user is in course or not
 * @param userId UUID of user
 * @param courseId UUID of course
 * @returns true if user is in course, otherwise false
 */
export async function userInCourse(userId: string, courseId: string) {
  const { count: userCourseCount, error: userCourseError } = await supa
    .from("course_members")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (userCourseError) {
    throw userCourseError;
  }

  if (userCourseCount == 0) {
    return false;
  }

  return true;
}

/**
 * Checks whether post exists or not
 * @returns True if the post exists, false otherwise
 */
export async function postExists(postId: string): Promise<boolean> {
  const { count, error } = await supa.from("posts").select("*", {
    count: "exact",
    head: true,
  }).eq("id", postId);

  if (error) {
    throw error;
  }

  if (count == 0) {
    return false;
  }

  return true;
}

/**
 * Checks whether post exists within scope of course or not
 * @returns True if the post does exist, false otherwise
 */
export async function postExistsInCourse(
  numberId: string,
  courseId: string,
): Promise<boolean> {
  const { count, error } = await supa.from("posts").select("*", {
    count: "exact",
    head: true,
  })
    .eq("number_id", numberId).eq("course_id", courseId);

  if (error) {
    throw error;
  }

  if (count == 0) {
    return false;
  }

  return true;
}

/**
 * Checks if user is able to perform operation on given post
 * @param postId
 * @param userId
 * @param operation
 */
export async function getPostPermission(
  postId: string,
  userId: string,
  operation: "create" | "delete" | "update" | "get",
) {
}

/**
 * Gets comments and replies of a post.
 * @param postId The ID of the post to get comments for
 * @returns An array of PostComment objects with their replies
 */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  // Fetch all comments for the post
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

  // Transform the comments into proper PostComment objects
  const result: PostComment[] = [];

  for (const comment of comments) {
    const { data: replies, error: repliesError } = await supa
      .from("post_comment_replies")
      .select()
      .eq("comment_id", comment.id);

    if (repliesError) {
      throw new Error(`Error fetching replies: ${repliesError.message}`);
    }

    result.push({
      id: comment.id,
      postId: comment.post_id,
      content: comment.content,
      numberId: comment.number_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      replies: (replies || []).map((reply) => ({
        id: reply.id,
        commentId: reply.comment_id,
        content: reply.content,
        numberId: reply.number_id,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
      })),
    });
  }

  return result;
}

export function generatePseudonym() {
  const adjective =
    PSEUDONYM[0][Math.floor(Math.random() * PSEUDONYM[0].length)];
  const color = PSEUDONYM[1][Math.floor(Math.random() * PSEUDONYM[1].length)];
  const animal = PSEUDONYM[2][Math.floor(Math.random() * PSEUDONYM[2].length)];
  return `${adjective}_${color}_${animal}`;
}

export const PSEUDONYM = [
  [
    "Small",
    "Smart",
    "Curious",
    "Adventurous",
    "Playful",
    "Friendly",
    "Courageous",
    "Clever",
    "Quick",
    "Clever",
  ],
  [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Orange",
    "Purple",
    "Pink",
  ],
  [
    "Cat",
    "Dog",
    "Bird",
    "Fish",
    "Snake",
    "Lizard",
    "Turtle",
    "Snake",
  ],
];
