import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "jsr:@std/testing/bdd";
import {
  assertEquals,
  assertExists,
  assertInstanceOf,
} from "jsr:@std/assert";
import { supa } from "../../../../_shared/db.ts";
import { userController } from '../../../../users/controller.ts';
import { 
    testUser, 
    testUser1ProfileWithoutId,
    coursePublic,
    newTagData,
    newPost,
    newPostOptions
} from '../../../shared/test_data.ts';
import { createCourse } from "../../../../courses/controller/create_course_activity.ts";
import { createTag } from "../../../../courses/controller/create_tag_activity.ts";
import { NewTag } from "@shared/schema/tag.ts";
import { postController } from "../../../../posts/controllers/crud.ts";
import { addTagToPost } from "../../../../posts/controllers/tags/add_tag_to_post_activity.ts";
import { NotFoundError } from "../../../../_shared/errors.ts";

describe("Get Post Permissions tests", () => {
    let user1Id: string;
    let courseId: string;
    let tagId1: string;
    let tagId2: string;
    let postId: string;
    const invalidId = "00000000-0000-0000-0000-000000000000";

    beforeAll(async () => {
        await supa.from("tags").delete().not('id', 'is', 0);
        await supa.from("posts").delete().not('id', 'is', 0);
        await supa.from("courses").delete().not('id', 'is', null);
        await supa.from("course_roles").delete().not('id', 'is', null);
        await supa.from("course_members").delete().not('id', 'is', null);
        const users = await supa.auth.admin.listUsers();
        for (const user of users.data.users) {
            await supa.auth.admin.deleteUser(user.id);
        }
        user1Id = (await userController.createUserViaEmailPassword(testUser)).id;
        await userController.approveUserAccount(user1Id);
        await userController.activateAccountAndProfile(user1Id, testUser1ProfileWithoutId);
    });

    beforeEach(async () => {
        const course = await createCourse(coursePublic, user1Id);
        courseId = course.id;
        const tag = await createTag(newTagData, courseId);
        tagId1 = tag.id;
        const tagData2 = {...newTagData, name: "another tag"};
        const tag2 = await createTag(tagData2, courseId);
        tagId2 = tag2.id;

        const newPostData = { ...newPost, course_id: courseId};
        const post = await postController.createPost(user1Id, newPostData, newPostOptions);
        postId = post.id;
    });

    afterEach(async () => {
        await supa.from("tags").delete().not('id', 'is', null);
        await supa.from("posts").delete().not('id', 'is', null);
        await supa.from("courses").delete().not('id', 'is', null);
        await supa.from("course_roles").delete().not('course_id', 'is', null);
        await supa.from("course_members").delete().not('course_id', 'is', null);
    });

    afterAll(async () => {
        const users = await supa.auth.admin.listUsers();
        for (const user of users.data.users) {
            await supa.auth.admin.deleteUser(user.id);
        }
    });

    it("Should fail if post does not exist", async () => {
        try {
            await addTagToPost(invalidId, tagId1);
            throw Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
        }
    });	

    it("Should fail if tag does not exist", async () => {
        try {
            await addTagToPost(postId, invalidId);
            throw Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
        }
    });

    it("Should fail if post and tag are not in the same course", async () => {
        const course2 = await createCourse({...coursePublic, code: 200}, user1Id);
        const tagData3 = {...newTagData, name: "another tag"};
        const tag3 = await createTag(tagData3, course2.id);
        const tagId3 = tag3.id;
        try {
            await addTagToPost(postId, tagId3);
            throw Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, Error);
            assertEquals(error.message, `Post ${postId} cannot be tagged with tag ${tagId3} as they are from different courses`);
        }
    });

    it("Should properly add tags to post", async () => {
        await addTagToPost(postId, tagId1);
        const { data: postTags } = await supa.from("post_tags").select("*").eq("post_id", postId);
        assertExists(postTags);
        assertEquals(postTags.length, 1);
        assertEquals(postTags[0].tag_id, tagId1);
        
        await addTagToPost(postId, tagId2);
        const { data: postTags2 } = await supa.from("post_tags").select("*").eq("post_id", postId);
        assertExists(postTags2);
        assertEquals(postTags2.length, 2);
        assertExists(postTags2.find((tag) => tag.tag_id === tagId1));
        assertExists(postTags2.find((tag) => tag.tag_id === tagId2));
    });
});