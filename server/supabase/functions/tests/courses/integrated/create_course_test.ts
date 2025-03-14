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
import { getUserById } from "../../../users/controller.ts";
import { Course } from '../../../../../../shared/schema/course.ts';

describe("Create Course tests", () => {
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

    it("Should fail if user does not exist", async () => {
        try {
            const course = await createCourse(coursePublic, "00000000-0000-0000-0000-000000000000");
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, NotFoundError);
        }
    });

    it("Should create a course", async () => {
        const course = await createCourse(coursePublic, user1Id);
        assertExists(course);
        assertEquals(course.department, coursePublic.department);
        assertEquals(+course.code, coursePublic.code);
        assertEquals(course.section, coursePublic.section);
        assertEquals(course.name, coursePublic.name);

        const { data: courseData, error: _ } = await supa.from("courses").select("*").eq("id", course.id).single();
        assertExists(courseData);
        assertEquals(courseData.department, coursePublic.department);
        assertEquals(+courseData.code, coursePublic.code);
        assertEquals(courseData.section, coursePublic.section);
        assertEquals(courseData.name, coursePublic.name);
        assertEquals(courseData.access, coursePublic.access);

        const roleNames = ["instructor", "staff", "student"];
        const { data: rolesData, error: rolesError } = await supa
            .from("account_roles")
            .select("id, name")
            .in("name", roleNames);
        assertExists(rolesData);
        assertEquals(rolesData.length, 3);

        for(const role of rolesData) {
            const { data: courseRoleData, error: courseRoleError } = await supa
                .from("course_roles")
                .select("*")
                .eq("course_id", course.id)
                .eq("role_id", role.id)
                .single();
            assertExists(courseRoleData);
        }

        const { data: instructorRoleData, error: instructorRoleError } = await supa
            .from("course_members")
            .select("*")
            .eq("course_id", course.id)
            .eq("user_id", user1Id)
            .eq("role_id", rolesData[0].id)	
            .single();
        assertExists(instructorRoleData);
    });

    it("Should fail if course already exists", async () => {
        await createCourse(coursePublic, user1Id);
        try {
            const course = await createCourse(coursePublic, user1Id);
            throw new Error("Should have thrown an error but instead succeeded");
        } catch (error) {
            assertInstanceOf(error, InputValidationError);
        }
    });
});