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
import { supa } from "../../../_shared/db.ts";
import { userController } from '../../../users/controller.ts';
import { 
    testUser, 
    testUser1ProfileWithoutId,
    coursePublic,
    newTagData
} from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { createTag } from "../../../courses/controller/create_tag_activity.ts";
import { getTag, getTagNested } from "../../../_shared/utils/tag_helper.ts";
import { NestedTag, NewTag, Tag } from "@shared/schema/tag.ts";

describe("Get Tag tests", () => {
    let user1Id: string;
    let courseId: string;
    let tagId: string;
    let tagId2: string;
    let tagId3: string;
    let newTagData2: NewTag;
    let newTagData3: NewTag;

    beforeAll(async () => {
        await supa.from("tags").delete().not('id', 'is', 0);
        const {data,error} = await supa.from("courses").delete().not('id', 'is', null);
        console.log(data);
        console.log(error);
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
        tagId = tag.id;
        newTagData2 = {...newTagData, name: "middle tag", parent_id: tagId};
        const tag2 = await createTag(newTagData2, courseId);
        tagId2 = tag2.id;
        newTagData3 = {...newTagData, name: "leaf tag", parent_id: tagId2};
        const tag3 = await createTag(newTagData3, courseId);
        tagId3 = tag3.id;
    });

    afterEach(async () => {
        await supa.from("tags").delete().not('id', 'is', null);
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

    it("Should get tag", async() => {
        const tagData = await getTag(tagId3);
        hasSameFields(tagData, newTagData3, courseId, newTagData3.parent_id!);
    });

    it("Should get nested tag", async() => {
        const tagData = await getTagNested(tagId3);
        assertExists(tagData);
        hasSameFields(tagData, newTagData3, courseId, newTagData3.parent_id!);
        assertExists(tagData.parent);
        hasSameFields(tagData.parent, newTagData2, courseId, newTagData2.parent_id!);
        assertExists(tagData.parent.parent);
        hasSameFields(tagData.parent.parent, newTagData, courseId, null);
    });
});

function hasSameFields(tag: Tag | NestedTag, referenceTag: NewTag, courseId: string, parentId: string | null) {
    assertEquals(tag.course_id, courseId);
    assertEquals(tag.name, referenceTag.name);
    assertEquals(tag.parent_id, parentId);
    assertEquals(tag.permissions, referenceTag.permissions);
    assertEquals(tag.can_use_tag, referenceTag.can_use_tag);
}