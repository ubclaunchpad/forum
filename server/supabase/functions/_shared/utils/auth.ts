import { supa } from "../db.ts";
import { Context } from "jsr:@hono/hono";
import { AuthError } from "../errors.ts";
import { createMiddleware } from "jsr:@hono/hono/factory";

export async function signUpByEmailPassword(
  email: string,
  password: string,
  args: Record<string, unknown> = {},
) {
  const { data, error } = await supa.auth.signUp({
    email,
    password,
    options: {
      data: args,
    },
  });

  if (error) {
    console.error(error);
    throw new AuthError(error.message);
  }
  if (!data.user) {
      throw new AuthError("User not found");
  }

    return data.user;
}

export async function deleteUser(userId: string) {
  const { error } = await supa.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function validateUserFromToken(token: string) {
  const { data, error } = await supa.auth.getUser(token);
  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

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

export type UserVariables = {
  user: any;
};

export const authMiddleware = createMiddleware<{
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
