import { supa } from "../db.ts";
import { AuthError } from "../errors.ts";

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
