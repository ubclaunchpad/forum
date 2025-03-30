import { sqlClient, supa } from "../../_shared/db.ts";

import {
PostComment,
  type MutatePost,
  type MutatePostEdit,
  type MutatePostOptions,
  type Post,
  type PostAuthor,
} from "@shared/mod.ts";
import { generatePseudonym, userInCourse } from "./helpers.ts";
import { postExists } from "./helpers.ts";

export async function createPost(
  userId: string,
  newPostArgs: MutatePost,
  options: MutatePostOptions,
): Promise<Post> {
  const sql = sqlClient();

  const inCourse = await userInCourse(userId, newPostArgs.course_id);
  if (!inCourse) {
    throw new Error("User is not registered in course");
  }

  const pseudonym = generatePseudonym();

  const post = await sql.begin(async (tx) => {
    const [createdPost] = await tx`
      INSERT INTO posts (course_id, title, content, status, visibility)
      VALUES (${newPostArgs.course_id}, ${newPostArgs.title}, ${newPostArgs.content}, 'published', ${
      options.visibility ?? "public"
    })
      RETURNING *
    `;

    if (!createdPost || createdPost.length === 0) {
      throw new Error("Failed to create post");
    }

    const [authorPseudonym] = await tx`
      INSERT INTO post_author_pseudonyms (post_id, user_id, pseudonym)
      VALUES (${createdPost.id}, ${userId}, ${pseudonym})
      RETURNING *
    `;

    if (!authorPseudonym || authorPseudonym.length === 0) {
      throw new Error("Failed to create author pseudonym");
    }

    const [author] = await tx`
      INSERT INTO post_authors (post_id, user_id, is_anonymous)
      VALUES (${createdPost.id}, ${userId}, ${options.use_pseudonym ?? false})
      RETURNING *
    `;

    if (!author || author.length === 0) {
      throw new Error("Failed to create author");
    }

    return {
      ...createdPost,
      authors: [{
        ...author,
        pseudonym: authorPseudonym.pseudonym,
      }],
    };
  });

  await sql.end();
  return post as Post;
}

export async function getPost(
  userId: string,
  postId: string,
): Promise<Post> {
  const sql = sqlClient();
  const post = await sql.begin(async (tx) => {
    const [post] = await tx`
      SELECT p.*,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'id', pc.id,
              'postId', pc.post_id,
              'content', pc.content,
              'number_id', pc.number_id,
              'created_at', pc.created_at,
              'updated_at', pc.updated_at,
              'authors', COALESCE((
                SELECT json_agg(
                  json_build_object(
                    'user_id', CASE WHEN pa.is_anonymous THEN NULL ELSE pa.user_id END,
                    'post_id', pa.post_id,
                    'comment_id', pa.comment_id,
                    'reply_id', pa.reply_id,
                    'is_anonymous', pa.is_anonymous,
                    'visibility', pa.visibility,
                    'created_at', pc.created_at,
                    'updated_at', pc.updated_at,
                    'pseudonym', pap.pseudonym
                  )
                )
                FROM post_authors pa
                INNER JOIN post_author_pseudonyms pap
                ON pa.user_id = pap.user_id AND pa.post_id = pap.post_id
                WHERE pa.post_id = p.id AND pa.comment_id = pc.id
              ), '[]'::json)
            )
          ), '[]'::json)
          FROM post_comments pc
          WHERE pc.post_id = p.id
        ) as comments,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'user_id', CASE WHEN pa.is_anonymous THEN NULL ELSE pa.user_id END,
              'post_id', pa.post_id,
              'is_anonymous', pa.is_anonymous,
              'visibility', pa.visibility,
              'pseudonym', pap.pseudonym
            )
          ), '[]'::json)
          FROM post_authors pa
          LEFT JOIN post_author_pseudonyms pap
          ON pa.user_id = pap.user_id AND pa.post_id = pap.post_id
          WHERE pa.post_id = p.id AND pa.comment_id IS NULL AND pa.reply_id IS NULL
        ) as authors
      FROM posts p WHERE p.id = ${postId}
    `;
    if (!post || post.length === 0) {
      throw new Error("Post does not exist");
    }
    
    const [member] = await tx`
      SELECT * FROM course_members WHERE course_id = ${post.course_id} AND user_id = ${userId}
    `;
    if (!member || member.length === 0) {
      throw new Error("User is not registered in course");
    }

    return {
      ...post,
      comments: post.comments || [],
      authors: post.authors || [],
    } as unknown as Post;
  });
  await sql.end();
  return post;
}

export async function getPosts(
  userId: string,
  courseId: string,
  fullPost: boolean = false,
): Promise<Post[]> {
  const sql = sqlClient();
  const inCourse = await userInCourse(userId, courseId);

  if (!inCourse) {
    throw new Error("User is not registered in course");
  }

  const posts = await sql.begin(async (tx) => {
    const contentClause = fullPost
      ? sql`p.content as content`
      : sql`SUBSTRING(p.content, 1, 200) as content`;
    const posts = await tx`
      SELECT p.id, p.course_id, p.title, p.number_id, ${contentClause}, p.status, p.created_at, p.updated_at, p.visibility,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'user_id', CASE WHEN pa.is_anonymous THEN NULL ELSE pa.user_id END,
              'post_id', pa.post_id,
              'comment_id', pa.comment_id,
              'reply_id', pa.reply_id,
              'is_anonymous', pa.is_anonymous,
              'visibility', pa.visibility,
              'pseudonym', pap.pseudonym
            )
          ), '[]'::json)
          FROM post_authors pa
          LEFT JOIN post_author_pseudonyms pap
          ON pa.user_id = pap.user_id AND pa.post_id = pap.post_id
          WHERE pa.post_id = p.id AND pa.comment_id IS NULL AND pa.reply_id IS NULL
        ) as authors
      FROM posts p WHERE p.course_id = ${courseId} 
    `;
    return posts as unknown as Post[];
  });

  await sql.end();
  return posts;
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
  postEditInfo: MutatePostEdit,
  postEditOptions: Pick<MutatePostOptions, "use_pseudonym">,
): Promise<Post> {
  const sql = sqlClient();

  await sql.begin(async (tx) => {
    const [post] = await tx`
      SELECT * FROM posts WHERE id = ${postId}
    `;
    if (!post || post.length === 0) {
      throw new Error("Post does not exist");
    }

    const [member] = await tx`
      SELECT * FROM course_members WHERE course_id = ${post.course_id} AND user_id = ${userId}
    `;
    if (!member || member.length === 0) {
      throw new Error("User is not a member of the post");
    }

    const queries = [];
    if (postEditInfo.title) {
      queries.push(sql`title = ${postEditInfo.title},`);
    } else {
      queries.push(sql``);
    }
    
    if (postEditInfo.content) {
      queries.push(sql`content = ${postEditInfo.content},`);
    } else {
      queries.push(sql``);
    }
    
    queries.push(sql`updated_at = ${new Date()}`);

    const [updatedPost] = await tx`UPDATE posts SET ${queries[0]} ${queries[1]} ${queries[2]} WHERE id = ${postId} RETURNING *`;
    if (!updatedPost || updatedPost.length === 0) {
      throw new Error("Failed to update post");
    }
    // If new author, create author and pseudonym
    const [author] = await tx`
      SELECT * FROM post_authors WHERE post_id = ${postId} AND user_id = ${userId}
    `;
    if (!author || author.length === 0) {
      await tx`
        INSERT INTO post_authors (post_id, user_id, is_anonymous)
        VALUES (${postId}, ${userId}, ${postEditOptions.use_pseudonym ?? false})
      `;
    }
  });

  await sql.end();
  return getPost(userId, postId);
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

  // TODO: ADD BACK IN LATER
  // console.log("postId", postId);
  // Check if post is created by author
  // const { error: postAuthorError } = await supa.from("post_authors").select()
  //   .eq("post_id", postId).eq("user_id", userId).single();

  // if (postAuthorError) {
  //   throw new Error("Error: " + postAuthorError.message);
  // }

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
