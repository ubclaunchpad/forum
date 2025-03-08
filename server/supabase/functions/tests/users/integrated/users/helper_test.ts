// import { afterAll, beforeEach, describe, it, afterEach } from "jsr:@std/testing/bdd";
// import { assertEquals } from "jsr:@std/assert";
// import { userController } from "../../../../_shared/userController.ts";
// import { supa } from "../../../../_shared/db.ts";
// import { NotFoundError } from "../../../../_shared/errors.ts";
// import { stub } from "jsr:@std/testing/mock";
// import { PostgrestBuilder, PostgrestQueryBuilder } from "npm:@supabase/postgrest-js@1.19.2";

// // Test data
// const testUser = {
//     first_name: "Test",
//     last_name: "User",
//     email: "test@example.com",
//     password: "securePassword123",
//     timezone: "UTC",
//     pronouns: "they/them",
// };

// const mockQueryBuilder = {
//     insert: () => ({
//         select: () => ({
//             single: () => Promise.resolve({
//                 data: null,
//                 error: new Error("Database query failed"),
//                 count: null,
//                 status: 500,
//                 statusText: "ERROR"
//             })
//         })
//     })
// } as unknown as PostgrestQueryBuilder<any, any, string, unknown>;

// const fromStub = stub(
//     supa,
//     "from",
//     () => mockQueryBuilder
// );

// describe("User Helper Tests", () => {
//     it("should fail with database error", async () => {
//         const { data, error } = await supa.from("profiles")
//             .insert({})
//             .select()
//             .single();
        
//         assertEquals(data, null);
//         assertEquals((error as Error).message, "Database query failed");
//     });
// });