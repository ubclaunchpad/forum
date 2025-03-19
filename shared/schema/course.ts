import { z } from "../deps.ts";

export const courseConfigSchema = z.object({
  theme_colour: z.optional(z.string()),
  font: z.optional(z.string()),
});

export type CourseConfig = z.infer<typeof courseConfigSchema>;

export const COURSE_ACCESS_ENUM_VALUES = [
  "public",
  "open",
  "unlisted",
  "private",
] as const;

export type CourseAccessEnum = (typeof COURSE_ACCESS_ENUM_VALUES)[number];

export const courseBaseSchema = z.object({
  department: z.string(),
  code: z.number().int(),
  section: z.string(),
  name: z.string().optional(),
  config: courseConfigSchema.optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  access: z.string(),
});

export const courseSchema = courseBaseSchema.extend({
  id: z.string(),
});

export type Course = z.infer<typeof courseSchema>;

export const defaultPermissionsSchema = z.object({
  can_delete_course: z.boolean(),
  can_invite: z.object({
    instructor: z.boolean(),
    staff: z.boolean(),
    student: z.boolean(),
  }),
  can_remove: z.object({
    instructor: z.boolean(),
    staff: z.boolean(),
    student: z.boolean(),
  }),
  can_change_course_visibility: z.boolean(),
  can_create_tags: z.boolean(),
  can_edit_tags: z.boolean(),
  can_create_post: z.boolean(),
  can_view_posts: z.object({
    public: z.boolean(),
    private: z.boolean(),
  }),
  can_change_post_visibility: z.object({
    own: z.boolean(),
    others: z.boolean(),
  }),
  can_edit_post: z.object({
    own: z.boolean(),
    others: z.boolean(),
  }),
  can_delete_posts: z.object({
    own: z.boolean(),
    others: z.boolean(),
  }),
  can_tag_posts: z.object({
    own: z.boolean(),
    others: z.boolean(),
  }),
});

export const AccountRolesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  config: z.record(z.any()),
  default_permissions: defaultPermissionsSchema,
  created_at: z.date(),
  updated_at: z.date(),
});

export const DEFAULT_ROLES = ["instructor", "staff", "student"] as const;
export type DefaultRoles = (typeof DEFAULT_ROLES)[number];
export const instructorRole: DefaultRoles = DEFAULT_ROLES[0];
export const staffRole: DefaultRoles = DEFAULT_ROLES[1];
export const studentRole: DefaultRoles = DEFAULT_ROLES[2];

export const CourseRolesSchema = z.object({
  course_id: z.string(),
  role_id: z.string(),
});

export type NewCourse = z.infer<typeof courseBaseSchema>;

export const VisibilityEnum = z.enum(["public", "private"]);

export const updateCourseReqSchema = courseBaseSchema.omit({access: true});

export type UpdateCourseReq = z.infer<typeof updateCourseReqSchema>;