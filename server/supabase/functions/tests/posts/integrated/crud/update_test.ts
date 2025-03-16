import { afterAll, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import { assertEquals, assertExists, assertFalse, assertInstanceOf, assertIsError } from "jsr:@std/assert";
import { postController } from "../../../../posts/controllers/crud.ts";
import {
  NewPost,
  NewPostOptions,
  PostEditInfo,
} from "@shared/mod.ts";
import { userCourseSeedSetup } from "../helper.ts";
import { fail } from "node:assert";
import {authUsers, profiles, coursesToCreate} from "./shared.ts"

const testUUID = "00000000-0000-0000-0000-000000000000"

describe('Post Integration Tests: Update Post', () => { 
  it.ignore("should update the post, updating posts and post_author tables", async () => {
    try {
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
        const post = await postController.createPost(
            tempProfiles[0].id,
            newPost,
            newPostOptions,
        );

        const newPostEditInfo: PostEditInfo = {
            title: "This is a new title",
            content: "The content in this post is new",
            updated_at: new Date()
        }
        
        await postController.updatePost(post.post_id,tempProfiles[0].id, newPostEditInfo);
    } catch(_e) {
        fail("Should not have thrown an error");
    }

  })
  it.ignore("should not update the post because the post does not exist", async () => {
    try {
        const {tempProfiles} = await userCourseSeedSetup(authUsers, profiles, coursesToCreate);
        const newPostEditInfo: PostEditInfo = {
            title: "This is a new title",
            content: "The content in this post is new",
            updated_at: new Date()
        }
        await postController.updatePost(testUUID, tempProfiles[0].id, newPostEditInfo);
        fail("Should have thrown an error");
    } catch(e) {
        assertIsError(e);
        assertEquals("Post does not exist", (e as Error).message);
    }

  })
  it.ignore("should not update the post because the user is not in the course", async () => {

  })
});
