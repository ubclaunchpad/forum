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
  PermissionError
} from "../../../_shared/errors.ts";
import { 
    testUser, 
    testUser2,
    testUser1ProfileWithoutId,
    testUser2ProfileWithoutId, 
    coursePublic
} from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { addUserToCourse } from "../../../courses/controller/add_course_member_activity.ts";
import { getCourseMembers } from "../../../courses/controller/get_course_members_activity.ts";
import { getUserById } from "../../../users/controller.ts";
import { Course, staffRole, studentRole } from '../../../../../../shared/schema/course.ts';

describe("Get Course Members tests", () => {
    let user1Id: string;
    let user2Id: string;
    let course1Id: string;
    const invalidId = "00000000-0000-0000-0000-000000000000";

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
        user2Id = (await userController.createUserViaEmailPassword(testUser2)).id;
        await userController.approveUserAccount(user2Id);
        await userController.activateAccountAndProfile(user2Id, testUser2ProfileWithoutId);
    });

    beforeEach(async () => {
        const course = await createCourse(coursePublic, user1Id);
        course1Id = course.id;
    });

    afterEach(async () => {
        await supa.from("courses").delete().not('id', 'is', null);
        await supa.from("course_roles").delete().not('id', 'is', null);
        await supa.from("course_members").delete().not('id', 'is', null);
    });

    afterAll(async () => {
        const users = await supa.auth.admin.listUsers();
        for (const user of users.data.users) {
            await supa.auth.admin.deleteUser(user.id);
        }
    });

    it("Should get all course members", async () => {
        const users = await getCourseMembers(course1Id);
        assertExists(users);
        assertEquals(users.length, 1);
        assertExists(users.find(user => user.id === user1Id));

        await addUserToCourse(course1Id, user2Id);
        const users2 = await getCourseMembers(course1Id);
        assertExists(users2);
        assertEquals(users2.length, 2);
        assertExists(users2.find(user => user.id === user1Id));
        assertExists(users2.find(user => user.id === user2Id));
    });
});