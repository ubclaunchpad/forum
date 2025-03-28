import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import {
  assertEquals,
  assertExists,
  assertFalse,
  assertIsError,
} from "jsr:@std/assert";
import { postController } from "../../../../posts/controllers/crud.ts";
import { NewPost, NewPostOptions } from "@shared/mod.ts";
import {
  courseTestSeedSetup,
  userTestSeedSetup,
} from "../../../../_dev/setup.ts";
import {
  clearUsers,
  clearUsersAndCourses,
  userCourseSeedSetup,
} from "../helper.ts";
import { fail } from "node:assert";
import { authUsers, coursesToCreate, profiles } from "../shared.ts";

describe("Posts Integration Tests: Create Post", () => {
  beforeEach(clearUsers);
  afterAll(clearUsersAndCourses);
  it("should create a post", async () => {
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
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });

  it("should not create a post because the user is not in the course", async () => {
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
        tempProfiles[1].id,
        newPost,
        newPostOptions,
      );
      fail("Should throw an error");
    } catch (e) {
      assertIsError(e);
      assertEquals((e as Error).message, "User is not registered in course");
    }
  });

  it("should create two posts sequential number_id", async () => {
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
      const newPost2: NewPost = {
        title: "Test Post 2",
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
      await postController.createPost(
        tempProfiles[0].id,
        newPost2,
        newPostOptions,
      );
      const posts = await postController.getPosts(
        tempProfiles[0].id,
        courseId,
        false,
      );
      assertEquals(posts.length, 2);
      assertEquals(posts[0].number_id, 1);
      assertEquals(posts[1].number_id, 2);
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });

  it("should create two posts same number_id because they are in different courses", async () => {
    try {
      const { tempProfiles, tempCourses } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
      );
      const courseId = tempCourses[0].id;
      const courseId2 = tempCourses[1].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPost2: NewPost = {
        title: "Test Post 2",
        content: "Test Content",
        course_id: courseId2,
      };
      console.log(newPost.course_id);
      console.log(newPost2.course_id);
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };
      await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      await postController.createPost(
        tempProfiles[0].id,
        newPost2,
        newPostOptions,
      );
      const posts = await postController.getPosts(
        tempProfiles[0].id,
        courseId,
        false,
      );
      const posts2 = await postController.getPosts(
        tempProfiles[0].id,
        courseId2,
        false,
      );
      assertEquals(posts[0].number_id, 1);
      assertEquals(posts2[0].number_id, 1);
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });

  it("should create two posts, delete one, then create one again, with the two resulting posts having number_id 1 and 2", async () => {
    try {
      const tempProfiles = await userTestSeedSetup(authUsers, profiles);
      const tempCourses = await courseTestSeedSetup(
        coursesToCreate,
        tempProfiles[0].id,
      );
      const courseId = tempCourses[0].id;
      const newPost: NewPost = {
        title: "Test Post",
        content: "Test Content",
        course_id: courseId,
      };
      const newPost2: NewPost = {
        title: "Test Post 2",
        content: "Test Content",
        course_id: courseId,
      };

      const newPost3: NewPost = {
        title: "This post was added after the second was deleted",
        content: "Test Content",
        course_id: courseId,
      };
      const newPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };

      const remainingPost = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );

      const toDeletePost = await postController.createPost(
        tempProfiles[0].id,
        newPost2,
        newPostOptions,
      );

      await postController.deletePost(toDeletePost.post_id, tempProfiles[0].id);

      const addedPost = await postController.createPost(
        tempProfiles[0].id,
        newPost3,
        newPostOptions,
      );

      assertExists(addedPost);
      assertExists(remainingPost);

      const posts = await postController.getPosts(
        tempProfiles[0].id,
        courseId,
        false,
      );

      assertEquals(posts.length, 2);
      assertEquals(posts[0].number_id, 1);
      assertEquals(posts[1].number_id, 2);
      assertEquals(
        posts[1].title,
        "This post was added after the second was deleted",
      );
    } catch (e) {
      fail("Should not have thrown an error: " + (e as Error).message);
    }
  });

  it("should have a post that does not have a pseudonym since the user has set the option off", async () => {
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
        usePseudonym: false,
      };
      console.log("tempProfiles 0", tempProfiles[0].id);
      console.log("courseId", courseId);
      const post = await postController.createPost(
        tempProfiles[0].id,
        newPost,
        newPostOptions,
      );
      assertExists(post);
      assertFalse(post.pseudonym);
    } catch (_e) {
      fail("Should not have thrown an error");
    }
  });
  it("should have 2 posts, each with a different visibility setting of public and private in that order", async () => {
    try {
      const { tempProfiles, tempCourses } = await userCourseSeedSetup(
        authUsers,
        profiles,
        coursesToCreate,
      );
      const courseId = tempCourses[0].id;
      const publicPost: NewPost = {
        title: "Public Post",
        content: "This should be a public post",
        course_id: courseId,
      };

      const privatePost: NewPost = {
        title: "Private Post",
        content: "This should be a private post",
        course_id: courseId,
      };

      const publicPostOptions: NewPostOptions = {
        visibility: "public",
        usePseudonym: true,
      };

      const privatePostOptions: NewPostOptions = {
        visibility: "private",
        usePseudonym: true,
      };

      console.log("tempProfiles 0", tempProfiles[0].id);
      console.log("courseId", courseId);
      const post1 = await postController.createPost(
        tempProfiles[0].id,
        publicPost,
        publicPostOptions,
      );

      const post2 = await postController.createPost(
        tempProfiles[0].id,
        privatePost,
        privatePostOptions,
      );

      assertExists(post1);
      assertExists(post2);

      const postAuthor1 = await postController.getPostAuthorsByPostId(
        post1.post_id,
      );
      const postAuthor2 = await postController.getPostAuthorsByPostId(
        post2.post_id,
      );

      assertExists(postAuthor1);
      assertExists(postAuthor2);

      assertEquals(postAuthor1.length, 1);
      assertEquals(postAuthor1.length, 1);

      assertEquals(postAuthor1[0].visibility, "public");
      assertEquals(postAuthor2[0].visibility, "private");
    } catch (e) {
      fail("Should not have thrown an error" + (e as Error).message);
    }
  });
});
