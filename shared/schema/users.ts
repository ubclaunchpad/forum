import { z } from "../deps.ts";


export const newUserSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
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

export const emailPasswordSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .describe("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character")
})

export type WithEmailAndPassword = z.infer<typeof emailPasswordSchema>

export const userSchema = z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    timezone: z.string().optional(),
    pronouns: z.string().optional(),
    avatar_url: z.string().optional(),
    bio: z.string().optional(),
    social_links: z.array(z.string()).optional().nullable(),
    display_name: z.string().optional(),
    username: z.string()
})

export type User = z.infer<typeof userSchema>


export type WithId<T> = T & {
    id: string;
}


export const profileWithoutId = userSchema.omit({
    id: true,
})

export type ProfileWithoutId = z.infer<typeof profileWithoutId>

export const ACCOUNT_STATUS_VALUES = ["active", "inactive", "waiting_for_approval", "approve_on_login"] as const;

export type AccountStatusValue = (typeof ACCOUNT_STATUS_VALUES)[number];

export type AccountStatus = {
    id: string;
    user_id: string;
    status: AccountStatusValue;
    created_at: Date;
    updated_at: Date;
    approved_at: Date | null;
    approved_by: string | null;
    joined_at: Date | null;
};