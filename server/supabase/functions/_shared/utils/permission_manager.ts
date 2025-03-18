import { supa } from '../db.ts';
import { PermissionError } from '../errors.ts';
import { instructorRole, Permissions } from '../../../../../shared/schema/course.ts';

export async function isUserMemberOfCourse(user_id: string, course_id: string): Promise<boolean> {
    const { data, error } = await supa.from('course_members')
        .select('id')
        .eq('user_id', user_id)
        .eq('course_id', course_id);
    
    if (error) {
        throw new Error(`Failed to check if user ${user_id} is a member of course ${course_id}: ${error.message}`);
    }

    return data.length > 0;
}

export async function getRoleInCourse(user_id: string, course_id: string): Promise<DefaualtRoles> {
    const { courseRoleData, courseRoleError } = await supa.from('course_members')
        .select('role_id')
        .eq('user_id', userId)
        .eq('course_id', courseId); 

    if (courseRoleError) {
        throw new Error(`Failed to get role for user ${user_id} in course ${course_id}: ${courseRoleError.message}`);
    }

    if (!courseRoleData || courseRoleData.length !== 1) {
        throw new PermissionError(`User ${user_id} is not a member of course ${course_id}`);	
    }

    const role_id = courseRoleData[0].role_id;
    const { roleData, roleError } = await supa.from('account_roles')
        select('name')
        .eq('id', role_id);
    
    if (roleError) {
        console.error(`Failed to get role for user ${user_id} in course ${course_id}: ${roleError.message}`);
    }

    if (!roleData || roleData.length !== 1) {
        throw new Error(`Role ${role_id} for user ${user_id} in course ${course_id} was expected but to exist but did not`);
    }

    return role_data[0].name as DefaultRoles;
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
    const { courseRoleData, courseRoleError } = await supa.from('course_members')
        .select('role_id')
        .eq('user_id', userId)
        .eq('course_id', courseId); 

    if (courseRoleError) {
        throw new Error(`Failed to get role for user ${user_id} in course ${course_id}: ${courseRoleError.message}`);
    }

    if (!courseRoleData || courseRoleData.length !== 1) {
        throw new PermissionError(`User ${user_id} is not a member of course ${course_id}`);	
    }

    const role_id = courseRoleData[0].role_id;
    const { roleData, roleError } = await supa.from('account_roles')
        select('default_permissions')
        .eq('id', role_id);
    
    if (roleError) {
        console.error(`Failed to get permissions for user ${user_id} in course ${course_id}: ${roleError.message}`);
    }

    if (!roleData || roleData.length !== 1) {
        throw new Error(`Role ${role_id} for user ${user_id} in course ${course_id} was expected but to exist but did not`);
    }

    return role_data[0].default_permissions as Permissions;
}