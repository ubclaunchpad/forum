import { Context, Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "./controllers/crud.ts";
import { authMiddleware, UserVariables } from "../_shared/utils/auth.ts";
import {
  mutatePostCommentSchema,
  mutatePostOptionsSchema,
  mutatePostPartialSchema,
  mutatePostSchema,
  z,
} from "@shared/mod.ts";
import { postCommentController } from "./controllers/comments.ts";
import { getUserPermissionsInCourse, isUserMemberOfCourse, isUserPostAuthor, isUserReplyAuthor } from "../_shared/utils/permission_manager.ts";
import { postTagController } from "./controllers/tags.ts";
import { NotFoundError, PermissionError } from "../_shared/errors.ts";
import { postCommentReplyController } from "./controllers/replies.ts";

const functionName = "posts";
const app = new Hono().basePath(`/${functionName}`);

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://forumai.me", "*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type", "*", "Origin", "Accept"],
    exposeHeaders: ["Authorization", "Content-Type", "*"],
  }),
);

app.use("*", authMiddleware as any);

/**
 * Retrieves a post using course_id and post_id (both UUID)
 * Optional query to get replies and comments of post
 */
app.get(
  "/:post_id",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { post_id } = c.req.param();
      const user = c.var.user;

      const post = await getPost(
        user.id,
        post_id,
      );
      return c.json(post);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

app.get(
  "/courses/:course_id",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { course_id } = c.req.param();
      const user = c.var.user;

      const post = await getPosts(
        user.id,
        course_id,
        false,
      );
      return c.json(post);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

// Create post
app.post("/", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { post, options } = await c.req.json();
    const user = c.var.user;

    const newPostArgs = mutatePostSchema.safeParse(post);
    if (!newPostArgs.success) {
      return c.json({ error: newPostArgs.error.message }, 400);
    }

    const newPostOptions = mutatePostOptionsSchema.safeParse(options);
    if (!newPostOptions.success) {
      return c.json({ error: newPostOptions.error.message }, 400);
    }

    const newPost = await createPost(
      user.id,
      newPostArgs.data,
      newPostOptions.data,
    );
    return c.json(newPost);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Delete post using UUID of post
app.delete("/:post_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { post_id } = c.req.param();
    const user = c.var.user;

    await deletePost(post_id, user.id);
    return c.json({ "success": true });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Update a post using UUID of post
app.patch("/:post_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { post_id } = c.req.param();
    const { post, options } = await c.req.json();
    const user = c.var.user;

    const postEditInfo = mutatePostPartialSchema.safeParse(post);

    if (!postEditInfo.success) {
      return c.json({ error: postEditInfo.error.message }, 400);
    }

    const postEditOptions = mutatePostOptionsSchema.pick({
      use_pseudonym: true,
    }).safeParse(options);
    if (!postEditOptions.success) {
      return c.json({ error: postEditOptions.error.message }, 400);
    }

    const updatedPost = await updatePost(
      post_id,
      user.id,
      postEditInfo.data,
      postEditOptions.data,
    );
    return c.json(updatedPost);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Create post comment
app.post(
  "/:post_id/comments",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { post_id } = c.req.param();
      const user = c.var.user;

      const { comment, options } = await c.req.json();

      const newComment = await postCommentController.createPostComment(
        post_id,
        user.id,
        comment.content,
        options,
      );
      return c.json(newComment);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

// Get post comments
app.get(
  "/:post_id/comments",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { post_id } = c.req.param();
      const user = c.var.user;

      const comments = await postCommentController.getPostComments(
        post_id,
        user.id,
      );
      return c.json(comments);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

// Get specific comment
app.get(
  "/:post_id/comments/:comment_id",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { comment_id } = c.req.param();
      const user = c.var.user;

      const comment = await postCommentController.getPostComment(
        comment_id,
        user.id,
      );
      return c.json(comment);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

// Update comment
app.patch(
  "/:post_id/comments/:comment_id",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { comment_id } = c.req.param();
      const user = c.var.user;

      const options = await c.req.json();

      console.log(options);
      const commentEditInfo = mutatePostCommentSchema.safeParse(options);
      if (!commentEditInfo.success) {
        return c.json({ error: commentEditInfo.error.message, options }, 400);
      }

      const updatedComment = await postCommentController.updatePostComment(
        comment_id,
        user.id,
        commentEditInfo.data,
      );
      return c.json(updatedComment);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);

// Delete comment
app.delete(
  "/:post_id/comments/:comment_id",
  async (c: Context<{ Variables: UserVariables }>) => {
    try {
      const { comment_id } = c.req.param();
      const user = c.var.user;

      await postCommentController.deletePostComment(comment_id, user.id);
      return c.json({ "success": true });
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },
);
// Add tag to post
app.post("/:course_id/:post_id/tags/:tag_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id, post_id, tag_id } = c.req.param();
    const user = c.var.user;

    const userPermissions = await getUserPermissionsInCourse(user.id, course_id);
    const postOwner = await isUserPostAuthor(user.id, post_id) ? "own" : "others"; 
    if (!userPermissions.can_tag_posts[postOwner]) {
      return c.json({ error: "User does not have permission to tag posts" }, 401);
    }

    await postTagController.addTagToPost(post_id, tag_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete tag from post
app.delete("/:course_id/:post_id/tags/:tag_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id, post_id, tag_id } = c.req.param();
    const user = c.var.user;

    const userPermissions = await getUserPermissionsInCourse(user.id, course_id);
    const postOwner = await isUserPostAuthor(user.id, post_id) ? "own" : "others"; 
    if (!userPermissions.can_tag_posts[postOwner]) {
      return c.json({ error: "User does not have permission to remove tags from posts" }, 401);
    }

    await postTagController.removeTagFromPost(post_id, tag_id);
    return c.json(200);
  } catch(error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get tags from post
app.get("/:course_id/:post_id/tags", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id, post_id } = c.req.param();
    const user = c.var.user;

    if (!await isUserMemberOfCourse(user.id, course_id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tags = await postTagController.getPostTags(post_id);
    return c.json({ tags: tags }, 200);
  } catch(error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create reply
app.post("/reply/:comment_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { comment_id } = c.req.param();
    const { reply_content, options, course_id_data } = await c.req.json();
    const user = c.var.user;

    const content = z.string().safeParse(reply_content);
    if (!content.success) {
      return c.json({ error: content.error.message }, 400);
    }
    const mutatePostOptions = mutatePostOptionsSchema.safeParse(options);
    if (!mutatePostOptions.success) {
      return c.json({ error: mutatePostOptions.error.message }, 400);
    }
    const course_id_parsed = z.string().uuid().safeParse(course_id_data);
    if (!course_id_parsed.success) {
      return c.json({ error: course_id_parsed.error.message }, 400);
    }
    const course_id = course_id_parsed.data;
  
    const userPermissions = await getUserPermissionsInCourse(user.id, course_id);
    if (!userPermissions.can_create_post) {
      return c.json({ error: "User does not have permission to create reply" }, 401);
    }

    const reply = await postCommentReplyController.createReply(user.id, comment_id, content.data, mutatePostOptions.data);
    return c.json({ reply: reply }, 200);
  } catch(error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete reply
app.delete("/:course_id/reply/:reply_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id, reply_id } = c.req.param();
    const user = c.var.user;

    const userPermissions = await getUserPermissionsInCourse(user.id, course_id);
    const replyOwner = await isUserReplyAuthor(user.id, reply_id) ? "own" : "others"; 
    if (!userPermissions.can_delete_posts[replyOwner]) {
      return c.json({ error: "User does not have permission to delete reply" }, 401);
    }

    await postCommentReplyController.deleteReply(reply_id);
    return c.json(200);
  } catch(error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update reply
app.patch("/reply/:reply_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { reply_id } = c.req.param();
    const { reply_content, options, course_id_data } = await c.req.json();
    const user = c.var.user;

    const content = z.string().safeParse(reply_content);
    if (!content.success) {
      return c.json({ error: content.error.message }, 400);
    }
    const mutatePostOptions = mutatePostOptionsSchema.safeParse(options);
    if (!mutatePostOptions.success) {
      return c.json({ error: mutatePostOptions.error.message }, 400);
    }
    const course_id_parsed = z.string().uuid().safeParse(course_id_data);
    if (!course_id_parsed.success) {
      return c.json({ error: course_id_parsed.error.message }, 400);
    }
    const course_id = course_id_parsed.data;
  
    const userPermissions = await getUserPermissionsInCourse(user.id, course_id);
    const replyOwner = await isUserReplyAuthor(user.id, reply_id) ? "own" : "others"; 
    if (!userPermissions.can_edit_post[replyOwner]) {
      return c.json({ error: "User does not have permission to update reply" }, 401);
    }

    const reply = await postCommentReplyController.updateReply(reply_id, user.id, content.data, mutatePostOptions.data);
    return c.json({ reply: reply }, 200);
  } catch(error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get reply
app.get("/:course_id/reply/:reply_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id, reply_id } = c.req.param();
    const user = c.var.user;
    
    if (!await isUserMemberOfCourse(user.id, course_id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const reply = await postCommentReplyController.getReply(reply_id);
    return c.json({ reply: reply }, 200);
  } catch(error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { app };

Deno.serve(app.fetch);
