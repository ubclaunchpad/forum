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

describe("Create Tag tests", () => {
    let user1Id: string;
    let courseId: string;
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

    it("Should fail if the course does not exist", async() => {
        try {
            const tag = await createTag(newTagData, invalidId);
            throw new Error(`Expected to fail but did not`);
        } catch(error) {
            assertInstanceOf(error, NotFoundError);
        }
    });

    it("Should create a new tag", async() => {
        const tag = await createTag(newTagData, courseId);
        const { data: tagData, error: tagError } = await supa.from("tags").select("*").eq("name", newTagData.name).single();
        assertEquals(tag.name, newTagData.name);
        assertEquals(tagData.name, newTagData.name);
        assertEquals(tag.course_id, courseId);
        assertEquals(tagData.course_id, courseId);
        assertEquals(tag.permissions, newTagData.permissions);
        assertEquals(tagData.permissions, newTagData.permissions);
        assertEquals(tag.can_use_tag, newTagData.can_use_tag);
        assertEquals(tagData.can_use_tag, newTagData.can_use_tag);
    });
});