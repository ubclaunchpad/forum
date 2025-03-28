import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertIsError } from "jsr:@std/assert";
import { postCommentController } from "../../../../posts/controllers/comments.ts";
import { clearUsers, clearUsersAndCourses, postSeedSetup } from "../helper.ts";
import { fail } from "node:assert";
import {
  authUsers,
  coursesToCreate,
  postOptions,
  postsToCreate,
  profiles,
} from "../shared.ts";
import { addUserToCourse } from "../../../../courses/controller/add_course_member_activity.ts";

describe("Posts Integration Tests: Delete comments", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);

  it("should delete given comment", async () => {
    try {
      const { tempProfiles, tempCourses, tempPosts } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const postId = tempPosts[0].post_id;
      const userId = tempProfiles[1].id;
      await addUserToCourse(tempCourses[0].id, userId);
      const comment = await postCommentController.createPostComment(
        postId,
        userId,
        "Test comment",
      );

      await postCommentController.deletePostComment(comment.id, userId);

      const comments = await postCommentController.getPostComments(
        postId,
        userId,
      );
      assertEquals(comments.length, 0);
    } catch (error) {
      fail("Should not throw error: " + (error as Error).message);
    }
  });

  it("should throw an error because the comment does not exist", async () => {
    try {
      const { tempProfiles } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const userId = tempProfiles[1].id;

      await postCommentController.deletePostComment(
        "00000000-0000-0000-0000-000000000000",
        userId,
      );

      fail("Should throw error");
    } catch (error) {
      assertIsError(error);
      assertEquals(error.message, "Comment does not exist");
    }
  });

  it("should not delete comment because user is not creator of comment", async () => {
    try {
      const { tempProfiles, tempCourses, tempPosts } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const postId = tempPosts[0].post_id;
      const userId = tempProfiles[1].id;

      await addUserToCourse(tempCourses[0].id, userId);
      const comment = await postCommentController.createPostComment(
        postId,
        userId,
        "Test comment",
      );

      await postCommentController.deletePostComment(
        comment.id,
        tempProfiles[2].id,
      );

      fail("Should throw error");
    } catch (error) {
      assertIsError(error);
      assertEquals(
        error.message,
        "Comment could not be deleted: JSON object requested, multiple (or no) rows returned",
      );
    }
  });
});
