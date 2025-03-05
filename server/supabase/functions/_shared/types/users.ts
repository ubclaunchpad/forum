import { z } from "npm:zod"

export const newUserSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    timezone: z.string().optional(),
    pronouns: z.string().optional(),
    avatar_url: z.string().optional(),
    bio: z.string().optional(),
    social_links: z.array(z.string()).optional(),
    display_name: z.string().optional(),
    username: z.string().optional(),
    password: z.string(),
  })

export type NewUser = z.infer<typeof newUserSchema>