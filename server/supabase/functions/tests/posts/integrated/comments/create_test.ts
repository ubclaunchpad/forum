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

describe("Posts Integration Tests: Create comments", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);

  it("should create a comment", async () => {
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
      const comment = await postCommentController.createPostComment(
        postId,
        userId,
        "Test comment",
      );
      assertExists(comment);
      assertEquals(comment.content, "Test comment");
    } catch (error) {
      fail("Should not throw error: " + (error as Error).message);
    }
  });

  it.ignore("should not create a comment because user is not apart of course with post", async () => {
  });

  it("should not create a comment because post does not exist", async () => {
    try {
      const { tempProfiles } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const invalidPostId = "00000000-0000-0000-0000-000000000000";
      const userId = tempProfiles[1].id;
      await postCommentController.createPostComment(
        invalidPostId,
        userId,
        "Test comment",
      );
      fail("Should throw error");
    } catch (error) {
      assertIsError(error);
      assertEquals(error.message, "Post does not exist");
    }
  });
});
