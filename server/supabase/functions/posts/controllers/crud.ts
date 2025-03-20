import { supa } from "../../_shared/db.ts";

import {
  DbPostSchema,
  NewPost,
  NewPostOptions,
  NewPostResults,
  PostAuthor,
  PostEditInfo,
  PostList,
  PostResponse,
} from "@shared/mod.ts";
import { NotFoundError } from "../../_shared/errors.ts";
import { generatePseudonym, userInCourse } from "./helpers.ts";
import { getPostComments, postExists } from "./helpers.ts";

export async function createPost(
  userId: string,
  newPostArgs: NewPost,
  options: NewPostOptions,
): Promise<NewPostResults> {
  const inCourse = await userInCourse(userId, newPostArgs.course_id);

  if (!inCourse) {
    throw new Error("User is not registered in course");
  }

  const { data, error } = await supa.from("posts").insert(newPostArgs).select()
    .single();

  if (error) {
    throw new Error("Failed to create post");
  }
  const postData = DbPostSchema.parse(data);

  let pseudonym = undefined;

  if (options.usePseudonym) {
    pseudonym = generatePseudonym();
  }

  const { error: _ } = await supa.from(
    "post_authors",
  ).insert({
    post_id: postData.id,
    user_id: userId,
    visibility: options.visibility,
    pseudonym: pseudonym,
  }).select().single();

  return {
    post_id: postData.id,
    course_id: newPostArgs.course_id,
    pseudonym: pseudonym,
    title: postData.title,
    number_id: postData.number_id,
    status: postData.status,
    created_at: postData.created_at,
    updated_at: postData.updated_at,
  };
}

export async function getTestPosts(
  courseId: string,
) {
  const { data } = await supa.from("posts").select().eq("course_id", courseId);
  return data ?? [];
}

export async function getPost(
  userId: string,
  postId: string,
  getRepliesComments: boolean,
): Promise<PostResponse> {
  const postData = await postExists(postId);

  if (!postData.isFound || !postData.data) {
    throw new NotFoundError("Post does not exist");
  }

  const { course_id } = postData.data;

  const inCourse = await userInCourse(userId, course_id);

  if (!inCourse) {
    throw new Error("User is not registered in course");
  }

  const { data, error } = await supa.from("posts").select().eq(
    "course_id",
    course_id,
  ).eq("id", postId).single();

  if (error) {
    throw error;
  }

  const post: PostResponse = {
    id: data.id,
    course_id: data.course_id,
    title: data.title,
    number_id: data.number_id,
    content: data.content,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  if (getRepliesComments) {
    post["comments"] = await getPostComments(postId);
  }
  return post;
}

export async function getPosts(
  userId: string,
  courseId: string,
  getRepliesComments: boolean,
): Promise<PostList[]> {
  // Check if user is apart of course
  const inCourse = await userInCourse(userId, courseId);

  if (!inCourse) {
    throw new Error("User is not registered in course");
  }

  // Get all posts with course_id
  const { data } = await supa.from("posts").select().eq("course_id", courseId);

  const retPosts: PostList[] = [];

  // If there are no posts, return an empty list
  if (!data || data.length == 0) {
    return retPosts;
  }

  // Parse through data, changing type and getting comments and replies
  for (const entry of data) {
    const post: PostList = {
      id: entry.id,
      course_id: entry.course_id,
      title: entry.title,
      number_id: entry.number_id,
      status: entry.status,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    };
    if (getRepliesComments) {
      post["comments"] = await getPostComments(post.id);
    }
    retPosts.push(post);
  }

  return retPosts;
}

/**
 * Updates content of the post
 * @param postId UUID of post
 * @param userId UUID of user, user must be a part of the course that post is in
 * @param postEditInfo Info that is being edited about post
 */
export async function updatePost(
  postId: string,
  userId: string,
  postEditInfo: PostEditInfo,
): Promise<void> {
  // Check if post exists
  const checkPost = await postExists(postId);
  if (!checkPost.isFound) {
    throw new Error("Post does not exist");
  }

  // Retrieve the course that the post is in
  const { data, error: postError } = await supa.from("posts").select(
    "course_id",
  ).eq("id", postId).single();

  if (postError) {
    throw postError;
  }

  const courseId: string = data.course_id;

  // Check if user is a part of the course
  const { count: userCourseCount, error: userCourseError } = await supa
    .from("course_members")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("user_id", userId);

  if (userCourseError) {
    throw userCourseError;
  }

  if (userCourseCount == 0) {
    throw new Error("User is not registered in course");
  }

  // Edit post
  const { error: updateError } = await supa.from("posts").update({
    title: postEditInfo.title,
    content: postEditInfo.content,
    updated_at: postEditInfo.updated_at,
  }).eq("id", postId);

  if (updateError) {
    throw new Error("Error updating post information");
  }
  // Check if user is already a part of post_authors
  const { count: userAuthorCount, error: userAuthorError } = await supa
    .from("post_authors")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("post_id", postId);

  if (userAuthorError) {
    throw userAuthorError;
  }

  // If user is already a part of post_authors, update entry
  if (userAuthorCount == 1) {
    const { error: _ } = await supa.from(
      "post_authors",
    ).update({
      visibility: postEditInfo.userVisibility,
      pseudonym: postEditInfo.userPseudonym,
    })
      .eq("user_id", userId)
      .eq("post_id", postId);
    return;
  }

  // Otherwise, add them to table
  const { error: _ } = await supa.from(
    "post_authors",
  ).insert({
    post_id: postId,
    user_id: userId,
    visibility: postEditInfo.userVisibility,
    pseudonym: postEditInfo.userPseudonym,
  }).select().single();
}

/**
 * Deletes post
 * @param postId UUID of post
 * @param userId UUID of user
 * NOTE: Post can only be deleted by the poster/editors themselves
 */
export async function deletePost(
  postId: string,
  userId: string,
): Promise<void> {
  // Check if post exists
  const checkPost = await postExists(postId);
  if (!checkPost.isFound) {
    throw new Error("Post does not exist");
  }

  // Check if post is created by author
  const { error: postAuthorError } = await supa.from("post_authors").select()
    .eq("post_id", postId).eq("user_id", userId).single();

  if (postAuthorError) {
    throw new Error("Error: " + postAuthorError.message);
  }

  // Assuming cascade from deleting post, don't need to delete others
  const { error: deletionError } = await supa.from("posts").delete().eq(
    "id",
    postId,
  );

  if (deletionError) {
    throw new Error("Failed to delete post");
  }
}

/**
 * Retrieves the post authors of a post
 * @param postId UUID of post
 * @return PostAuthor object
 */
export async function getPostAuthorsByPostId(
  postId: string,
): Promise<PostAuthor[]> {
  const { data, error } = await supa.from("post_authors").select().eq(
    "post_id",
    postId,
  );
  if (error) {
    throw new Error(
      "Failed to retrieve post author: " + error.message,
    );
  }

  if (!data) {
    throw new Error("Post does not exist");
  }

  return data as PostAuthor[];
}

export const postController = {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  getPostAuthorsByPostId,
};
