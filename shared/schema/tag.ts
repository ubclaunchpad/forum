import { z } from "../deps.ts";
import { DEFAULT_ROLES } from "./course.ts";

const rolesPermissionSchema = Object.fromEntries(
    DEFAULT_ROLES.map((role) => [role, z.boolean()])
);

const allAllowed = Object.fromEntries(
    DEFAULT_ROLES.map((role) => [role, true])
);

const allAllowedSchema = z.object(rolesPermissionSchema).transform((val) => {
    return { ...allAllowed, ...val };
});

const instructorStaffAllowed = Object.fromEntries(
    DEFAULT_ROLES.map((role, index) => [role, index < 2])
);

const instructorStaffAllowedSchema = z.object(rolesPermissionSchema).transform((val) => {
    return { ...instructorStaffAllowed, ...val };
});

const onlyInstructorAllowed = Object.fromEntries(
    DEFAULT_ROLES.map((role, index) => [role, index < 1])
);

const onlyInstructorAllowedSchema = z.object(rolesPermissionSchema).transform((val) => {
    return { ...onlyInstructorAllowed, ...val };
});

export const tagPermissionsSchema = z.object({
    can_view_post: allAllowedSchema.default(allAllowed),
    can_edit_post: allAllowedSchema.default(allAllowed),
    can_delete_post: instructorStaffAllowedSchema.default(instructorStaffAllowed),
    can_change_post_visibility: instructorStaffAllowedSchema.default(instructorStaffAllowed)
});

export type TagPermissions = z.infer<typeof tagPermissionsSchema>;

export const baseTagSchema = z.object({
    parent_id: z.string().optional(),
    name: z.string(),
    permissions: tagPermissionsSchema,
    can_use_tag: allAllowedSchema.default(allAllowed)
});

export type NewTag = z.infer<typeof baseTagSchema>;

export const updateTagSchema = baseTagSchema.partial(); 

export type UpdateTag = z.infer<typeof updateTagSchema>;

export const tagSchema = baseTagSchema.extend({
    id: z.string(),
    course_id: z.string()
});

export type Tag = z.infer<typeof tagSchema>;

export const nestedTagSchema: z.ZodType<any> = z.lazy(() => tagSchema.extend({
    parent: nestedTagSchema.optional().nullable()
}));

export type NestedTag = z.infer<typeof nestedTagSchema>;