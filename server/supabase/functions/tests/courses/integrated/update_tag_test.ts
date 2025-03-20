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
import { supa } from "../../../_shared/db.ts";
import { userController } from '../../../users/controller.ts';
import {
  NotFoundError,
} from "../../../_shared/errors.ts";
import { 
    testUser, 
    testUser1ProfileWithoutId,
    coursePublic,
    newTagData
} from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { createTag } from "../../../courses/controller/create_tag_activity.ts";
import { updateTag } from "../../../courses/controller/update_tag_activity.ts";

describe("Update Tag tests", () => {
    let user1Id: string;
    let courseId: string;
    let tagId: string;
    const updateTagData = {...newTagData, name: "Updated tag name"}; 
    const invalidId = "00000000-0000-0000-0000-000000000000";

    beforeAll(async () => {
        await supa.from("courses").delete().not('id', 'is', null);
        await supa.from("course_roles").delete().not('id', 'is', null);
        await supa.from("course_members").delete().not('id', 'is', null);
        await supa.from("tags").delete().neq('id', 0);
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
    });

    afterEach(async () => {
        await supa.from("courses").delete().not('id', 'is', null);
        await supa.from("course_roles").delete().not('course_id', 'is', null);
        await supa.from("course_members").delete().not('course_id', 'is', null);
        await supa.from("tags").delete().neq('id', 0);
    });

    afterAll(async () => {
        const users = await supa.auth.admin.listUsers();
        for (const user of users.data.users) {
            await supa.auth.admin.deleteUser(user.id);
        }
    });

    it("Should fail if tag does not exist", async() => {
        try {
            await updateTag(updateTagData, invalidId);
            throw new Error(`Expected to fail but did not`);
        } catch(error) {
            assertInstanceOf(error, NotFoundError);
        }
    });

    it("Should update tag data", async() => {
        await updateTag(updateTagData, tagId);
        const { data: tagData, error } = await supa.from("tags").select("*").eq("id", tagId).single();
        assertExists(tagData);
        assertEquals(tagData.course_id, courseId);
        assertEquals(tagData.name, updateTagData.name);
        assertEquals(tagData.parent_id, null);
        assertEquals(tagData.permissions, updateTagData.permissions);
        assertEquals(tagData.can_use_tag, updateTagData.can_use_tag);
    });
});