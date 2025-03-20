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
    coursePublic,
    coursePrivate
} from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { addUserToCourse } from "../../../courses/controller/add_course_member_activity.ts";
import { getUserById } from "../../../users/controller.ts";
import { Course, staffRole, studentRole } from '../../../../../../shared/schema/course.ts';

describe("Add User to Course tests", () => {
    let user1Id: string;
    let user2Id: string;
    let courseId: string;
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
        courseId = course.id;
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

    it("Should fail if course does not exist", async () => {
        try {
            await addUserToCourse(invalidId, user2Id);
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
            assertEquals(error.message, `Course with id ${invalidId} not found`);
        }
    });

    it("Should fail if course is private", async () => {
        const course = await createCourse(coursePrivate, user1Id);
        try {
            await addUserToCourse(course.id, user2Id);
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, PermissionError);
            assertEquals(error.message, "Cannot join a private course");
        }
    });

    it("Should fail if user does not exist", async () => {
        try {
            await addUserToCourse(courseId, invalidId);
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
            assertEquals(error.message, `User ${invalidId} not found`);
        }
    });

    it("Should fail if user is already in course", async () => {
        try {
            await addUserToCourse(courseId, user1Id);
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, InputValidationError);
            assertEquals(error.message, `User ${user1Id} already registered in course ${courseId}`);
        }
    });

    it("Should add user to course", async () => {
        await addUserToCourse(courseId, user2Id);

        const { data: courseMember } = await supa
            .from("course_members")
            .select("*")
            .eq("course_id", courseId)
            .eq("user_id", user2Id)
            .single();
        assertExists(courseMember);

        const { data: studentRoleData } = await supa
            .from("account_roles")
            .select("*")
            .eq("name", studentRole)
            .single();

        assertEquals(courseMember.role_id, studentRoleData.id);
    });

    it("Should add user to course with staff role", async () => {
        await addUserToCourse(courseId, user2Id, staffRole);

        const { data: courseMember } = await supa
            .from("course_members")
            .select("*")
            .eq("course_id", courseId)
            .eq("user_id", user2Id)
            .single();

        assertExists(courseMember);

        const { data: staffRoleData } = await supa
            .from("account_roles")
            .select("*")
            .eq("name", staffRole)
            .single();

        assertEquals(courseMember.role_id, staffRoleData.id);
    });
});