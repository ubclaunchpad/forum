import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertExists, assertIsError } from "jsr:@std/assert";
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

describe("Posts Integration Tests: Get Post(s)", () => {
  beforeEach(beforeEachFunc);
  afterAll(afterEachFunc);

  it("should get an empty list of posts when there are no posts", async () => {
    try {
      const { tempProfiles, tempCourses } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
      );
      const courseId = tempCourses[0].id;
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

  it("should get posts from a specific course with no comments or replies", async () => {
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

    const post = await postController.createPost(
      tempProfiles[0].id,
      newPost,
      newPostOptions,
    );
    assertExists(post);
    assertEquals(post.title, newPost.title);
    const posts = await postController.getPosts(
      tempProfiles[0].id,
      courseId,
      false,
    );
    assertEquals(posts.length, 1);
    assertEquals(posts[0].title, newPost.title);
    assertEquals(posts[0].number_id, 1);
  });

  it("should not get posts because the user not in course", async () => {
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

      await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );

      await postController.getPosts(tempProfiles[1].id, courseId, false);
      fail("Should throw an error");
    } catch (e) {
      console.log(e);
      assertIsError(e);
      assertEquals((e as Error).message, "User is not registered in course");
    }
  });

  // Currently, post comments and replies do not exist
  it.ignore("should get posts from a specific course with comments and replies", async () => {
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

    const post = await postController.createPost(
      tempProfiles[0].id,
      newPost,
      newPostOptions,
    );
    assertExists(post);
    assertEquals(post.title, newPost.title);
    const posts = await postController.getPosts(
      courseId,
      tempProfiles[0].id,
      false,
    );
    assertEquals(posts.length, 1);
    assertEquals(posts[0].title, newPost.title);
    assertEquals(posts[0].number_id, 1);
  });
});
