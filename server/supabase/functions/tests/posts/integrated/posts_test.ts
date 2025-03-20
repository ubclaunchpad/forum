import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertExists, assertInstanceOf } from "jsr:@std/assert";
import { supa } from "../../../_shared/db.ts";
import {
  NewCourse,
  NewPost,
  NewPostOptions,
  ProfileWithoutId,
} from "@shared/mod.ts";
import { courseTestSeedSetup, userTestSeedSetup } from "../../../_dev/setup.ts";
import { postController } from "../../../posts/controllers/crud.ts";

// Test data
const authUsers = [
  {
    email: "admin@test.com",
    password: "Test123!!",
  },
  {
    email: "user@test.com",
    password: "Test123!!",
  },
  {
    email: "user2@test.com",
    password: "Test123!!",
  },
];

const profiles: ProfileWithoutId[] = [
  {
    first_name: "Admin",
    last_name: "Test",
    email: "admin@test.com",
    username: "admin",
    display_name: "Admin Test",
    pronouns: "he/him",
    avatar_url: "https://example.com/avatar.png",
    bio: "I am an admin",
    social_links: [],
  },
  {
    first_name: "User",
    last_name: "Test",
    email: "user@test.com",
    username: "user",
    display_name: "User Test",
    pronouns: "he/him",
    avatar_url: "https://example.com/avatar.png",
    bio: "I am a user",
    social_links: [],
  },

  {
    first_name: "User",
    last_name: "Test",
    email: "user2@test.com",
    username: "user2",
    display_name: "User Test 2",
  },
];

const coursesToCreate: NewCourse[] = [
  {
    department: "TEST",
    code: 101,
    section: "001",
    name: "Test Course",
    access: "public",
  },
];

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

// describe("Posts Integration Tests", () => {
//   beforeEach(async () => {
//     const users = await supa.auth.admin.listUsers();
//     for (const user of users.data.users) {
//       await supa.auth.admin.deleteUser(user.id);
//     }
//     // const checkUsers = await supa.auth.admin.listUsers();
//     // console.log("checkUsers", checkUsers);
//   });

//   afterAll(async () => {
//     const users = await supa.auth.admin.listUsers();
//     for (const user of users.data.users) {
//       await supa.auth.admin.deleteUser(user.id);
//     }
//     await supa.from("courses").delete().not('id', 'is', null);
//   });

//   it("should get an empty list of posts when there are no posts", async () => {
//     const courseId = "00000000-0000-0000-0000-000000000000";
//     const posts = await postController.getPosts(courseId);
//     assertEquals(posts.length, 0);
//   });

//   describe("Create Post", () => {
//     it("should create a post", async () => {
//       const tempProfiles = await userTestSeedSetup(authUsers, profiles);
//       const tempCourses = await courseTestSeedSetup(
//         coursesToCreate,
//         tempProfiles[0].id,
//       );
//       const courseId = tempCourses[0].id;
//       const newPost: NewPost = {
//         title: "Test Post",
//         content: "Test Content",
//         course_id: courseId,
//       };
//       const newPostOptions: NewPostOptions = {
//         visibility: "public",
//         usePseudonym: true,
//       };
//       console.log("tempProfiles 0", tempProfiles[0].id);
//       console.log("courseId", courseId);
//       const post = await postController.createPost(
//         tempProfiles[0].id,
//         newPost,
//         newPostOptions,
//       );
//       assertExists(post);
//       assertEquals(post.title, newPost.title);
//       const posts = await postController.getPosts(courseId);
//       assertEquals(posts.length, 1);
//       assertEquals(posts[0].title, newPost.title);
//     });
//   });
// });
