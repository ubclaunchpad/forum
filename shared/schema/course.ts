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
