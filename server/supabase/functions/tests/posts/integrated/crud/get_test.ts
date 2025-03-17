import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertExists, assertFalse, assertInstanceOf, assertIsError } from "jsr:@std/assert";
import { postController } from "../../../../posts/controllers/crud.ts";
import { supa } from "../../../../_shared/db.ts";
import {
  NewCourse,
  NewPost,
  NewPostOptions,
  ProfileWithoutId,
} from "@shared/mod.ts";
import { courseTestSeedSetup, userTestSeedSetup } from "../../../../_dev/setup.ts";
import { userCourseSeedSetup } from "../helper.ts";
import { fail } from "node:assert";
import { afterEachFunc, authUsers, beforeEachFunc, coursesToCreate, profiles } from "./shared.ts";

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
  beforeEach(beforeEachFunc);
  afterAll(afterEachFunc);

  it("should get an empty list of posts when there are no posts", async () => {
    const courseId = "00000000-0000-0000-0000-000000000000";
    const posts = await postController.getPosts(courseId);
    assertEquals(posts.length, 0);
  });

  describe("Get Posts", () => {
    it("should get posts from a specific course with no comments or replies", async () => {
      const {tempProfiles, tempCourses} = await userCourseSeedSetup(authUsers, profiles, coursesToCreate);
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
    }
    );

    it("should not get posts user not in course", async () => {
        const {tempProfiles, tempCourses} = await userCourseSeedSetup(authUsers, profiles, coursesToCreate);
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
      }
      );
    })
});