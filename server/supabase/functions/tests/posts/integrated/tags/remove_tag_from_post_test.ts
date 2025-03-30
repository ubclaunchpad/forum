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
import { postController } from "../../../../posts/controllers/crud.ts";
import { addTagToPost } from "../../../../posts/controllers/tags/add_tag_to_post_activity.ts";
import { removeTagFromPost } from "../../../../posts/controllers/tags/remove_tag_from_post_activity.ts";

describe("Get Post Permissions tests", () => {
    let user1Id: string;
    let courseId: string;
    let tagId1: string;
    let tagId2: string;
    let postId: string;

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

        await addTagToPost(postId, tagId1);
        await addTagToPost(postId, tagId2);
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

    it("Should remove tag from post", async () => {
        await removeTagFromPost(postId, tagId1);
        const { data: tags } = await supa.from("post_tags")
            .select("*")
            .eq("post_id", postId);
        assertExists(tags);
        assertEquals(tags.length, 1);
        assertEquals(tags[0].tag_id, tagId2);
    });	
});