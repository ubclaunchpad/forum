import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { deleteUser, signUpByEmailPassword, validateUserFromToken } from "../../../../_shared/utils/auth.ts";
import { assertEquals } from "jsr:@std/assert";
import { supa } from "../../../../_shared/db.ts";

describe("Supabase Auth Utils", () => {
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
    it("should sign up a user", async () => {
        const user = await signUpByEmailPassword("test@test.com", "password");
        assertEquals(user.email, "test@test.com");
    });
    it("should fail to sign up a user that already exists", async () => {
        await signUpByEmailPassword("test@test.com", "password");
        try {
            await signUpByEmailPassword("test@test.com", "password");
        } catch (e) {
            assertEquals((e as Error).message, "User already registered");
        }
    });
    it("should delete a user", async () => {
        const user = await signUpByEmailPassword("test@test.com", "password");
        await deleteUser(user.id);
        assertEquals(user.email, "test@test.com");
    });
    it("should fail to delete a user that doesn't exist", async () => {
        try {
            const fakeUUID = "00000000-0000-0000-0000-000000000000";
            await deleteUser(fakeUUID);
        } catch (e) {
            if (!(e instanceof Error)) {
                throw new Error("Error is not an instance of Error");
            }
            assertEquals(e.message, "User not found");
        }
    });


    
    it("should validate a user from a token", async () => {
        const user = await signUpByEmailPassword("test@test.com", "password");
        if (!user || !user.email) {
            throw new Error("User not found");
        }
        const authResponse = await supa.auth.signInWithPassword({
            email: user.email,
            password: "password",
        });
        if (!authResponse.data.session?.access_token) {
            throw new Error("Session not found");
        }
        const validatedUser = await validateUserFromToken(authResponse.data.session?.access_token);
        assertEquals(validatedUser.email, "test@test.com");
    });

    it("should fail to validate a user from an invalid token", async () => {
        try {
            await validateUserFromToken("invalid-token");
            throw new Error("Should have thrown error");
        } catch (e) {
            assertEquals((e as Error).message, "invalid JWT: unable to parse or verify signature, token is malformed: token contains an invalid number of segments");
        }
    });
});
