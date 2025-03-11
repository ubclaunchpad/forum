import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  it,
} from "jsr:@std/testing/bdd";
import {
  assertArrayIncludes,
  assertEquals,
  assertExists,
  assertInstanceOf,
} from "jsr:@std/assert";
import { userController } from "../../../../users/controller.ts";
import { supa } from "../../../../_shared/db.ts";
import {
  AuthError,
  InputValidationError,
  NotFoundError,
} from "../../../../_shared/errors.ts";
import { stub } from "jsr:@std/testing/mock";
import { PostgrestBuilder } from "npm:@supabase/postgrest-js@1.19.2";

// Test data
const testUser = {
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  password: "securePassword123!",
  timezone: "UTC",
  pronouns: "they/them",
};

const mockFrom = {
  from: () => ({
    insert: () => ({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: null,
            error: new Error("Database query failed"),
            count: null,
            status: 500,
            statusText: "ERROR",
          }),
      }),
    }),
  }),
};

describe("User Integration Tests", () => {
  beforeEach(async () => {
    const users = await supa.auth.admin.listUsers();
    for (const user of users.data.users) {
      await supa.auth.admin.deleteUser(user.id);
    }
  });

  afterAll(async () => {
    const users = await supa.auth.admin.listUsers();
    for (const user of users.data.users) {
      await supa.auth.admin.deleteUser(user.id);
    }
  });

  describe("User Creation", () => {
    it("should create a new user successfully", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      const user = await supa.auth.admin.getUserById(id);
      assertEquals(user.data.user?.email, testUser.email);
    });

    describe("When signing up through the email/password flow", () => {
      it("should register a new auth user successfully", async (t) => {
        const { id } = await userController.createUserViaEmailPassword(
          testUser,
        );

        const user = await supa.auth.admin.getUserById(id);
        try {
          await userController.getUserById(id);
        } catch (e) {
          if (e instanceof NotFoundError) {
            assertEquals(e.message, "User not found");
          } else {
            throw e;
          }
        }
        assertEquals(user.data.user?.email, testUser.email);
        assertEquals(user.data.user?.id, id);

        const accountStatus = await userController.getUserAccountStatus(id);
        assertExists(accountStatus);

        if (userController.isInviteEnforced()) {
          assertEquals(accountStatus.status, "waiting_for_approval");
        } else {
          assertEquals(accountStatus.status, "approve_on_login");
        }
      });

      it("should fail if the user already exists", async () => {
        await userController.createUserViaEmailPassword(testUser);
        try {
          await userController.createUserViaEmailPassword(testUser);
          throw new Error("Should have thrown AuthError");
        } catch (e) {
          assertInstanceOf(e, AuthError);
        }
      });

      it("should fail if password is less than 8 characters", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: "short",
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if password is not provided", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: undefined as unknown as string,
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if email is not provided", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            email: undefined as unknown as string,
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if password does not contain at least one uppercase letter", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: "password123",
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if password does not contain at least one lowercase letter", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: "PASSWORD123",
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if password does not contain at least one number", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: "Password123",
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if password does not contain at least one special character", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: "Password123",
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });

      it("should fail if password does not contain at least one uppercase letter", async () => {
        try {
          await userController.createUserViaEmailPassword({
            ...testUser,
            password: "password123",
          });
          throw new Error("Should have thrown InputValidationError");
        } catch (e) {
          assertInstanceOf(e, InputValidationError);
        }
      });
    });
  });

  // describe("User Retrieval", () => {
  //     it("should throw NotFoundError for non-existent user", async () => {
  //         const nonExistentId = "00000000-0000-0000-0000-000000000000";
  //         try {
  //             await userController.getUserById(nonExistentId);
  //             throw new Error("Should have thrown NotFoundError");
  //         } catch (error) {
  //             assertEquals((error as Error).message, "User not found");
  //         }
  //     });

  //     it("should return empty list when no users exist", async () => {
  //         const users = await userController.getAllUsers();
  //         assertEquals(Array.isArray(users), true);
  //         assertEquals(users.length, 0);
  //     });
  // });

  // describe("User Invitation Flow", () => {
  //     const invitedUser = {
  //         first_name: "Invited",
  //         last_name: "User",
  //         email: "invited@example.com",
  //         password: "securePassword123"
  //     };
  //     let userId: string;

  //     beforeEach(async () => {
  //         const user = await userController.createUserViaEmailPassword(invitedUser);
  //         userId = user.id;
  //     });

  //     afterEach(async () => {
  //         await userController.deleteUserByEmail(invitedUser.email);
  //     });

  //     it("should successfully delete user invite", async () => {
  //         await userController.deleteUserInvite(userId);
  //         const status = await userController.getUserAccountStatus(userId);
  //         assertEquals(status, null);
  //     });
  // });

  // describe.ignore("Profile Management", () => {
  //     const testUser = {
  //         first_name: "Profile",
  //         last_name: "Test",
  //         email: "profile@example.com",
  //         password: "securePassword123"
  //     };
  //     let userId: string;

  //     beforeEach(async () => {
  //         const user = await userController.createUserViaEmailPassword(testUser);
  //         userId = user.id;
  //     });

  //     afterEach(async () => {
  //         await userController.deleteUserByEmail(testUser.email);
  //     });

  //     it("should update user profile", async () => {
  //         const updates = {
  //             first_name: "Updated",
  //             last_name: "Name",
  //             timezone: "GMT",
  //             bio: "Test bio"
  //         };

  //         const updatedProfile = await userController.updateUserProfile(userId, updates);
  //         assertEquals(updatedProfile.first_name, updates.first_name);
  //         assertEquals(updatedProfile.last_name, updates.last_name);
  //         assertEquals(updatedProfile.timezone, updates.timezone);
  //         assertEquals(updatedProfile.bio, updates.bio);
  //     });

  //     it("should handle non-existent user for profile update", async () => {
  //         const nonExistentId = "00000000-0000-0000-0000-000000000000";
  //         try {
  //             await userController.updateUserProfile(nonExistentId, { first_name: "Test" });
  //             throw new Error("Should have thrown NotFoundError");
  //         } catch (error) {
  //             assertEquals((error as Error).message, "User not found");
  //         }
  //     });
  // });
});
