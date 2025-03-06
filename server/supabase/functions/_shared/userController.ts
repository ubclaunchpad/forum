import { supa } from "./db.ts";

import {
  AccountStatus,
  AccountStatusValue,
  NewUser,
  ProfileWithoutId,
  User,
} from "@shared/schema/users.ts";
import { NotFoundError } from "./errors.ts";
import { signUpByEmailPassword } from "./utils/auth.ts";

// TEMP
const ENFORCE_INVITES = true;

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const { data, error:_ } = await supa.from("profiles").select("*");
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
  return data as User[];
}

/**
 * Get a user by id
 */
export async function getUserById(id: string): Promise<User> {
  const { data, error:_ } = await supa.from("profiles").select("*").eq("id", id);
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
  const { error:_ } = await supa.from("profiles").delete().eq(
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
  newUserArgs: NewUser,
): Promise<User> {

  // Create a new user in the auth service
  const authUser = await signUpByEmailPassword(newUserArgs.email, newUserArgs.password, {
    data: {
      first_name: newUserArgs.first_name,
      last_name: newUserArgs.last_name,
    },
  });

  if (ENFORCE_INVITES) {
    const accountStatus = await userController.getUserAccountStatus(
        authUser.id,
    );
    if (!accountStatus) {
       await supa.from("account_status").insert({
        user_id: authUser.id,
        status: "waiting_for_approval",
       });
     return {
        ...newUserArgs,
        id: authUser.id,
        username: newUserArgs.username ?? newUserArgs.email,
     }
    }
    if (accountStatus.status === "waiting_for_approval") {
      throw new NotFoundError(
        "User is not authorized to access this application yet. Please contact an administrator to get access.",
      );
    } 
  }

  // Create a new user profilein the database
  const { password: _, ...userArgs } = newUserArgs;
  const profile: User = {
    ...userArgs,
    id: authUser.id,
    username: newUserArgs.username ?? newUserArgs.email,
  };
  await userController.activateUserAccount(authUser.id, profile);
  return profile;
}

export async function deleteUserByEmail(email: string): Promise<void> {
  const { data, error:_} = await supa.from("profiles").select("*").eq(
    "email",
    email,
  );
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
  if (!data || data.length === 0) {
    return;
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
  const { data, error:_ } = await supa.from("account_status").select("*").eq(
    "user_id",
    userId,
  );
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
  if (!data || data.length === 0) {
    return null;
  }
  return data[0] as AccountStatus;
}

/**
 * Activate a user account
 * This function is called when an account is created not via email/password; e.g. via social login
 */
export async function activateUserAccount(
  userId: string,
  profile: ProfileWithoutId,
  asAdmin: boolean = false,
): Promise<void> {
  const accountStatus = await userController.getUserAccountStatus(userId);
  if (!accountStatus) {
    throw new NotFoundError("User account status not found");
  }
  if (accountStatus.status === "waiting_for_approval") {
    if (!asAdmin) {
      throw new NotFoundError(
        "User is not authorized to access this application yet. Please contact an administrator to get access.",
      );
    } else {
      console.log("Activating user account as admin", userId);
    }
  }
  if (accountStatus.status === "active") {
    throw new Error("User is already active");
  }



    console.log("userId", userId);
    const { data: profileRecord } = await supa.from("profiles")
      .select("*").eq("id", userId).single();
    console.log("profileRecord", profileRecord);
    if (!profileRecord) {
       const m = await createUserProfile({
        id: userId,
        ...profile,
        username: profile.username ?? profile.email,
      });
      console.log("profileRecord", m);
    }
    await supa.from("account_status").update({
        status: "active",
        joined_at: new Date(),
      }).eq("user_id", userId);
 

  const { error:_ } = await supa.from("account_status").update({
    status: "active",
    joined_at: new Date(),
  }).eq("user_id", userId);
//   if (updateError) {
//     throw new DatabaseError(updateError.message);
//   }
}

/**
 * Invite a user to the application
 */
export async function inviteUserToApplication(
  userId: string,
  invitingUserId: string,
  autoActivate: boolean = false,
): Promise<void> {
    const accountStatus = await userController.getUserAccountStatus(userId);
    if (accountStatus) {
        throw new Error("User is already invited to the application");
    }
 
  const status: AccountStatusValue = autoActivate
    ? "approve_on_login"
    : "waiting_for_approval";

  const { error:_ } = await supa.from("account_status").insert({
    user_id: userId,
    status,
    invited_by: invitingUserId,
  });

//   if (createError) {
//     throw new DatabaseError(createError.message);
//   }
}

/**
 * delete a user's invite
 */
export async function deleteUserInvite(
  userId: string,
): Promise<void> {
  const { error:_ } = await supa.from("account_status").delete().eq(
    "user_id",
    userId,
  )
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
}

/**
 * Approve a user's account
 */
export async function approveUserAccount(
  userId: string,
): Promise<void> {
  const { error:_ } = await supa.from("account_status").update({
    status: "approve_on_login",
  }).eq("user_id", userId);
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
}

/**
 * Get account status for all users
 */
export async function getAllUsersAccountStatus(
  statusesToInclude: AccountStatusValue[],
  includeProfile: boolean = false,
): Promise<(AccountStatus & Record<string, unknown>)[]> {
  const { data, error:_ } = await supa.from("account_status").select(`
    *,
    ${includeProfile ? "profiles:user_id(*)" : ""}
  `).in(
    "status",
    statusesToInclude,
  );
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
//   if (!data) {
//     throw new DatabaseError("No data returned from database");
//   }
  return data as unknown as (AccountStatus & Record<string, unknown>)[];
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, "id" | "email">>,
): Promise<User> {
  const { data: profile, error:_ } = await supa
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

//   if (profileError) {
//     throw new DatabaseError(profileError.message);
//   }

  if (!profile) {
    throw new NotFoundError("User not found");
  }

  return profile as User;
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error:_ } = await supa
    .from("admin_users")
    .select("id")
    .eq("id", userId);

  console.log(data);

//   if (error) {
//     throw new DatabaseError(error.message);
//   }
   if (!data) {
    return false;
   }

  return data && data.length > 0;
}

/**
 * Make a user an admin
 */
export async function makeUserAdmin(userId: string): Promise<void> {
    
  const isAlreadyAdmin = await userController.isUserAdmin(userId);
  console.log("isAlreadyAdmin", isAlreadyAdmin);
  if (isAlreadyAdmin) {
    return;
  }

  const accountStatus = await userController.getUserAccountStatus(userId);
  console.log("accountStatus", accountStatus);
  if (!accountStatus || accountStatus.status !== "active") {
    throw new Error("User account is not active");
  }

  console.log("accountStatus", accountStatus);

  const { error:_ } = await supa
    .from("admin_users")
    .insert({ id: userId });

    const getAdminUsers = await supa
      .from("admin_users")
      .select('*');

    console.log("HHHHH")
    console.log("getAdminUsers")
    console.log(getAdminUsers.data)
  console.log("error", _);
//   if (error) {
//     throw new DatabaseError(error.message);
//   }
}

/**
 * Remove admin privileges from a user
 */
export async function removeUserAdmin(userId: string): Promise<void> {
  const { error:_ } = await supa
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
  const { data, error:_ } = await supa
    .from("admin_users")
    .select('*');

    // const profiles = await supa
    //   .from("profiles")
    //   .select("*")
      
    // const adminUsers = await supa
    //   .from("admin_users")
    //   .select('*');

    //   console.log("adminUsers")
    //   console.log(adminUsers.data)
    //   console.log(profiles.data)

    // console.log("HERE")
    console.log(data)

//   if (error) {
//     throw new DatabaseError(error.message);
//   }

  if (!data) {
    return [];
  }

  return data as unknown as User[];
}

    
export const userController = {
  getUserAccountStatus,
  activateUserAccount,
  inviteUserToApplication,
  deleteUserInvite,
  approveUserAccount,
  getAllUsersAccountStatus,
  updateUserProfile,
  createUserViaEmailPassword,
  deleteUserByEmail,
  isUserAdmin,
  makeUserAdmin,
  removeUserAdmin,
  getAllAdminUsers,
  getAllUsers,
  getUserById,
  deleteUserById,
};
