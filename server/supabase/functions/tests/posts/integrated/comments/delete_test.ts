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

describe("Posts Integration Tests: Delete comments", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);

  it("should delete given comment", async () => {
  });

  it("should throw an error because the comment does not exist", async () => {
  });

  it("should not delete comment because user is not creator of comment", async () => {
  });
});
