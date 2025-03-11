import { assertEquals } from "jsr:@std/assert";
import { describe, it, beforeAll, afterAll, beforeEach, afterEach, before } from "jsr:@std/testing/bdd";
import { app } from "../../../users/index.ts"; 
import { userController } from "../../../users/controller.ts";
import { newUserSchema } from "@shared/schema/users.ts";
import type { AccountStatus, AccountStatusValue } from "@shared/schema/users.ts";
import {
    assertSpyCall,
    assertSpyCalls,
    returnsNext,
    Stub,
    stub,
  } from "jsr:@std/testing/mock";
import { supa } from "../../../_shared/db.ts";

// Test data
const testUser = {
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    password: "securePassword123",
    timezone: "UTC",
    pronouns: "they/them",
};

// const testUsers = [
//     {
//         first_name: "Test1",
//         last_name: "User1",
//         email: "test1@example.com",
//         password: "securePassword123",
//     },
//     {
//         first_name: "Test2",
//         last_name: "User2",
//         email: "test2@example.com",
//         password: "securePassword123",
//     }
// ];

describe("User API Tests", () => {
    beforeAll(async () => {
        const users = await supa.auth.admin.listUsers();
        for (const user of users.data.users) {
            await supa.auth.admin.deleteUser(user.id);
        }
    });

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

//     describe("User Creation", () => {
        it("should reject user creation if email is not provided", async () => {
            const { email: _, ...invalidUser } = { ...testUser };
            
            const res = await app.request('/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invalidUser)
            });

            assertEquals(res.status, 400);
            const data = await res.json();
            assertEquals(data.error, "Validation failed");
        });

//         it("should reject user creation if password is not provided", async () => {
//             const { password: _, ...invalidUser } = { ...testUser };

//             const res = await app.request('/users', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(invalidUser)
//             });

//             assertEquals(res.status, 400);
//             const data = await res.json();
//             assertEquals(data.error, "Validation failed");
//         });

//         it("should reject user creation if first_name is not provided", async () => {
//             const { first_name: _, ...invalidUser } = { ...testUser };

//             const res = await app.request('/users', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(invalidUser)
//             });

//             assertEquals(res.status, 400);
//             const data = await res.json();
//             assertEquals(data.error, "Validation failed");
//         });

//         it("should reject user creation if last_name is not provided", async () => {
//             const { last_name: _, ...invalidUser } = { ...testUser };

//             const res = await app.request('/users', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(invalidUser)
//             })

//             assertEquals(res.status, 400);
//             const data = await res.json();
//             assertEquals(data.error, "Validation failed");
//         });

//         it("should accept optional fields", async () => {
//             const getUserAccountStatusStub = stub(
//                 userController, 
//                 "getUserAccountStatus", 
//                 async () => ({
//                     id: "test-id",
//                     user_id: "test-user-id",
//                     status: "approve_on_login" as AccountStatusValue,
//                     created_at: new Date(),
//                     updated_at: new Date(),
//                     invited_at: null,
//                     joined_at: null,
//                     invited_by: null
//                 })
//             );
        
//             const validUser = {
//                 first_name: "Test",
//                 last_name: "User",
//                 email: "test2@example.com",
//                 password: "securePassword123",
//             };

//             const res = await app.request('/users', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(validUser)
//             });

//             assertEquals(res.status, 201);
//             const data = await res.json();
//             assertEquals(data.email, validUser.email);
//             assertEquals(data.first_name, validUser.first_name);
//             assertEquals(data.last_name, validUser.last_name);

//             getUserAccountStatusStub.restore();
//         });
//     });

//     describe("User Retrieval", () => {
//         it("should return 404 for non-existent user", async () => {
//             const nonExistentId = "00000000-0000-0000-0000-000000000000";
            
//             const res = await app.request(`/users/${nonExistentId}`, {
//                 method: 'GET',
//             });

//             assertEquals(res.status, 404);
//             const data = await res.json();
//             assertEquals(data.error, "User not found");
//         });

//         it("should return 404 for deleted user", async () => {
//             const getUserAccountStatusStub = stub(
//                 userController, 
//                 "getUserAccountStatus", 
//                 async () => ({
//                     id: "test-id",
//                     user_id: "test-user-id",
//                     status: "approve_on_login" as AccountStatusValue,
//                     created_at: new Date(),
//                     updated_at: new Date(),
//                     invited_at: null,
//                     joined_at: null,
//                     invited_by: null
//                 })
//             );

//             const validUser = {
//                 first_name: "Test",
//                 last_name: "User",
//                 email: "test3@example.com",
//                 password: "securePassword123",
//             };

//             const res = await app.request('/users', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(validUser)
//             });

//             assertEquals(res.status, 201);
//             const data = await res.json();
//             const userId = data.id;
//             assertEquals(data.email, validUser.email);
//             assertEquals(data.first_name, validUser.first_name);
//             assertEquals(data.last_name, validUser.last_name);

//             getUserAccountStatusStub.restore();

//             const deleteRes = await app.request(`/users/${userId}`, {
//                 method: 'DELETE',
//             });

//             assertEquals(deleteRes.status, 200);

//             const getRes = await app.request(`/users/${userId}`, {
//                 method: 'GET',
//             });

//             assertEquals(getRes.status, 404);
//         });

//         it("should return all empty list when no users exist", async () => {
//             const res = await app.request('/users', {
//                 method: 'GET',
//             });

//             assertEquals(res.status, 200);
//             const data = await res.json();
//             assertEquals(Array.isArray(data), true);
//             assertEquals(data.length, 0);
//         });

        
//     });

//     describe("User Schema Validation", () => {
//         it("should validate user schema correctly", () => {
//             const result = newUserSchema.safeParse(testUser);
//             assertEquals(result.success, true);
//         });

//         it("should reject invalid email format", () => {
//             const invalidUser = {
//                 ...testUser,
//                 email: "notanemail"
//             };
//             const result = newUserSchema.safeParse(invalidUser);
//             assertEquals(result.success, false);
//         });

//         it("should accept minimal valid user data", () => {
//             const minimalUser = {
//                 first_name: "Test",
//                 last_name: "User",
//                 email: "test@example.com",
//                 password: "password123"
//             };
//             const result = newUserSchema.safeParse(minimalUser);
//             assertEquals(result.success, true);
//         });

//         it("should accept all optional fields", () => {
//             const fullUser = {
//                 ...testUser,
//                 timezone: "UTC",
//                 pronouns: "they/them",
//                 avatar_url: "https://example.com/avatar.jpg",
//                 bio: "Test bio",
//                 social_links: ["https://twitter.com/test"],
//                 display_name: "Test User",
//                 username: "testuser"
//             };
//             const result = newUserSchema.safeParse(fullUser);
//             assertEquals(result.success, true);
//         });
//     });

//     // describe("Account Status Management", () => {
//     //     const testUser = {
//     //         first_name: "Status",
//     //         last_name: "Test",
//     //         email: "status@example.com",
//     //         password: "securePassword123"
//     //     };
//     //     let userId: string;

//     //     beforeEach(async () => {
//     //         const user = await userController.createUserViaEmailPassword(testUser);
//     //         userId = user.id;
//     //     });

//     //     afterEach(async () => {
//     //         await userController.deleteUserByEmail(testUser.email);
//     //     });

//     //     it("should have correct initial account status", async () => {
//     //         const status = await userController.getUserAccountStatus(userId);
//     //         assertEquals(status.status, "active");
//     //         assertEquals(status.joined_at !== null, true);
//     //     });

//     //     it("should handle non-existent user account status", async () => {
//     //         const nonExistentId = "00000000-0000-0000-0000-000000000000";
//     //         try {
//     //             await userController.getUserAccountStatus(nonExistentId);
//     //             throw new Error("Should have thrown NotFoundError");
//     //         } catch (error) {
//     //             assertEquals(error instanceof NotFoundError, true);
//     //             assertEquals((error as Error).message, "User account status not found");
//     //         }
//     //     });
//     // });

//     describe("User Invitation Flow", () => {
//         let getUserAccountStatusStub: Stub;

//         beforeAll(() => {
     
//         });

//         afterAll(() => {
          
//         });

//         const invitedUser = {
//             first_name: "Invited",
//             last_name: "User",
//             email: "invited@example.com",
//             password: "securePassword123"
//         };
//         let userId: string;

//         beforeEach(async () => {
//             getUserAccountStatusStub = stub(
//                 userController, 
//                 "getUserAccountStatus", 
//                 async () => ({
//                     id: "test-id",
//                     user_id: "test-user-id",
//                     status: "approve_on_login" as AccountStatusValue,
//                     created_at: new Date(),
//                     updated_at: new Date(),
//                     invited_at: null,
//                     joined_at: null,
//                     invited_by: null
//                 })
//             );
//             const user = await userController.createUserViaEmailPassword(invitedUser);
//             userId = user.id;
//         });

//         afterEach(async () => {
//             await userController.deleteUserByEmail(invitedUser.email);
//             if (!getUserAccountStatusStub.restored) {
//                 getUserAccountStatusStub.restore();
//             }
//         });

//         it("should not allow duplicate invites", async () => {
//             try {
//                 const anotherUser = await userController.createUserViaEmailPassword({
//                     first_name: "Another",
//                     last_name: "User",
//                     email: "another@example.com",
//                     password: "securePassword123"
//                 });
//                 await userController.activateUserAccount(anotherUser.id, {
//                     first_name: anotherUser.first_name,
//                     last_name: anotherUser.last_name,
//                     email: anotherUser.email,
//                     timezone: anotherUser.timezone,
//                     pronouns: anotherUser.pronouns,
//                     username: anotherUser.email
//                 }, true);
//                 await userController.inviteUserToApplication(userId, anotherUser.id);
//                 await userController.inviteUserToApplication(userId, anotherUser.id);

//                 throw new Error("Should have thrown error for duplicate invite");
//             } catch (error) {
//                 if (!(error instanceof Error)) {
//                     throw error;
//                 }
//                 assertEquals(error instanceof Error, true);
//                 assertEquals(error.message, "User is already invited to the application");
//             }
//         });

//         it("should successfully delete user invite", async () => {
//             getUserAccountStatusStub.restore();
//             await userController.deleteUserInvite(userId);
//             const status = await userController.getUserAccountStatus(userId);
//             assertEquals(status, null);
//         });
//     });

   

//     describe("Profile Management", () => {
//         let getUserAccountStatusStub: Stub;
//         const testUser = {
//             first_name: "Profile",
//             last_name: "Test",
//             email: "profile@example.com",
//             password: "securePassword123"
//         };
//         let userId: string;

//         beforeEach(async () => {
//             getUserAccountStatusStub = stub(
//                 userController, 
//                 "getUserAccountStatus", 
//                 async () => ({
//                     id: "test-id",
//                     user_id: "test-user-id",
//                     status: "approve_on_login" as AccountStatusValue,
//                     created_at: new Date(),
//                     updated_at: new Date(),
//                     invited_at: null,
//                     joined_at: null,
//                     invited_by: null
//                 })
//             );
//             const user = await userController.createUserViaEmailPassword(testUser);
//             userId = user.id;
//         });

//         afterEach(async () => {
//             await userController.deleteUserByEmail(testUser.email);
//             if (!getUserAccountStatusStub.restored) {
//                 getUserAccountStatusStub.restore();
//             }
//         });

//         it("should update user profile", async () => {
//             // const updates = {
//             //     first_name: "Updated",
//             //     last_name: "Name",
//             //     timezone: "GMT",
//             //     bio: "Test bio"
//             // };

//             // const updatedProfile = await userController.updateUserProfile(userId, updates);
//             // assertEquals(updatedProfile.first_name, updates.first_name);
//             // assertEquals(updatedProfile.last_name, updates.last_name);
//             // assertEquals(updatedProfile.timezone, updates.timezone);
//             // assertEquals(updatedProfile.bio, updates.bio);
//         });

//         it("should not update email through profile update", async () => {
//             // try {
//             //     await userController.updateUserProfile(userId, {
//             //         email: "newemail@example.com"
//             //     } as any);
//             //     throw new Error("Should not allow email update");
//             // } catch (error) {
//             //     if (!(error instanceof DatabaseError)) {
//             //         throw error;
//             //     }
//             //     assertEquals(error instanceof DatabaseError, true);
//             // }
//         });

//         it("should handle non-existent user", async () => {
//             // const nonExistentId = "00000000-0000-0000-0000-000000000000";
//             // try {
//             //     await userController.updateUserProfile(nonExistentId, { first_name: "Test" });
//             //     throw new Error("Should have thrown NotFoundError");
//             // } catch (error) {
//             //     assertEquals(error instanceof NotFoundError, true);
//             // }
//         });
//     });

//     // describe("Admin User Management", () => {
//     //     const adminUser = {
//     //         first_name: "Admin",
//     //         last_name: "User",
//     //         email: "admin@example.com",
//     //         password: "securePassword123"
//     //     };
//     //     let userId: string;

//     //     beforeEach(async () => {
//     //         const user = await userController.createUserViaEmailPassword(adminUser);
//     //         userId = user.id;
//     //     });

//     //     afterEach(async () => {
//     //         await userController.deleteUserByEmail(adminUser.email);
//     //     });

//     //     it("should make user an admin", async () => {
//     //         await userController.makeUserAdmin(userId);
//     //         const isAdmin = await userController.isUserAdmin(userId);
//     //         assertEquals(isAdmin, true);
//     //     });

//     //     it("should not allow duplicate admin creation", async () => {
//     //         await userController.makeUserAdmin(userId);
//     //         try {
//     //             await userController.makeUserAdmin(userId);
//     //             throw new Error("Should not allow duplicate admin creation");
//     //         } catch (error) {
//     //             if (!(error instanceof Error)) {
//     //                 throw error;
//     //             }
//     //             assertEquals(error instanceof Error, true);
//     //             assertEquals(error.message, "User is already an admin");
//     //         }
//     //     });

//     //     it("should remove admin privileges", async () => {
//     //         await userController.makeUserAdmin(userId);
//     //         await userController.removeUserAdmin(userId);
//     //         const isAdmin = await userController.isUserAdmin(userId);
//     //         assertEquals(isAdmin, false);
//     //     });

//     //     it("should list all admin users", async () => {
//     //         await userController.makeUserAdmin(userId);
//     //         const admins = await userController.getAllAdminUsers();
//     //         assertEquals(Array.isArray(admins), true);
//     //         const admin = admins.find(a => a.id === userId);
//     //         assertEquals(admin?.email, adminUser.email);
//     //     });
//     // });
});
