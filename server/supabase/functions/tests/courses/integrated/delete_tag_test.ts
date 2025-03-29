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
import { deleteTag } from "../../../courses/controller/delete_tag_activity.ts"
import { getTagNested } from "../../../_shared/utils/tag_helper.ts";

describe("Delete Tag tests", () => {
    let user1Id: string;
    let courseId: string;
    let tagId: string;

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

    it("Should delete tag", async() => {
        await deleteTag(tagId, courseId);
        const { data: tagData, error } = await supa.from("tags").select("*").eq("id", tagId).single();
        assertEquals(tagData, null);
    });

    it("Should properly set parent of children tags", async() => {
        const newTagData2 = {...newTagData, name: "middle tag", parent_id: tagId};
        const tag2 = await createTag(newTagData2, courseId);
        const newTagData3 = {...newTagData, name: "leaf tag", parent_id: tag2.id};
        const tag3 = await createTag(newTagData3, courseId);
        await deleteTag(tag2.id, courseId);

        const { data: tag3Data, error } = await supa.from("tags").select("*").eq("id", tag3.id).single();
        assertEquals(tag3Data.parent_id, tagId);
    });
});