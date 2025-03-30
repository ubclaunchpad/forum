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
import { tagPermissionsSchema } from "@shared/mod.ts";
import { NewTag, TagPermissions, TagPermissionsKey } from "@shared/schema/tag.ts";
import { getTagPermissions } from "../../../_shared/utils/permission_manager.ts";
import { DefaultRoles } from "@shared/schema/course.ts";

describe("Get Tag Permissions tests", () => {
    let user1Id: string;
    let courseId: string;
    let tagId1: string;
    let tagId2: string;
    let tagId3: string;
    let tagData1: NewTag;
    let tagData2: NewTag;
    let tagData3: NewTag;
    let tagPermissions1: TagPermissions;
    let tagPermissions2: TagPermissions;
    let tagPermissions3: TagPermissions;

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

        tagPermissions1 = tagPermissionsSchema.parse({});
        tagPermissions1.can_delete_post["staff"] = false; 
        tagData1 = { ...newTagData, permissions: tagPermissions1 }

        tagPermissions2 = tagPermissionsSchema.parse({});
        tagPermissions2.can_delete_post["student"] = true;
        tagPermissions3 = tagPermissionsSchema.parse({});
        tagPermissions3.can_view_post["student"] = false;
    });

    beforeEach(async () => {
        const course = await createCourse(coursePublic, user1Id);
        courseId = course.id;
        const tag = await createTag(tagData1, courseId);
        tagId1 = tag.id;
        tagData2 = {...newTagData, name: "middle tag", parent_id: tagId1, permissions: tagPermissions2};
        const tag2 = await createTag(tagData2, courseId);
        tagId2 = tag2.id;
        tagData3 = {...newTagData, name: "leaf tag", parent_id: tag2.id, permissions: tagPermissions3};
        const tag3 = await createTag(tagData3, courseId);
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

    it("Should properly get permissions of root tag", async() => {
        const tag1RetrievedPerms = await getTagPermissions(tagId1);

        assertEquals(tag1RetrievedPerms.can_delete_post["staff"], andPerms("can_delete_post", "staff", [tagPermissions1]));
    });

    it("Should properly get permissions of leaf tag", async() => {
        const tag3RetrievedPerms = await getTagPermissions(tagId3);

        const allPerms = [tagPermissions1, tagPermissions2, tagPermissions3];
        assertEquals(tag3RetrievedPerms.can_delete_post["staff"], andPerms("can_delete_post", "staff", allPerms));
        assertEquals(tag3RetrievedPerms.can_delete_post["student"], andPerms("can_delete_post", "student", allPerms));
        assertEquals(tag3RetrievedPerms.can_view_post["student"], andPerms("can_view_post", "student", allPerms));
        assertEquals(tag3RetrievedPerms.can_view_post["instructor"], andPerms("can_view_post", "instructor", allPerms));
        
        // Sanity checks 
        assertEquals(tag3RetrievedPerms.can_delete_post["staff"], false); // tag1 disallows this
        assertEquals(tag3RetrievedPerms.can_delete_post["student"], false); // tag1 disallows this
        assertEquals(tag3RetrievedPerms.can_view_post["student"], false); // tag3 disallows this
        assertEquals(tag3RetrievedPerms.can_view_post["instructor"], true); // no tag disallows this
    })
});

function andPerms(permKey: TagPermissionsKey, role: DefaultRoles, perms: TagPermissions[]) {
    return perms.every(perm => perm[permKey][role]);
}