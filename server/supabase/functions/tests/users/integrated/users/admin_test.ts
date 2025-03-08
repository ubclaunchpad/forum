import { afterAll, beforeEach, describe, it} from "jsr:@std/testing/bdd";
import { assertEquals } from "jsr:@std/assert";
import { userController } from "../../../../users/controller.ts";
import { ProfileWithoutId, User } from "@shared/mod.ts";
import { supa } from "../../../../_shared/db.ts";


const testUser = {
    first_name: "Test",
    last_name: "User",
    email: "test@example.com",
    password: "securePassword123",
    timezone: "UTC",
    pronouns: "they/them",
};


describe("Admin functions", () => {
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


    it("should throw an error if the userid is not found", async () => {
        const fakeUUID = '00000000-0000-0000-0000-000000000000';
        try {
            await userController.makeUserAdmin(fakeUUID);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new Error("Error is not an instance of Error");
            }
            assertEquals(error.message, "User account is not active");
        }
    });
    it("should create a new admin user", async () => {
        const user: User  = await userController.createUserViaEmailPassword(testUser);
        const profile: ProfileWithoutId = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            timezone: user.timezone,
            pronouns: user.pronouns,
            username: user.email,
        }
        await userController.activateUserAccount(user.id,profile, true);
        await userController.makeUserAdmin(user.id);
        const isAdmin = await userController.isUserAdmin(user.id);
        assertEquals(isAdmin, true);

    });

    it("should do nothing if the user is already an admin", async () => {
        const user = await userController.createUserViaEmailPassword(testUser);
        const profile: ProfileWithoutId = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            timezone: user.timezone,
            pronouns: user.pronouns,
            username: user.email,
        }
        await userController.activateUserAccount(user.id, profile, true);
        await userController.makeUserAdmin(user.id);
        // Try to make admin again - should not throw
        await userController.makeUserAdmin(user.id);
        const isAdmin = await userController.isUserAdmin(user.id);
        assertEquals(isAdmin, true);
    });

    it("should throw an error if the user account is not approved yet", async () => {
        const user = await userController.createUserViaEmailPassword(testUser);
        try {
            await userController.makeUserAdmin(user.id);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new Error("Error is not an instance of Error");
            }
            assertEquals(error.message, "User account is not active");
        }
    });

    it("should remove an admin user", async () => {
        const user = await userController.createUserViaEmailPassword(testUser);
        const profile: ProfileWithoutId = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            timezone: user.timezone,
            pronouns: user.pronouns,
            username: user.email,
        }
        await userController.activateUserAccount(user.id, profile, true);
        await userController.makeUserAdmin(user.id);
        let isAdmin = await userController.isUserAdmin(user.id);
        assertEquals(isAdmin, true);
        
        await userController.removeUserAdmin(user.id);
        isAdmin = await userController.isUserAdmin(user.id);
        assertEquals(isAdmin, false);
    });

    it("should get all admin users", async () => {
        const user = await userController.createUserViaEmailPassword(testUser);
        const profile: ProfileWithoutId = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            timezone: user.timezone,
            pronouns: user.pronouns,
            username: user.email,
        }

        await userController.activateUserAccount(user.id, profile, true);
        await userController.makeUserAdmin(user.id);
        
        const adminUsers = await userController.getAllAdminUsers();
        assertEquals(adminUsers.length, 1);
        assertEquals(adminUsers[0].id, user.id);
    });

    it("should throw when deleting a user that is an admin", async () => {
        const user = await userController.createUserViaEmailPassword(testUser);
        const profile: ProfileWithoutId = {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            timezone: user.timezone,
            pronouns: user.pronouns,
            username: user.email,
        }
        await userController.activateUserAccount(user.id, profile, true);
        await userController.makeUserAdmin(user.id);
        
        try {
            await userController.deleteUserById(user.id);
        } catch (error) {
            if (!(error instanceof Error)) {
                throw new Error("Error is not an instance of Error");
            }
            assertEquals(error.message, "Cannot delete an admin user");
        }
    });

});
