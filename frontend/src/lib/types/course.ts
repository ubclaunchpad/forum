import { z } from "zod";

export const courseConfigSchema = z.object({
  theme_colour: z.string().optional(),
  font: z.string().optional(),
  feature_flags: z
    .object({
      posts_enabled: z.boolean().default(true),
      documents_enabled: z.boolean().default(true),
      chat_enabled: z.boolean().default(false),
      ai_enabled: z.boolean().default(true),
      directory_enabled: z.boolean().default(true),
      dark_mode_enabled: z.boolean().default(false),
    })
    .optional(),
});

export const CourseAccessOptions = {
  unlisted: {
    value: "unlisted",
    label: "Unlisted",
    description:
      "Course is hidden from listings but accessible via direct link to join.",
  },
  open: {
    value: "open",
    label: "Open",
    description: "All forum members can find and join this course.",
  },
  private: {
    value: "private",
    label: "Private",
    description: "Only invited members can join the course.",
  },
  // public: {
  //   value: "public",
  //   label: "Public",
  //   description: "Anyone can view but must request to join"
  // }
} as const;

export type CourseAccessOption =
  (typeof CourseAccessOptions)[keyof typeof CourseAccessOptions];
export type CourseAccessValue = CourseAccessOption["value"];

export const courseAccessSchema = z.enum(
  Object.values(CourseAccessOptions).map((option) => option.value) as [
    CourseAccessValue,
    ...CourseAccessValue[],
  ],
);

export const courseSchema = z.object({
  id: z.string(),
  c_group: z.string(),
  code: z.coerce.string(),
  section: z.coerce.string(),
  name: z.string(),
  config: courseConfigSchema.optional(),
  access: courseAccessSchema,
});

export type Course = z.infer<typeof courseSchema>;
export type CourseAccess = z.infer<typeof courseAccessSchema>;

export const coursePartialUpdateSchema = courseSchema.partial();
