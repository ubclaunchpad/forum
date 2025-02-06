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

export const courseSchema = z.object({
  id: z.string(),
  c_group: z.string(),
  code: z.coerce.string(),
  section: z.coerce.string(),
  name: z.string(),
  config: courseConfigSchema.optional(),
});

export type Course = z.infer<typeof courseSchema>;

export const coursePartialUpdateSchema = courseSchema.partial();
