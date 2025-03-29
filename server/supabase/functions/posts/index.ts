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
  mutatePostOptionsSchema,
  mutatePostPartialSchema,
  mutatePostSchema,
} from "@shared/mod.ts";

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
      const query = c.req.query("enableCommentReplies");
      const enableCommentReplies = query === "true";
      const { post_id } = c.req.param();
      const user = c.var.user;

      const post = await getPost(
        user.id,
        post_id,
        enableCommentReplies,
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
      const query = c.req.query("enableCommentReplies");
      const enableCommentReplies = query === "true";
      const { course_id } = c.req.param();
      const user = c.var.user;

      const post = await getPosts(
        user.id,
        course_id,
        false,
        enableCommentReplies,
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

export { app };

Deno.serve(app.fetch);
