import { Context, Hono } from "jsr:@hono/hono";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from "jsr:@hono/hono/cors";
import {
  ACCOUNT_STATUS_VALUES,
  AccountStatusValue,
  newPostOptionsSchema,
  newPostSchema,
  newUserSchema,
  profileWithoutId,
} from "@shared/mod.ts";
import {
  approveUserAccount,
  createPost,
  deleteUserById,
  getAllUsers,
  getAllUsersAccountStatus,
  getUserAccountStatus,
  getUserById,
  userController,
} from "./controller.ts";
import { NotFoundError } from "../_shared/errors.ts";
import { validateUserFromToken } from "../_shared/utils/auth.ts";

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
