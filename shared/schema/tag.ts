import { z } from "../deps.ts";
import { DEFAULT_ROLES } from "./course.ts";

const rolesPermissionSchema = Object.fromEntries(
    DEFAULT_ROLES.map((role) => [role, z.boolean()])
);

const allAllowed = Object.fromEntries(
    DEFAULT_ROLES.map((role) => [role, true])
);

const instructorStaffAllowed = Object.fromEntries(
    DEFAULT_ROLES.map((role, index) => [role, index < 2])
);

const onlyInstructorAllowed = Object.fromEntries(
    DEFAULT_ROLES.map((role, index) => [role, index < 1])
);

export const tagPermissionsSchema = z.object({
    can_view_post: z.object(rolesPermissionSchema).default(allAllowed),
    can_edit_post: z.object(rolesPermissionSchema).default(allAllowed),
    can_delete_post: z.object(rolesPermissionSchema).default(instructorStaffAllowed),
    can_change_post_visibility: z.object(rolesPermissionSchema).default(instructorStaffAllowed)
});

export type TagPermissions = z.infer<typeof tagPermissionsSchema>;

export const baseTagSchema = z.object({
    parent_id: z.string().optional(),
    name: z.string(),
    permissions: tagPermissionsSchema,
    can_use_tag: z.object(rolesPermissionSchema).default(allAllowed)
});

export type NewTag = z.infer<typeof baseTagSchema>;

export const tagSchema = baseTagSchema.extend({
    id: z.string(),
    course_id: z.string()
});

export type Tag = z.infer<typeof tagSchema>;

export const nestedTagSchema: z.ZodType<any> = z.lazy(() => tagSchema.extend({
    parent: nestedTagSchema.optional().nullable()
}));

export type NestedTag = z.infer<typeof nestedTagSchema>;