import { supa } from "../../_shared/db.ts";

import {
  DbPostSchema,
  NewPost,
  NewPostOptions,
  NewPostResults,
  PostAuthor,
  postAuthorSchema,
  PostEditInfo,
} from "@shared/mod.ts";
import {
  NotFoundError,
} from "../../_shared/errors.ts";
import { generatePseudonym } from "./helpers.ts";
import { string } from "npm:zod@^3.24.2";
import { CommonExecOptions } from "node:child_process";
import { getPostComments, PostComment, postExists } from "./helpers.ts";
import { array } from "npm:zod@^3.24.2";

interface PostResponse {
  id: string; // UUID
  courseId: string; // UUID
  title: string;
  numberId: number;
  content: string;
  status: string; // Default: 'posted'
  createdAt: Date;
  updatedAt: Date;
  comments?: PostComment[]
}

export async function createPost(
  userId: string,
  newPostArgs: NewPost,
  options: NewPostOptions,
): Promise<NewPostResults> {
  const { data: courseMemberData, error: courseMemberError } = await supa
    .from("course_members")
    .select("course_id")
    .eq("user_id", userId)
    .eq("course_id", newPostArgs.course_id)
    .single();

  if (courseMemberError) {
    throw new Error(
      "Failed to get course member: " + courseMemberError.message,
    );
  }

  if (!courseMemberData) {
    throw new NotFoundError("User is not a member of this course");
  }

  const { data } = await supa.from("posts").insert(newPostArgs).select()
    .single();

  if (!data) {
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

export async function getPosts(
  userId: string,
  courseId: string,
  getRepliesComments: boolean
) {
  const { data: courseMemberData, error: courseMemberError } = await supa
    .from("course_members")
    .select("course_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

    if (courseMemberError) {
      throw new Error(
        "Failed to get course member: " + courseMemberError.message,
      );
    }

    if (!courseMemberData) {
      throw new NotFoundError("User is not a member of this course");
    }

    const { data } = await supa.from("posts").select()
    .eq("course_id", courseId).single();

    const retPosts: PostResponse[] = [];

    if (!data) {
      throw new NotFoundError("Posts not found");
    }

    for (const d of data){
      const post: PostResponse = {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        numberId: data.number_id,
        content: data.content,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
      if (getRepliesComments){
        post["comments"] = await getPostComments(post.id);
      }
      retPosts.push(post)
    }
    return retPosts;
}

export async function getPost(
  userId: string,
  postId: string,
  courseId: string,
  getRepliesComments: boolean
): Promise<PostResponse>{
    const { data: courseMemberData, error: courseMemberError } = await supa
    .from("course_members")
    .select("course_id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

    if (courseMemberError) {
      throw new Error(
        "Failed to get course member: " + courseMemberError.message,
      );
    }

    if (!courseMemberData) {
      throw new NotFoundError("User is not a member of this course");
    }

    const { data } = await supa.from("posts").select()
    .eq("course_id", courseId).eq("id", postId).single();

    if (!data) {
      throw new NotFoundError("Post not found");
    }
    const post: PostResponse = {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      numberId: data.number_id,
      content: data.content,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }

    if (getRepliesComments){
      post["comments"] = await getPostComments(postId);
    }
    return post;
}
/**
 * Updates content of the post
 * @param postId UUID of post
 * @param userId UUID of user, user must be a part of the course that post is in
 * @param postEditInfo Info that is being edited about post
 */
export async function updatePost(postId: string, userId: string, postEditInfo: PostEditInfo): Promise<void>{
    // Check if post exists
    const exists = await postExists(postId);
    if (!exists) {
      throw new Error("Post does not exist");
    }
  
    // Retrieve the course that the post is in
    const {data, error : postError} = await supa.from("posts").select("course_id").eq("id", postId).single();
    const { error } = await supa.from("posts").delete().eq("id", postId);

    if (postError) {
      throw postError;
    }

    const courseId : string = data.course_id;
  
    // Check if user is a part of the course
    const { count: userCourseCount, error: userCourseError } = await supa
        .from("course_members")
        .select('*', { count: 'exact', head: true })
        .eq("course_id", courseId)
        .eq("user_id", userId);

    if (userCourseError) {
        throw userCourseError;
    }

    if (userCourseCount == 0) {
      throw new Error("User is not registered in course");
    }

    // Edit post
    const { error: updateError} = await supa.from('posts').update({
      title: postEditInfo.title,
      content: postEditInfo.content,
      updated_at: postEditInfo.updated_at
    }).eq('id', postId);

    if (updateError) {
      throw new Error("Error updating post information");
    }
    // Check if user is already a part of post_authors
    const { count: userAuthorCount, error: userAuthorError } = await supa
        .from("post_authors")
        .select('*', { count: 'exact', head: true })
        .eq("user_id", userId)
        .eq("post_id", postId);
      
    if (userAuthorError) {
      throw userAuthorError;
    }
    
    // If user is already a part of post_authors
    if (userAuthorCount == 1) {
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
export async function deletePost(postId: string, userId: string): Promise<void> {
    // Check if post exists
    const exists = await postExists(postId);
    if (!exists) {
      throw new Error("Post does not exist"); 
    }

    // Check if post is created by author
    const { error : postAuthorError} = await supa.from("post_authors").select().eq("post_id", postId).eq("user_id", userId).single();

    if (postAuthorError) {
      throw new Error("Error: " + postAuthorError.message);
    }
    
    // Assuming cascade from deleting post, don't need to delete others
    const { error : deletionError } = await supa.from("posts").delete().eq("id", postId);

    if (deletionError) {
        throw new Error("Failed to delete post");
    }
}

/**
 * Return post given a postId
 * @param postId UUID of post
 */
export async function getPostById(postId : string) {
  const {data, error} = await supa.from("posts").select().eq("id", postId);

  return data;
}

/**
 * Retrieves the post author of a post
 * @param postId UUID of post
 * @return PostAuthor object
 */
export async function getPostAuthorByPostId(postId: string): Promise<PostAuthor>{
    const {data, error} = await supa.from("post_authors").select().eq("post_id", postId).single();
    if (error) {
        throw new Error(
            "Failed to retrieve post author: " + error.message,
          );
    }

    if (!data) {
        throw new Error("Post does not exist");
    }

    const postAuthor = postAuthorSchema.parse(data);

    return {
        post_id: postAuthor.post_id,
        user_id: postAuthor.user_id,
        comment_id: postAuthor.comment_id,
        reply_id: postAuthor.reply_id,
        pseudonym: postAuthor.pseudonym,
        visibility: postAuthor.visibility
    }
}

export const postController = {
  createPost,
  updatePost,
  deletePost,
  getPosts: getTestPosts,
  getPostAuthorByPostId,
};
