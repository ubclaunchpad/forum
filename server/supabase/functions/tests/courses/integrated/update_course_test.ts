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
    testUser1ProfileWithoutId,
    coursePublic
} from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { updateCourse } from "../../../courses/controller/update_course_activity.ts";
import { getUserById } from "../../../users/controller.ts";
import { Course, staffRole, studentRole, UpdateCourseReq } from '../../../../../../shared/schema/course.ts';

describe("Get All Courses tests", () => {
    let user1Id: string;
    let course1Id: string;
    let course2Id: string;
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

    it("Should fail if course does not exist", async () => {
        try {
            await updateCourse({ name: "Updated Course", department: "Another dept" } as UpdateCourseReq, invalidId);
            throw new Error("Should have failed");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
            assertEquals(error.message, `Course with id ${invalidId} not found`);
        }
    });

    it("Should update course", async () => {
        await updateCourse({ name: "Updated Course", department: "Another dept" } as UpdateCourseReq, course1Id);
        const { data: updatedCourse } = await supa.from("courses").select("*").eq("id", course1Id).single();
        assertExists(updatedCourse);
        assertEquals(updatedCourse.id, course1Id);
        assertEquals(updatedCourse.department, "Another dept");
        assertEquals(+updatedCourse.code, coursePublic.code);
        assertEquals(updatedCourse.section, coursePublic.section);
        assertEquals(updatedCourse.access, coursePublic.access);
        assertEquals(updatedCourse.name, "Updated Course");
    });

});