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


// Test data
const authUsers = [
  {
    email: "admin@test.com",
    password: "Test123!!",
  },
  {
    email: "user@test.com",
    password: "Test123!!",
  },
  {
    email: "user2@test.com",
    password: "Test123!!",
  },
];

const profiles: ProfileWithoutId[] = [
  {
    first_name: "Admin",
    last_name: "Test",
    email: "admin@test.com",
    username: "admin",
    display_name: "Admin Test",
    pronouns: "he/him",
    avatar_url: "https://example.com/avatar.png",
    bio: "I am an admin",
    social_links: [],
  },
  {
    first_name: "User",
    last_name: "Test",
    email: "user@test.com",
    username: "user",
    display_name: "User Test",
    pronouns: "he/him",
    avatar_url: "https://example.com/avatar.png",
    bio: "I am a user",
    social_links: [],
  },

  {
    first_name: "User",
    last_name: "Test",
    email: "user2@test.com",
    username: "user2",
    display_name: "User Test 2",
  },
];

const coursesToCreate: NewCourse[] = [
  {
    department: "TEST",
    code: 101,
    section: "001",
    name: "Test Course",
    access: "public",
  },
  {
    department: "TEST 2",
    code: 102,
    section: "002",
    name: "Test Course 2",
    access: "public",
  }
];


describe('Delete Post', () => { 
  it("should properly delete post from database", async () => {
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
    const {post_id} = await postController.createPost(
      tempProfiles[0].id,
      newPost,
      newPostOptions,
    );

    await postController.deletePost(post_id);

    const posts = await postController.getPosts(courseId);
    assertEquals(posts.length, 0);
  })
});
