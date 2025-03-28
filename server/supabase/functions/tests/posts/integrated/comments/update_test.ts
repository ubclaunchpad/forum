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

describe("Posts Integration Tests: Update comments", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);

  it("should update a comment", async () => {
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
      const { id: commentId } = await postCommentController.createPostComment(
        postId,
        userId,
        "Test comment",
      );

      await postCommentController.updatePostComment(
        commentId,
        userId,
        {
          content: "Updated comment",
          userVisibility: "everyone",
          userPseudonym: "Smart_Red_Turtle",
        },
      );

      const updatedComment = await postCommentController.getPostComment(
        commentId,
        userId,
      );

      assertEquals(updatedComment.content, "Updated comment");
      // TODO: Check post_authors table
    } catch (error) {
      fail("Should not throw error: " + (error as Error).message);
    }
  });

  it("should not update the comment since the comment does not exist", async () => {
    try {
      const { tempProfiles, tempCourses, tempPosts } = await postSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
        postsToCreate,
        postOptions,
      );
      const userId = tempProfiles[1].id;
      await addUserToCourse(tempCourses[0].id, userId);

      await postCommentController.updatePostComment(
        "00000000-0000-0000-0000-000000000000",
        userId,
        {
          content: "Updated comment",
          userVisibility: "everyone",
          userPseudonym: "Smart_Red_Turtle",
        },
      );

      fail("Should throw error");
    } catch (error) {
      assertIsError(error);
      assertEquals(error.message, "Comment does not exist");
    }
  });

  it("should not update a comment since user is not apart of course with comment", async () => {
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
      const { id: commentId } = await postCommentController.createPostComment(
        postId,
        userId,
        "Test comment",
      );

      await postCommentController.updatePostComment(
        commentId,
        tempProfiles[2].id,
        {
          content: "Updated comment",
          userVisibility: "everyone",
          userPseudonym: "Smart_Red_Turtle",
        },
      );

      fail("Should throw error");
    } catch (error) {
      assertIsError(error);
      assertEquals(error.message, "User is not in the course with the comment");
    }
  });
});
