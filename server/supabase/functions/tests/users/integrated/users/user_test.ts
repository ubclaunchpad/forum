import {
  afterAll,
  beforeEach,
  describe,
  it,
} from "jsr:@std/testing/bdd";
import {
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
  UserStatusError,
} from "../../../../_shared/errors.ts";
// import { stub } from "jsr:@std/testing/mock";
// import { PostgrestBuilder } from "npm:@supabase/postgrest-js@1.19.2";
import { ProfileWithoutId } from "@shared/mod.ts";

// Test data
const testUser = {
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  password: "securePassword123!",
  timezone: "UTC",
  pronouns: "they/them",
};

const testUser2 = {
  first_name: "Test2",
  last_name: "User2",
  email: "test2@example.com",
  password: "securePassword123!",
  timezone: "UTC",
  pronouns: "they/them",
  username: "testuser2",
}

// const mockFrom = {
//   from: () => ({
//     insert: () => ({
//       select: () => ({
//         single: () =>
//           Promise.resolve({
//             data: null,
//             error: new Error("Database query failed"),
//             count: null,
//             status: 500,
//             statusText: "ERROR",
//           }),
//       }),
//     }),
//   }),
// };

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
      it("should register a new auth user successfully", async () => {
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

  describe("User Approval and Profile Creation", () => {
    describe("When the user has an approved account", () => {
        it("should get approved to have an approved on login status", async () => {
            const { id } = await userController.createUserViaEmailPassword(testUser);
            await userController.approveUserAccount(id);
            const accountStatus = await userController.getUserAccountStatus(id);
            assertEquals(accountStatus?.status, "approve_on_login");
        });
    });

    describe("When creating a profile for a user", () => {
        it("should create a profile for a user", async () => {
            const { id } = await userController.createUserViaEmailPassword(testUser);
            await userController.approveUserAccount(id);
            const accountStatus = await userController.getUserAccountStatus(id);
            assertEquals(accountStatus?.status, "approve_on_login");
            const userProfile: ProfileWithoutId = {
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                timezone: "UTC",
                pronouns: "they/them",
                username: "testuser",
            }
            await userController.activateAccountAndProfile(id, userProfile);
            const profile = await userController.getUserById(id);
            assertEquals(profile.first_name, "Test");
            assertEquals(profile.last_name, "User");
            assertEquals(profile.email, "test@example.com");
            assertEquals(profile.timezone, "UTC");
            assertEquals(profile.pronouns, "they/them");
            assertEquals(profile.username, "testuser");
        });

        it("should fail if the user is not registered", async () => {
            const id = "00000000-0000-0000-0000-000000000000";
            const userProfile: ProfileWithoutId = {
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                username: "testuser",
            }
            try {
                await userController.activateAccountAndProfile(id, userProfile);
                throw new Error("Should have thrown NotFoundError");
            } catch (e) {
                assertInstanceOf(e, NotFoundError);
            }
        });

        it("should fail if the user is not approved", async () => {
            const { id } = await userController.createUserViaEmailPassword(testUser);
            const userProfile: ProfileWithoutId = {
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                username: "testuser",
            }
            try {
                await userController.activateAccountAndProfile(id, userProfile);
                throw new Error("Should have thrown UserStatusError");
            } catch (e) {
                assertInstanceOf(e, UserStatusError);
            }
        });

        it("should fail if the user is already active", async () => {
            const { id } = await userController.createUserViaEmailPassword(testUser);
            await userController.approveUserAccount(id);
            const userProfile: ProfileWithoutId = {
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
                username: "testuser",
            }
            await userController.activateAccountAndProfile(id, userProfile);
            try {
                await userController.activateAccountAndProfile(id, userProfile);
                throw new Error("Should have thrown NotFoundError");
            } catch (e) {
                if (e instanceof Error) {
                    assertEquals(e.message, "User is already active");
                } else {
                    throw e;
                }
            }
        });
        
    });
  });

  describe("User Deletion", () => {
    it("should throw NotFoundError if user profile does not exist", async () => {
      try {
        await userController.createUserViaEmailPassword(testUser);
        await userController.deleteProfileByEmail(testUser.email);
        throw new Error("Should have thrown NotFoundError");
      } catch (e) {
        assertInstanceOf(e, NotFoundError);
      }
    });

    it("should delete user if profile and auth user exist", async () => {
      try {
        const userProfile: ProfileWithoutId = {
            first_name: testUser.first_name,
            last_name: testUser.last_name,
            email: testUser.email,
            username: testUser.email,
        }
        const { id } = await userController.createUserViaEmailPassword(testUser);
        await userController.approveUserAccount(id);
   
        await userController.activateAccountAndProfile(id, userProfile);
        await userController.deleteProfileByEmail(testUser.email);
        const authUser = await supa.auth.admin.getUserById(id);
        assertEquals(authUser.data.user, null);
      } catch (e) {
        throw e;
      }
    });
  });

  describe("User Retrieval", () => {
      it("should throw NotFoundError for non-existent user", async () => {
          const nonExistentId = "00000000-0000-0000-0000-000000000000";
          try {
              await userController.getUserById(nonExistentId);
              throw new Error("Should have thrown NotFoundError");
          } catch (error) {
              assertEquals((error as Error).message, "User not found");
          }
      });

      it("should return empty list when no users exist", async () => {
          const users = await userController.getAllUsers();
          assertEquals(Array.isArray(users), true);
          assertEquals(users.length, 0);
      });

      it("should return a list of users", async () => {
          const testUsers = [
            {
                first_name: "Test",
                last_name: "User",
                email: "test@example.com",
            },
            {
                first_name: "Test",
                last_name: "User",
                email: "test2@example.com",
            },
          ]
          const userIds = [];
          for (const user of testUsers) {
            const { id } = await userController.createUserViaEmailPassword({
                email: user.email,
                password: "securePassword123!",
            });
            userIds.push(id);
            await userController.approveUserAccount(id);
            await userController.activateAccountAndProfile(id, {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                username: user.email,
            });
          }

          const users = await userController.getAllUsers();
          assertEquals(Array.isArray(users), true);
          assertEquals(users.length, testUsers.length);
          for (const user of users) {
            assertEquals(testUsers.some(testUser => testUser.email === user.email), true);
          }
      });
  });


  describe("Profile Updates", () => {
    it("should update a user's profile", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      await userController.approveUserAccount(id);
      await userController.activateAccountAndProfile(id, {
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        username: testUser.email,
      });
      const updatedProfile = await userController.updateUserProfile(id, {
        first_name: "Updated",
      });
      assertEquals(updatedProfile.first_name, "Updated");
    });

    it("should fail if the user is not active", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      try {
        await userController.updateUserProfile(id, {
          first_name: "Updated",
        });
        throw new Error("Should have thrown UserStatusError");
      } catch (e) {
        assertInstanceOf(e, NotFoundError);
      }
    }); 
  });

  describe("User Admin Functions", () => {
    it("should throw UserStatusError if user is not active", async () => {
      try {
        const { id } = await userController.createUserViaEmailPassword(testUser);
        await userController.makeUserAdmin(id);
        throw new Error("Should have thrown NotFoundError");
      } catch (e) {
        assertInstanceOf(e, UserStatusError);
      }
    });

    it("should throw if no such user exists", async () => {
      const fakeUUID = "00000000-0000-0000-0000-000000000000";
      try {
        await userController.makeUserAdmin(fakeUUID);
        throw new Error("Should have thrown NotFoundError");
      } catch (e) {
        assertInstanceOf(e, UserStatusError);
      }
    });

    it("should make a user an admin", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      await userController.approveUserAccount(id);
      await userController.activateAccountAndProfile(id, {
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        username: testUser.email,
      });

      await userController.makeUserAdmin(id);
      const isAdmin = await userController.isUserAdmin(id);
      assertEquals(isAdmin, true);
      const admins = await userController.getAllAdminUsers();
      assertEquals(admins.length, 1);
      assertEquals(admins[0].id, id);
    });

    it("should do nothing if the user is already an admin", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      await userController.approveUserAccount(id);
      await userController.activateAccountAndProfile(id, {
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        username: testUser.email,
      });
      await userController.makeUserAdmin(id);
      await userController.makeUserAdmin(id);
      const isAdmin = await userController.isUserAdmin(id);
      assertEquals(isAdmin, true);
      const admins = await userController.getAllAdminUsers();
      assertEquals(admins.length, 1);
      assertEquals(admins[0].id, id);
    });

    it("should get all admins", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      await userController.approveUserAccount(id);
      await userController.activateAccountAndProfile(id, {
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        username: testUser.email,
      });
      await userController.makeUserAdmin(id);
      const admins = await userController.getAllAdminUsers();
      assertEquals(admins.length, 1);
      assertEquals(admins[0].id, id);
      const { id: id2 } = await userController.createUserViaEmailPassword(testUser2);
      await userController.approveUserAccount(id2);
      await userController.activateAccountAndProfile(id2, {
        first_name: testUser2.first_name,
        last_name: testUser2.last_name,
        email: testUser2.email,
        username: testUser2.email,
      });
      await userController.makeUserAdmin(id2);
      const admins2 = await userController.getAllAdminUsers();
      assertEquals(admins2.length, 2);
      assertEquals(admins2.some(admin => admin.id === id), true);
      assertEquals(admins2.some(admin => admin.id === id2), true);
    });

    it("should remove a user from admins", async () => {
      const { id } = await userController.createUserViaEmailPassword(testUser);
      await userController.approveUserAccount(id);
      await userController.activateAccountAndProfile(id, {
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        email: testUser.email,
        username: testUser.email,
      });
      await userController.makeUserAdmin(id);
      await userController.removeUserAdmin(id);
      const admins = await userController.getAllAdminUsers();
      assertEquals(admins.length, 0);
    });
    
  });

  it("should get all user account statuses", async () => {
    const { id } = await userController.createUserViaEmailPassword(testUser);
    await userController.approveUserAccount(id);
    await userController.activateAccountAndProfile(id, {
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      email: testUser.email,
      username: testUser.email,
    });
    const statuses = await userController.getAllUsersAccountStatus(
      ["active"]
    );
    assertEquals(statuses.length, 1);
    assertEquals(statuses[0].user_id, id);
    assertEquals(statuses[0].status, "active");

    const otherStatuses = await userController.getAllUsersAccountStatus(
      ["waiting_for_approval"]
    );
    assertEquals(otherStatuses.length, 0);
  });
});
