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
    newTagData,
    newPost,
    newPostOptions
} from '../../shared/test_data.ts';
import { createCourse } from "../../../courses/controller/create_course_activity.ts";
import { createTag } from "../../../courses/controller/create_tag_activity.ts";
import { DEFAULT_ROLES, tagPermissionsSchema } from "@shared/mod.ts";
import { NewTag, TAG_PERMISSIONS_KEYS, TagPermissions, TagPermissionsKey } from "@shared/schema/tag.ts";
import { DefaultRoles } from "@shared/schema/course.ts";
import { postController } from "../../../posts/controllers/crud.ts";
import { getPostPermissions } from "../../../_shared/utils/permission_manager.ts";

describe("Get Post Permissions tests", () => {
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
    let postId: string;

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
        tagData2 = {...newTagData, name: "leaf tag", parent_id: tagId1, permissions: tagPermissions2};
        const tag2 = await createTag(tagData2, courseId);
        tagId2 = tag2.id;
        tagData3 = {...newTagData, name: "independent tag", permissions: tagPermissions3};
        const tag3 = await createTag(tagData3, courseId);
        tagId3 = tag3.id;

        const newPostData = { ...newPost, course_id: courseId};
        const post = await postController.createPost(user1Id, newPostData, newPostOptions);
        postId = post.post_id;
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

    it("Should return default permissions for post without tags", async() => {
        const postPerms = await getPostPermissions(postId);

        const defaultPerms = tagPermissionsSchema.parse({});
        TAG_PERMISSIONS_KEYS.forEach(permKey => {
            DEFAULT_ROLES.forEach(role => {
                assertEquals(postPerms[permKey][role], defaultPerms[permKey][role]);
            });
        });
    });

    it("Should properly get permissions of a post with tags", async() => {
        await supa.from("post_tags").insert({ post_id: postId, tag_id: tagId2 });
        await supa.from("post_tags").insert({ post_id: postId, tag_id: tagId3 });
        const postPerms = await getPostPermissions(postId);

        const allPerms = [tagPermissions1, tagPermissions2, tagPermissions3];
        assertEquals(postPerms.can_delete_post["staff"], andPerms("can_delete_post", "staff", allPerms));
        assertEquals(postPerms.can_delete_post["student"], andPerms("can_delete_post", "student", allPerms));
        assertEquals(postPerms.can_view_post["student"], andPerms("can_view_post", "student", allPerms));
        assertEquals(postPerms.can_view_post["instructor"], andPerms("can_view_post", "instructor", allPerms));
        
        // Sanity checks 
        assertEquals(postPerms.can_delete_post["staff"], false); // tag1 disallows this
        assertEquals(postPerms.can_delete_post["student"], false); // tag1 disallows this
        assertEquals(postPerms.can_view_post["student"], false); // tag3 disallows this
        assertEquals(postPerms.can_view_post["instructor"], true); // no tag disallows this
    })
});

function andPerms(permKey: TagPermissionsKey, role: DefaultRoles, perms: TagPermissions[]) {
    return perms.every(perm => perm[permKey][role]);
}