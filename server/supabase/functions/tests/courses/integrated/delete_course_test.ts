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
  AuthError,
  InputValidationError,
  NotFoundError,
  UserStatusError,
} from "../../../_shared/errors.ts";
import { testUser, testUser1ProfileWithoutId, coursePublic } from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { deleteCourse } from "../../../courses/controller/delete_course_activity.ts";
import { getUserById } from "../../../users/controller.ts";
import { Course } from '../../../../../../shared/schema/course.ts';

describe("Delete Course tests", () => {
    let user1Id: string;

    beforeAll(async () => {
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

    afterEach(async () => {
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
    
    it("Should delete a course", async () => {
        const course = await createCourse(coursePublic, user1Id);

        await deleteCourse(course.id);
        const { data: courseData, error: _ } = await supa.from("courses").select().eq("id", course.id).single();
        assertEquals(courseData, null);

        const { data: courseRoles, error: _1 } = await supa.from("course_roles").select().eq("course_id", course.id);
        assertExists(courseRoles);
        assertEquals(courseRoles.length, 0);

        const { data: courseMembers, error: _2 } = await supa.from("course_members").select().eq("course_id", course.id);
        assertExists(courseMembers);
        assertEquals(courseMembers.length, 0);

        //TODO
    });
});