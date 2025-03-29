import { sqlClient, supa } from "../../_shared/db.ts";

import {
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
  getRepliesComments: boolean,
): Promise<Post> {
  const sql = sqlClient();
  const post = await sql.begin(async (tx) => {
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
      throw new Error("User is not registered in course");
    }

    const authors = await tx`
    SELECT pa.user_id, pa.post_id, pa.is_anonymous, pa.visibility, pap.pseudonym 
    FROM post_authors pa 
    INNER JOIN post_author_pseudonyms pap 
    ON pa.user_id = pap.user_id AND pa.post_id = pap.post_id 
    WHERE pa.post_id = ${postId}
    `;

    return {
      ...post,
      authors: authors,
    } as unknown as Post;
  });
  await sql.end();
  return post;
}

export async function getPosts(
  userId: string,
  courseId: string,
  fullPost: boolean = false,
  getRepliesComments: boolean,
): Promise<Post[]> {
  const sql = sqlClient();
  const inCourse = await userInCourse(userId, courseId);

  if (!inCourse) {
    throw new Error("User is not registered in course");
  }

  const posts = await sql.begin(async (tx) => {
    const contentClause = fullPost
      ? sql`posts.content as content`
      : sql`SUBSTRING(posts.content, 1, 200) as content`;
    const posts = await tx`
      SELECT id, course_id, title, number_id, ${contentClause}, status, created_at, updated_at, visibility,
        (
          SELECT json_agg(row_to_json(post_authors))
          FROM post_authors
          WHERE post_authors.post_id = posts.id
        ) as authors
      FROM posts WHERE course_id = ${courseId} 
    `;

    const postAuthors = await tx`
      SELECT post_id, user_id, is_anonymous, visibility, 
        (
          SELECT pseudonym FROM post_author_pseudonyms WHERE post_id = post_authors.post_id AND user_id = post_authors.user_id
        ) as pseudonym
      FROM post_authors WHERE post_id IN (SELECT id FROM posts)
    `;

    const postAuthorsMap = new Map<string, PostAuthor[]>();
    postAuthors.forEach((postAuthor) => {
      if (!postAuthorsMap.has(postAuthor.post_id)) {
        postAuthorsMap.set(postAuthor.post_id, []);
      }
      postAuthorsMap.get(postAuthor.post_id)?.push(postAuthor as PostAuthor);
    });

    posts.forEach((post) => {
      post.authors = postAuthorsMap.get(post.id) ?? [];
    });
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
  return getPost(userId, postId, false);
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
