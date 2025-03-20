import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertIsError } from "jsr:@std/assert";
import { postController } from "../../../../posts/controllers/crud.ts";
import { NewPost, NewPostOptions } from "@shared/mod.ts";
import { userCourseSeedSetup } from "../helper.ts";
import { fail } from "node:assert";
import {
  afterEachFunc,
  authUsers,
  beforeEachFunc,
  coursesToCreate,
  profiles,
} from "./shared.ts";

describe("Post Integration Tests: Delete Post", () => {
  beforeEach(beforeEachFunc);
  afterAll(afterEachFunc);
  it("should properly delete post from database", async () => {
    try {
      const { tempProfiles, tempCourses } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
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
      const { post_id } = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );

      await postController.deletePost(post_id, tempProfiles[0].id);

      const posts = await postController.getPosts(
        tempProfiles[0].id,
        courseId,
        false,
      );
      assertEquals(posts.length, 0);
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });
  it("should throw an error because there are no posts in the database", async () => {
    try {
      const { tempProfiles } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
      );
      await postController.deletePost(
        "00000000-0000-0000-0000-000000000000",
        tempProfiles[0].id,
      );
      fail("Should throw an error");
    } catch (e) {
      assertIsError(e);
      assertEquals(e.message, "Post does not exist");
    }
  });
  it("should not delete post because user is not the poster of a post", async () => {
    try {
      const { tempProfiles, tempCourses } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
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
      const { post_id } = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );

      await postController.deletePost(post_id, tempProfiles[1].id);
      fail("Should throw an error");
    } catch (e) {
      assertIsError(e);
      assertEquals(
        e.message,
        "Error: JSON object requested, multiple (or no) rows returned",
      );
    }
  });
});
