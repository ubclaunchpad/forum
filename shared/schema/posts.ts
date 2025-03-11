import { z } from "../deps.ts";

export const newPostSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
});

export type NewPost = z.infer<typeof newPostSchema>;

export const newPostOptionsSchema = z.object({
  visibility: z.string().default("public"),
  usePseudonym: z.boolean().default(false),
});

export type NewPostOptions = z.infer<typeof newPostOptionsSchema>;

export const DbPostSchema = z.object({
  id: z.string().uuid(),
  number_id: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  title: z.string(),
});

export type DbPost = z.infer<typeof DbPostSchema>;

export const newPostResultsSchema = z.object({
  post_id: z.string().uuid(),
  course_id: z.string().uuid(),
  pseudonym: z.string().optional(),
  title: z.string(),
  number_id: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type NewPostResults = z.infer<typeof newPostResultsSchema>;

export const postInfoSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export type PostInfo = z.infer<typeof postInfoSchema>;

// Schema for post edit information
export const postEditInfoSchema = z.object({
  new_content: z.string(),
  edit_reason: z.string().optional(),
});

export type PostEditInfo = z.infer<typeof postEditInfoSchema>;

export const postEditInfo = z.object({
  local_id: z.number(),
  course_id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
  updated_at: z.date(),
  created_by: z.string().uuid(),
});

export type PostMetadata = {
  views: number;
  likes: number;
};

export type PostInteractions = {
  viewed: boolean;
  liked: boolean;
};

export type DefaultResponse = {
  success: boolean;
  message: string;
};

export type PostEmbeddingMetadata = {
  exists: boolean;
  updated_at?: string;
  content_length?: number;
};

export type PostTag = {
  id: string;
  name: string;
  color: string;
};
