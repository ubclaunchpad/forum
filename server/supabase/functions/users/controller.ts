import { supa } from "../_shared/db.ts";

import {
  AccountStatus,
  AccountStatusValue,
  ProfileWithoutId,
  User,
  WithId,
  WithEmailAndPassword,
  emailPasswordSchema,
} from "@shared/mod.ts";
import {  InputValidationError, NotFoundError, UserStatusError } from "../_shared/errors.ts";
import { signUpByEmailPassword } from "../_shared/utils/auth.ts";

// TEMP
const ENFORCE_INVITES = true;

export function isInviteEnforced(): boolean {
  return ENFORCE_INVITES;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error: _ } = await supa.from("profiles").select("*");
  //   if (error) {
  //     throw new DatabaseError(error.message);
  //   }
  return data as User[];
}

/**
 * Get a user by id
 */
export async function getUserById(id: string): Promise<User> {
  const { data, error: _ } = await supa.from("profiles").select("*").eq(
    "id",
    id,
  );
  //   if (error) {
  //     throw new DatabaseError(error.message);
  //   }
  if (!data || data.length === 0) {
    throw new NotFoundError("User not found");
  }
  return data[0] as User;
}

/**
 * Delete a user by id
 */
export async function deleteUserById(id: string): Promise<void> {
  const { error: _ } = await supa.from("profiles").delete().eq(
    "id",
    id,
  );
  // if (deleteError) {
  //     throw new DatabaseError(deleteError.message);
  // }
  await supa.auth.admin.deleteUser(id);
  //   if (resp.error) {
  //     throw new DatabaseError(resp.error.message);
  //   }
}

/**
 * Create new user profile
 * This function is a crucial part of the user onboarding process
 */
export async function createUserProfile(user: User): Promise<User> {
  const { data: profile, error: _ } = await supa.from("profiles")
    .insert({
      ...user,
    }).select().single();

  //   if (profileError) {
  //     console.error(profileError);
  //     throw new DatabaseError(profileError.message);
  //   }

  return profile as User;
}

/**
 * Create a new user
 */
export async function createUserViaEmailPassword(
  { email, password }: WithEmailAndPassword,
): Promise<WithId<{}>> {

  const matchResult = emailPasswordSchema.safeParse({ email, password });
  if (!matchResult.success) {
    throw new InputValidationError(matchResult.error.message);
  }

  const authUser = await signUpByEmailPassword(
    email,
    password,
  );

  const statusToSet = ENFORCE_INVITES ? "waiting_for_approval" : "approve_on_login";
    await supa.from("account_status").insert({
      user_id: authUser.id,
      status: statusToSet,
    });
    console.log(
      "User created with account status waiting for approval",
      authUser.id,
    );
    return {
      id: authUser.id,
    };

}

async function initializeUserAccountStatus(userId: string): Promise<AccountStatus> {
  const {data } = await supa.from("account_status").insert({
    user_id: userId,
    status: ENFORCE_INVITES ? "waiting_for_approval" : "approve_on_login",
  }).select().single()

  return data
}

/**
 * Delete a profile by email
 * This function can only delete a profile - meaning if user has yet to be approved, it will not delete the user from auth
 * To unconditionally delete a user, use deleteUserById
 */
export async function deleteProfileByEmail(email: string): Promise<void> {
  const { data, error: _ } = await supa.from("profiles").select("*").eq(
    "email",
    email,
  );
  if (!data || data.length === 0) {
    console.info(`User with email ${email} not found - try deleting user by id instead`);
    throw new NotFoundError(`User with email ${email} not found`);
  }

  const user = data[0];
  await deleteUserById(user.id);
}

/**
 * Get the account status for a user
 */
export async function getUserAccountStatus(
  userId: string,
): Promise<AccountStatus | null> {
  const { data, error: _ } = await supa.from("account_status").select("*").eq(
    "user_id",
    userId,
  );

  if (!data || data.length === 0) {
    return null;
  }
  return data[0] as AccountStatus;
}

/**
 * Activate a user account
 * This function is called when an account is created not via email/password; e.g. via social login
 */
export async function activateAccountAndProfile(
  userId: string,
  profile: ProfileWithoutId,
): Promise<void> {
  const accountStatus = await userController.getUserAccountStatus(userId);

  if (!accountStatus) {
    throw new NotFoundError("User account status not found");
  }

  if (accountStatus.status === "active") {
    throw new UserStatusError("User is already active");
  }

  if (accountStatus.status === "waiting_for_approval" && ENFORCE_INVITES) {
    throw new UserStatusError("User is not authorized to access this application yet. Please contact an administrator to get access.");
  }

  await createUserProfile({
    id: userId,
    ...profile,
    username: profile.username
  });
  const { data: statusData, error: _ } = await supa.from("account_status").update({
    status: "active",
    approved_at: accountStatus.approved_at ?? new Date(),
    joined_at: new Date(),
  }).eq("user_id", userId).select().single();

  return statusData;
}

/**
 * Approve a user's account
 */
export async function approveUserAccount(
  userId: string,
): Promise<void> {
  const { error: _ } = await supa.from("account_status").update({
    status: "approve_on_login",
  }).eq("user_id", userId);
}

/**
 * Get account status for all users
 */
export async function getAllUsersAccountStatus(
  statusesToInclude: AccountStatusValue[],
): Promise<(AccountStatus & Record<string, unknown>)[]> {
  const { data, error: _ } = await supa.from("account_status").select('*').in(
    "status",
    statusesToInclude,
  );
  return data as unknown as (AccountStatus & Record<string, unknown>)[];
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, "id" | "email">>,
): Promise<User> {
  const { data: profile} = await supa
    .schema("public")
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (!profile) {
    throw new NotFoundError("User not found");

  }

  return profile as User;
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error: _ } = await supa
    .from("admin_users")
    .select("id")
    .eq("id", userId);

  return (data && data.length > 0) ?? false;
}

/**
 * Make a user an admin
 */
export async function makeUserAdmin(userId: string): Promise<void> {
  const isAlreadyAdmin = await userController.isUserAdmin(userId);
  if (isAlreadyAdmin) {
    return;
  }

  const accountStatus = await userController.getUserAccountStatus(userId);
  if (!accountStatus || accountStatus.status !== "active") {
    throw new UserStatusError("User account is not active");
  }

  const { error: _ } = await supa
    .from("admin_users")
    .insert({ id: userId });
}

/**
 * Remove admin privileges from a user
 */
export async function removeUserAdmin(userId: string): Promise<void> {
  const { error: _ } = await supa
    .from("admin_users")
    .delete()
    .eq("id", userId);

  //   if (error) {
  //     throw new DatabaseError(error.message);
  //   }
}

/**
 * Get all admin users with their profiles
 */
export async function getAllAdminUsers(): Promise<User[]> {
  const { data, error: _ } = await supa
    .from("admin_users")
    .select("*");

  return data as unknown as User[];
}

/**
 * Update a user's photo
 */
export async function updateUserPhoto(
  userId: string,
  file: File,
): Promise<void> {
  const user = await userController.getUserById(userId);
  const avatarUrl = user.avatar_url;

  const randomId = crypto.randomUUID();

  if (avatarUrl?.includes(userId)) {
    const { data: list, error } = await supa.storage.from("images").list(
      `users/${userId}`,
    );
    const filesToRemove = list?.map((x) => `users/${userId}/${x.name}`);
    if (filesToRemove) {
      await supa.storage.from("images").remove(filesToRemove);
    }
    if (error) {
      console.error(error);
      throw new Error("Failed to remove old photos");
    }
  }

  const { error: uploadError } = await supa.storage.from("images").upload(
    `users/${userId}/${randomId}`,
    file,
  );
  const { data: { publicUrl } } = supa.storage.from("images").getPublicUrl(
    `users/${userId}/${randomId}`,
  );

  // NOTE: on local development, supabase replaces the localhost with kong; which I think is an API Gateway/Docker thing.
  const prefix = Deno.env.get("SUPABASE_URL") ?? "";
  const localPrefix = Deno.env.get("LOCAL_SUPABASE_URL") ?? "";
  let url = publicUrl;

  if (localPrefix.includes("localhost")) {
    url = url.replace(prefix, localPrefix);
  }
  if (uploadError) {
    console.error(uploadError);
    throw new Error("Failed to upload photo");
  }

  const { error: updateError } = await supa.from("profiles").update({
    avatar_url: url,
  }).eq("id", userId);

  if (updateError) {
    console.error(updateError);
    throw new Error("Failed to update photo");
  }
}

export const userController = {
  getUserAccountStatus,
  activateAccountAndProfile,
  approveUserAccount,
  getAllUsersAccountStatus,
  updateUserProfile,
  createUserViaEmailPassword,
  deleteProfileByEmail,
  isUserAdmin,
  makeUserAdmin,
  removeUserAdmin,
  getAllAdminUsers,
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserPhoto,
  isInviteEnforced,
  initializeUserAccountStatus,
};
``
// TODO: remove this function
// /**
//  * Invite a user to the application
//  */
// export async function inviteUserToApplication(
//   userId: string,
//   invitingUserId: string | null = null,
//   autoActivate: boolean = false,
// ): Promise<AccountStatus | null> {
//   const user = await supa.auth.admin.getUserById(userId);
//   const accountStatus = await userController.getUserAccountStatus(userId);

//   if (autoActivate && user) {
//     if (accountStatus?.status === "active") {
//       console.info("User is already active", userId);
//       return accountStatus;
//     }
//     // await userController.activateUserAccount(userId, user.data, true);
//     return accountStatus;
//   }

//   if (accountStatus?.status === "active") {
//     console.info("User is already active", userId);
//     return accountStatus;
//   }

//   if (accountStatus?.status === "approve_on_login") {
//     return accountStatus;
//   } else {
//     console.info("User is waiting for approval", userId);
//     const status: AccountStatusValue = autoActivate
//       ? "approve_on_login"
//       : "waiting_for_approval";

//     const { data: statusData, error: _ } = await supa.from("account_status")
//       .insert({
//         user_id: userId,
//         status,
//         invited_by: invitingUserId,
//       }).select().single();

//     return statusData;
//   }
// }

// TODO: remove this function
// /**
//  * delete a user's invite
//  */
// export async function deleteUserInvite(
//   userId: string,
// ): Promise<void> {
//   const { error: _ } = await supa.from("account_status").delete().eq(
//     "user_id",
//     userId,
//   );
//   //   if (error) {
//   //     throw new DatabaseError(error.message);
//   //   }
// }
