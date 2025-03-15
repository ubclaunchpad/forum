import { supa } from "../../_shared/db.ts";

import {
  AccountStatus,
  AccountStatusValue,
  DbPost,
  DbPostSchema,
  emailPasswordSchema,
  NewPost,
  NewPostOptions,
  NewPostResults,
  PostAuthor,
  postAuthorSchema,
  ProfileWithoutId,
  User,
  WithEmailAndPassword,
  WithId,
} from "@shared/mod.ts";
import {
  InputValidationError,
  NotFoundError,
  UserStatusError,
} from "../../_shared/errors.ts";

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

  const { data: postAuthorData, error: _ } = await supa.from(
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

export async function getPosts(courseId: string) {
  const { data } = await supa.from("posts").select().eq("course_id", courseId);
  return data ?? [];
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supa.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error("Failed to delete post");
  }
}

export async function getPostPermission(postId: string, userId: string, operation: 'create' | 'delete' | 'update' | 'get') {
  
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

function generatePseudonym() {
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

export const postController = {
  createPost,
  getPosts,
  deletePost,
  getPostAuthorByPostId,
};
