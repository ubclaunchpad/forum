import { Context, Hono } from "jsr:@hono/hono";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from "jsr:@hono/hono/cors";
import {
  newPostOptionsSchema,
  newPostSchema,
} from "@shared/mod.ts";
import {
  createPost,
  deletePost,
  updatePost,
} from "./controllers/crud.ts";
import { NotFoundError } from "../_shared/errors.ts";
import { validateUserFromToken } from "../_shared/utils/auth.ts";
import { postEditInfoSchema } from "@shared/schema/posts.ts";

const functionName = "posts";
const app = new Hono().basePath(`/${functionName}`);

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type", "*"],
    exposeHeaders: ["Authorization", "Content-Type"],
  }),
);

const validateUser = async (c: Context) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const user = await validateUserFromToken(token);
    return user;
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

type UserVariables = {
  user: any;
};

const authMiddleware = createMiddleware<{
  Variables: UserVariables;
}>(
  async (
    c: Context<{ Variables: UserVariables }>,
    next: () => Promise<void>,
  ) => {
    const user = await validateUser(c);
    c.set("user", user);
    await next();
  },
);

app.use("*", authMiddleware);

app.post("/", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { postArgs, optionArgs } = await c.req.json();
    const user = c.var.user;

    const newPostArgs = newPostSchema.safeParse(postArgs);
    const newPostOptions = newPostOptionsSchema.safeParse(optionArgs);

    if (!newPostOptions.success) {
      return c.json({ error: newPostOptions.error.message }, 400);
    }

    if (!newPostArgs.success) {
      return c.json({ error: newPostArgs.error.message }, 400);
    }

    const post = await createPost(user.id, newPostArgs, newPostOptions);
    return c.json(post);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Delete a post by UUID
app.delete("/:post_id", async (c: Context<{ Variables: UserVariables }>) => {
  // try {
  //   const {post_id} = c.req.param();
  //   const user = c.var.user;

  //   await deletePost(post_id, user.id);

  //   return {"success" : true}
  // } catch (error) {
  //   return c.json({ error: (error as Error).message }, 500);
  // }
})

// Update a post by UUID
app.put("/:post_id", async (c: Context<{ Variables: UserVariables }>) => {
  // try {
  //   const {post_id} = c.req.param();
  //   const { postEditArgs } = await c.req.json();
  //   const user = c.var.user;

  //   const postEditInfo = postEditInfoSchema.safeParse(postEditArgs);

  //   if (!postEditInfo.success) {
  //     return c.json({ error: postEditInfo.error.message }, 400);
  //   }

  //   await updatePost(post_id, user.id, postEditInfo);

  //   return {"success" : true}
  // } catch (error) {
  //   return c.json({ error: (error as Error).message }, 500);
  // }
})
