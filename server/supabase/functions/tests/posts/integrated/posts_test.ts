import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertExists, assertInstanceOf, assertNotEquals } from "jsr:@std/assert";
import { postController } from "../../../posts/controller.ts";
import { supa } from "../../../_shared/db.ts";
import {
  NewCourse,
  NewPost,
  NewPostOptions,
  ProfileWithoutId,
} from "@shared/mod.ts";
import { courseTestSeedSetup, userTestSeedSetup } from "../../../_dev/setup.ts";
import { assert } from "node:console";

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
  {
    department: "TEST 2",
    code: 102,
    section: "002",
    name: "Test Course 2",
    access: "public",
  }
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

describe("Posts Integration Tests", () => {
  beforeEach(async () => {
    const users = await supa.auth.admin.listUsers();
    for (const user of users.data.users) {
      await supa.auth.admin.deleteUser(user.id);
    }
    const checkUsers = await supa.auth.admin.listUsers();
    console.log("checkUsers", checkUsers);
  });

  afterAll(async () => {
    const users = await supa.auth.admin.listUsers();
    for (const user of users.data.users) {
      await supa.auth.admin.deleteUser(user.id);
    }
    await supa.from("courses").delete().not('id', 'is', null);
  });

  it("should get an empty list of posts when there are no posts", async () => {
    const courseId = "00000000-0000-0000-0000-000000000000";
    const posts = await postController.getPosts(courseId);
    assertEquals(posts.length, 0);
  });

  describe("Create Post", () => {
    it("should create a post", async () => {
      const tempProfiles = await userTestSeedSetup(authUsers, profiles);
      const tempCourses = await courseTestSeedSetup(
        coursesToCreate,
        tempProfiles[0].id,
      );
      const courseId = tempCourses[0].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };
      console.log("tempProfiles 0", tempProfiles[0].id);
      console.log("courseId", courseId);
      const post = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      assertExists(post);
      assertEquals(post.title, newPost.title);
      const posts = await postController.getPosts(courseId);
      assertEquals(posts.length, 1);
      assertEquals(posts[0].title, newPost.title);
      assertEquals(posts[0].number_id, 1);
    });

    it("should create two posts sequential number_id", async () => {
      const tempProfiles = await userTestSeedSetup(authUsers, profiles);
      const tempCourses = await courseTestSeedSetup(
        coursesToCreate,
        tempProfiles[0].id,
      );
      const courseId = tempCourses[0].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPost2: NewPost = {
        title: "Test Post 2",
        content: "Test Content",
        course_id: courseId,
      };
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };
      console.log("tempProfiles 0", tempProfiles[0].id);
      console.log("courseId", courseId);
      await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      await postController.createPost(
        tempProfiles[0].id,
        newPost2,
        newPostOptions,
      );
      const posts = await postController.getPosts(courseId);
      assertEquals(posts.length, 2);
      assertEquals(posts[0].number_id, 1);
      assertEquals(posts[1].number_id, 2);
    });

    it("should create two posts same number_id", async () => {
      const tempProfiles = await userTestSeedSetup(authUsers, profiles);
      const tempCourses = await courseTestSeedSetup(
        coursesToCreate,
        tempProfiles[0].id,
      );
      const courseId = tempCourses[0].id;
      const courseId2 = tempCourses[1].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPost2: NewPost = {
        title: "Test Post 2",
        content: "Test Content",
        course_id: courseId2,
      };
      console.log(newPost.course_id);
      console.log(newPost2.course_id);
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };
      await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      await postController.createPost(
        tempProfiles[0].id,
        newPost2,
        newPostOptions,
      );
      const posts = await postController.getPosts(courseId);
      const posts2 = await postController.getPosts(courseId2);
      assertEquals(posts[0].number_id, 1);
      assertEquals(posts2[0].number_id, 1);

    });
  });

  describe("Create Post", () => {
    it("should create a post", async () => {
      const tempProfiles = await userTestSeedSetup(authUsers, profiles);
      const tempCourses = await courseTestSeedSetup(
        coursesToCreate,
        tempProfiles[0].id,
      );
      const courseId = tempCourses[0].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };
      console.log("tempProfiles 0", tempProfiles[0].id);
      console.log("courseId", courseId);
      const post = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      assertExists(post);
      assertEquals(post.title, newPost.title);
      const posts = await postController.getPosts(courseId);
      assertEquals(posts.length, 1);
      assertEquals(posts[0].title, newPost.title);
      assertEquals(posts[0].number_id, 1);
    });

    it("should create two posts sequential number_id", async () => {
      const tempProfiles = await userTestSeedSetup(authUsers, profiles);
      const tempCourses = await courseTestSeedSetup(
        coursesToCreate,
        tempProfiles[0].id,
      );
      const courseId = tempCourses[0].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPost2: NewPost = {
        title: "Test Post 2",
        content: "Test Content",
        course_id: courseId,
      };
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };
      console.log("tempProfiles 0", tempProfiles[0].id);
      console.log("courseId", courseId);
      await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      await postController.createPost(
        tempProfiles[0].id,
        newPost2,
        newPostOptions,
      );
      const posts = await postController.getPosts(courseId);
      assertEquals(posts.length, 2);
      assertEquals(posts[0].number_id, 1);
      assertEquals(posts[1].number_id, 2);
    });
  });
});
