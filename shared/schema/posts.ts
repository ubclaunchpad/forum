import { string } from "npm:zod@3.24.2";
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

export const postAuthorSchema = z.object({
  post_id: z.string().uuid(),
  user_id: z.string().uuid().nullish().optional(),
  comment_id: z.string().uuid().nullish().optional(),
  reply_id: z.string().nullish().optional(),
  pseudonym: z.string().optional(),
  visibility: z.string(),
});

export type PostAuthor = z.infer<typeof postAuthorSchema>;

export const postEditInfoSchema = z.object({
  title: z.string(),
  content: z.string(),
  updated_at: z.date(),
  userPseudonym: z.string(),
  userVisibility: z.string(),
});

export type PostEditInfo = z.infer<typeof postEditInfoSchema>;

export const postCommentReplySchema = z.object({
  id: z.string().uuid(), // UUID
  commentId: z.string().uuid(), // UUID
  content: z.string(),
  numberId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PostCommentReply = z.infer<typeof postCommentReplySchema>;

export const postCommentSchema = z.object({
  id: z.string().uuid(), // UUID
  postId: z.string().uuid(), // UUID
  content: z.string(),
  numberId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  replies: z.array(postCommentReplySchema),
});

export type PostComment = z.infer<typeof postCommentSchema>;

export const postListSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(), // UUID
  title: z.string(),
  number_id: z.number(),
  status: z.string(), // Default: 'posted'
  createdAt: z.date(),
  updatedAt: z.date(),
  comments: z.array(postCommentSchema).optional(),
});

export type PostList = z.infer<typeof postListSchema>;

export const postResponse = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(), // UUID
  title: z.string(),
  content: z.string(),
  number_id: z.number(),
  status: z.string(), // Default: 'posted'
  createdAt: z.date(),
  updatedAt: z.date(),
  comments: z.array(postCommentSchema).optional(),
});

export type PostResponse = z.infer<typeof postResponse>;

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
