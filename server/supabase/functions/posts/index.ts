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
import { getUserPermissionsInCourse, isUserMemberOfCourse, isUserPostAuthor } from "../_shared/utils/permission_manager.ts";
import { postTagController } from "./controllers/tags.ts";
import { NotFoundError, PermissionError } from "../_shared/errors.ts";

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
})

export { app };

Deno.serve(app.fetch);
