import { supa } from '../db.ts';
import { PermissionError } from '../errors.ts';
import { DEFAULT_ROLES, DefaultRoles, instructorRole, Permissions } from '../../../../../shared/schema/course.ts';
import { getTagNested } from './tag_helper.ts';
import { NestedTag, TAG_PERMISSIONS_KEYS, TagPermissions, tagPermissionsSchema, TagPermissionsKey, Tag } from "@shared/schema/tag.ts";

export async function isUserMemberOfCourse(user_id: string, course_id: string): Promise<boolean> {
    const { data, error } = await supa.from('course_members')
        .select('*')
        .eq('user_id', user_id)
        .eq('course_id', course_id);
    
    if (error) {
        throw new Error(`Failed to check if user ${user_id} is a member of course ${course_id}: ${error.message}`);
    }

    return data.length > 0;
}

export async function getRoleInCourse(user_id: string, course_id: string): Promise<DefaultRoles> {
    const { data: courseRoleData, error: courseRoleError } = await supa.from('course_members')
        .select('role_id')
        .eq('user_id', user_id)
        .eq('course_id', course_id); 

    if (courseRoleError) {
        throw new Error(`Failed to get role for user ${user_id} in course ${course_id}: ${courseRoleError.message}`);
    }

    if (!courseRoleData || courseRoleData.length !== 1) {
        throw new PermissionError(`User ${user_id} is not a member of course ${course_id}`);	
    }

    const role_id = courseRoleData[0].role_id;
    const { data: roleData, error: roleError } = await supa.from('account_roles')
        .select('name')
        .eq('id', role_id);
    
    if (roleError) {
        console.error(`Failed to get role for user ${user_id} in course ${course_id}: ${roleError.message}`);
    }

    if (!roleData || roleData.length !== 1) {
        throw new Error(`Role ${role_id} for user ${user_id} in course ${course_id} was expected but to exist but did not`);
    }

    return roleData[0].name as DefaultRoles;
}

export async function isUserInstructorInCourse(user_id: string, course_id: string): Promise<boolean> {
    if (!isUserMemberOfCourse(user_id, course_id)) {
        return false;
    }

    const role = await getRoleInCourse(user_id, course_id);
    return role === instructorRole;
}

export async function getUserPermissionsInCourse(user_id: string, course_id: string): Promise<Permissions> {
    // TODO: This likely need to be more complicated or refactored to only get the default permissions
    const { data: courseRoleData, error: courseRoleError } = await supa.from('course_members')
        .select('role_id')
        .eq('user_id', user_id)
        .eq('course_id', course_id); 

    if (courseRoleError) {
        throw new Error(`Failed to get role for user ${user_id} in course ${course_id}: ${courseRoleError.message}`);
    }

    if (!courseRoleData || courseRoleData.length !== 1) {
        throw new PermissionError(`User ${user_id} is not a member of course ${course_id}`);	
    }

    const role_id = courseRoleData[0].role_id;
    const { data: roleData, error: roleError } = await supa.from('account_roles')
        .select('default_permissions')
        .eq('id', role_id);
    
    if (roleError) {
        console.error(`Failed to get permissions for user ${user_id} in course ${course_id}: ${roleError.message}`);
    }

    if (!roleData || roleData.length !== 1) {
        throw new Error(`Role ${role_id} for user ${user_id} in course ${course_id} was expected but to exist but did not`);
    }

    return roleData[0].default_permissions as Permissions;
}

export async function getPostPermissions(post_id: string) {
    const { data: postTagsData, error: postTagsError } = await supa.from("post_tags")
        .select("tags(*)")
        .eq("post_id", post_id);
    
    if (postTagsError) {
        console.error(postTagsError.message);
        throw new Error(`Internal server error: ${postTagsError.message}`);
    }
    if (!postTagsData || postTagsData.length === 0) {
        return tagPermissionsSchema.parse({});
    }

    const tags = postTagsData.flatMap(entry => entry.tags) as Tag[];
    const tagPermissionsPromises = tags.map(tag => getTagPermissions(tag.id));
    const tagPermissions = await Promise.all(tagPermissionsPromises);
    const postPermissions = mergePermissions(tagPermissions);
    return postPermissions;
}

export function getTagPermissions(tag_id: string): Promise<TagPermissions> {
    return getTagNested(tag_id)
    .then((nestedTag) => {
        const flattenPermissions = flattenTagPermissions(nestedTag);
        const tagPermissions = mergePermissions(flattenPermissions);
        return tagPermissions;
    });
}

function mergePermissions(permissionsArray: TagPermissions[]): TagPermissions {
    const mergedPermissions = tagPermissionsSchema.parse({});
    TAG_PERMISSIONS_KEYS.forEach((permKey: TagPermissionsKey) => {
        mergedPermissions[permKey] = DEFAULT_ROLES.reduce((acc, role) => {
            acc[role] = permissionsArray.every(perms => perms[permKey][role]);
            return acc;
        }, {} as Record<DefaultRoles, boolean>);
    });
    return mergedPermissions;
}

function flattenTagPermissions(nestedTag: NestedTag): TagPermissions[] {
    const result = [ nestedTag.permissions ];
    if (nestedTag.parent_id === null || nestedTag.parent_id === undefined) {
        return result;
    }
    return result.concat(flattenTagPermissions(nestedTag.parent));
}

export async function isUserPostAuthor(user_id: string, post_id: string): Promise<boolean> {
    const { data: authorData, error: authorError } = await supa.from("post_authors")
        .select("*")
        .eq("post_id", post_id)
        .is("comment_id", null)
        .is("reply_id", null);
    
    if (authorError) {
        console.error(authorError);
        throw new Error(`Failed to retrieve authors of post ${post_id}: ${authorError.message}`);
    }

    return authorData.find(entry => entry.user_id === user_id);
}

export async function isUserReplyAuthor(user_id: string, reply_id: string): Promise<boolean> {
    const { data: authorData, error: authorError } = await supa.from("post_authors")
        .select("*")
        .eq("reply_id", reply_id);
    
    if (authorError) {
        console.error(authorError);
        throw new Error(`Failed to retrieve authors of reply ${reply_id}: ${authorError.message}`);
    }

    return authorData.find(entry => entry.user_id === user_id);
}