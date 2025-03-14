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
import { getCourse } from "../../../courses/controller/get_course_activity.ts";
import { getUserById } from "../../../users/controller.ts";
import { Course } from '../../../../../../shared/schema/course.ts';

describe("Get Course tests", () => {
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
        await supa.from("course_roles").delete().not('id', 'is', null);
        await supa.from("course_members").delete().not('id', 'is', null);
    });

    afterAll(async () => {
        const users = await supa.auth.admin.listUsers();
        for (const user of users.data.users) {
            await supa.auth.admin.deleteUser(user.id);
        }
    });

    it("Should fail if course does not exist", async () => {
        try {
            const course = await getCourse("00000000-0000-0000-0000-000000000000");
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
        }
    });

    it("Should get a course", async () => {
        const course = await createCourse(coursePublic, user1Id);
        const courseData = await getCourse(course.id);
        assertExists(courseData);
        assertEquals(courseData.department, coursePublic.department);
        assertEquals(+courseData.code, coursePublic.code);
        assertEquals(courseData.section, coursePublic.section);
        assertEquals(courseData.name, coursePublic.name);
        assertEquals(courseData.access, coursePublic.access);
    });
});
