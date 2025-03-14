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

export const AccountRolesSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  config: z.record(z.any()),
  default_permissions: z.record(z.any()),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CourseRolesSchema = z.object({
  course_id: z.string(),
  role_id: z.string(),
});

export type NewCourse = z.infer<typeof courseBaseSchema>;

export const VisibilityEnum = z.enum(["public", "private"]);


// TODO: @victor: have a schema for what role permission should look like to easily cast to and from the database
// REMOVE THIS COMMENT WHEN DONE
// ('instructor', 'Administrator role', 
//   '{
//       "can_delete_course": true,
//       "can_invite": {
//           "instructor": true,
//           "staff": true,
//           "student": true
//       },
//       "can_remove": {
//           "instructor": true,
//           "staff": true,
//           "student": true
//       },
//       "can_change_course_visibility": true,
//       "can_create_tags": true,
//       "can_edit_tags": true,
//       "can_create_post": true,
//       "can_view_posts": {
//           "public": true,
//           "private": true
//       },
//       "can_change_post_visibility": {
//           "own": true,
//           "others": true
//       },
//       "can_edit_post": {
//           "own": true,
//           "others": true
//       },
//       "can_delete_posts": {
//           "own": true,
//           "others": true
//       },
//       "can_tag_posts": {
//           "own": true,
//           "others": true
//       }
//   }'

// Eg:
// const permissionSchema = z.object({
//   can_delete_course: z.boolean(),
//   can_invite: z.object({
//     instructor: z.boolean(),
//     staff: z.boolean(),
//     student: z.boolean(),
//   }),
//   ...
// ...

// TODO: @victor: have an as const array for the default roles:
// const DEFAULT_ROLES = ["instructor", "staff", "student"] as const;
// export type DefaultRoles = (typeof DEFAULT_ROLES)[number];
// const m: DefaultRoles =  "instructor"
