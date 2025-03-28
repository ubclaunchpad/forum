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

describe("Posts Integration Tests: Update comments", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);

  it("should update a comment", async () => {
  });

  it("should not update the comment since the comment does not exist", async () => {
  });

  it("should not update a comment since user is not apart of course with comment", async () => {
  });
});
