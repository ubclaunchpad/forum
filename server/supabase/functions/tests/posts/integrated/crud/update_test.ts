import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertExists, assertIsError } from "jsr:@std/assert";
import { postController } from "../../../../posts/controllers/crud.ts";
import { NewPost, NewPostOptions, PostEditInfo } from "@shared/mod.ts";
import { userCourseSeedSetup } from "../helper.ts";
import { fail } from "node:assert";
import {
  afterEachFunc,
  authUsers,
  beforeEachFunc,
  coursesToCreate,
  profiles,
} from "./shared.ts";
import { addUserToCourse } from "../../../../courses/controller/add_course_member_activity.ts";

const testUUID = "00000000-0000-0000-0000-000000000000";

describe("Post Integration Tests: Update Post", () => {
  beforeEach(beforeEachFunc);
  afterAll(afterEachFunc);
  it("should update the post to be edited by poster, updating posts and post_author tables", async () => {
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
      const post = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );

      const newPostEditInfo: PostEditInfo = {
        title: "This is an updated title",
        content: "The content in this post is updated",
        updated_at: new Date(),
        userVisibility: "private",
        userPseudonym: "Small_Red_Cat",
      };

      await postController.updatePost(
        post.post_id,
        tempProfiles[0].id,
        newPostEditInfo,
      );
      const updatedPost = await postController.getPost(
        tempProfiles[0].id,
        post.post_id,
        courseId,
        false,
      );

      assertExists(updatedPost);
      assertEquals(updatedPost.id, post.post_id);
      assertEquals(updatedPost.title, newPostEditInfo.title);
      assertEquals(updatedPost.content, newPostEditInfo.content);

      const authors = await postController.getPostAuthorsByPostId(post.post_id);

      assertEquals(authors.length, 1);
      assertEquals(authors[0].pseudonym, "Small_Red_Cat");
      assertEquals(authors[0].visibility, "private");
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });
  it("should not update the post because the post does not exist", async () => {
    try {
      const { tempProfiles } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
      );
      const newPostEditInfo: PostEditInfo = {
        title: "This is a new title",
        content: "The content in this post is new",
        updated_at: new Date(),
        userVisibility: "everyone",
        userPseudonym: "Small_Red_Cat",
      };
      await postController.updatePost(
        testUUID,
        tempProfiles[0].id,
        newPostEditInfo,
      );
      fail("Should have thrown an error");
    } catch (e) {
      assertIsError(e);
      assertEquals((e as Error).message, "Post does not exist");
    }
  });
  it("should not update the post because the user is not in the course", async () => {
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
      const post = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );

      const newPostEditInfo: PostEditInfo = {
        title: "This is a new title",
        content: "The content in this post is new",
        updated_at: new Date(),
        userVisibility: "everyone",
        userPseudonym: "Small_Red_Cat",
      };

      await postController.updatePost(
        post.post_id,
        tempProfiles[1].id,
        newPostEditInfo,
      );
      fail("Should throw an error");
    } catch (e) {
      assertIsError(e);
      assertEquals((e as Error).message, "User is not registered in course");
    }
  });
  // BLOCKED: Can't add user to course
  it.ignore("should update the post to be edited by another user in the course, updating posts and post_author tables", async () => {
    try {
      const { tempProfiles, tempCourses } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
      );

      const courseId = tempCourses[0].id;
      await addUserToCourse(courseId, tempProfiles[1].id, "student");
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

      const newPostEditInfo: PostEditInfo = {
        title: "This is an updated title",
        content: "The content in this post is updated",
        updated_at: new Date(),
        userVisibility: "public",
        userPseudonym: "Small_Red_Cat",
      };

      await postController.updatePost(
        post.post_id,
        tempProfiles[1].id,
        newPostEditInfo,
      );
      const updatedPost = await postController.getPost(
        tempProfiles[0].id,
        post.post_id,
        courseId,
        false,
      );

      assertExists(updatedPost);
      assertEquals(updatedPost.id, post.post_id);
      assertEquals(updatedPost.title, newPostEditInfo.title);
      assertEquals(updatedPost.content, newPostEditInfo.content);

      const authors = await postController.getPostAuthorsByPostId(post.post_id);
      // Verify second author
      assertEquals(authors.length, 2);
      assertEquals(authors[1].pseudonym, "Small_Red_Cat");
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });
});
