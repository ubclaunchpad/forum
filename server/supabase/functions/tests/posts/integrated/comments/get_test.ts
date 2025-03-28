import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import {
  assertEquals,
  assertExists,
  assertFalse,
  assertIsError,
} from "jsr:@std/assert";
import { postCommentController } from "../../../../posts/controllers/comments.ts";
import { NewPost, NewPostOptions } from "@shared/mod.ts";
import {
  courseTestSeedSetup,
  userTestSeedSetup,
} from "../../../../_dev/setup.ts";
import {
  clearUsers,
  clearUsersAndCourses,
  postSeedSetup,
  userCourseSeedSetup,
} from "../helper.ts";
import { fail } from "node:assert";
import {
  authUsers,
  coursesToCreate,
  postOptions,
  postsToCreate,
  profiles,
} from "../shared.ts";

describe("Posts Integration Tests: Get comments", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);

  it("should get a comment", async () => {
    try {
      const { tempProfiles, tempPosts } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const postId = tempPosts[0].post_id;
      const userId = tempProfiles[1].id;
      const { id: commentId } = await postCommentController.createPostComment(
        postId,
        userId,
        "Test comment",
      );
      const comment = await postCommentController.getPostComment(
        commentId,
        userId,
      );

      assertExists(comment);
      assertEquals(comment.content, "Test comment");
    } catch (error) {
      fail("Should not throw error: " + (error as Error).message);
    }
  });

  it.ignore("should get not get a comment since user is not apart of course with comment", async () => {
  });

  it("should get all comments for a post", async () => {
    try {
      const { tempProfiles, tempPosts } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const postId = tempPosts[0].post_id;
      const userId1 = tempProfiles[1].id;
      const userId2 = tempProfiles[2].id;
      const { id: commentId1 } = await postCommentController.createPostComment(
        postId,
        userId1,
        "Test comment 1",
      );

      const { id: commentId2 } = await postCommentController.createPostComment(
        postId,
        userId2,
        "Test comment 2",
      );

      const comments = await postCommentController.getPostComments(
        postId,
        tempProfiles[0].id,
      );

      console.log("Retrieved comments: ", comments);

      assertEquals(comments.length, 2);
      assertEquals(comments[0].content, "Test comment 1");
      assertEquals(comments[1].content, "Test comment 2");
      assertEquals(comments[0].number_id, 1);
      assertEquals(comments[1].number_id, 2);
    } catch (error) {
      fail("Should not throw error: " + (error as Error).message);
    }
  });

  it.ignore("should not get all comments for a post since user is not apart of course with post", async () => {
  });
});
