import { z } from "../deps.ts";

export const authorSchema = z.object({
  user_id: z.string().uuid().nullable(),
  pseudonym: z.string().optional(),
  comment_id: z.string().uuid().nullable(),
  reply_id: z.string().uuid().nullable(),
  post_id: z.string().uuid().nullable(),
});

export const postSchema = z.object({
  course_id: z.string().uuid(),
  id: z.string().uuid(),
  number_id: z.number(),
  title: z.string(),
  content: z.string(),
  status: z.enum(["draft", "published", "archived", "deleted"]),
  created_at: z.date(),
  updated_at: z.date(),
  visibility: z.enum(["public", "private", "unlisted"]),
  authors: z.array(authorSchema),
});

export const mutatePostSchema = postSchema.pick({
  course_id: true,
  title: true,
  content: true,
}).extend({
  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
});

export const mutatePostPartialSchema = postSchema.partial().extend({
  course_id: z.string().uuid()
});

export const mutatePostOptionsSchema = z.object({
  visibility: z.string().default("public"),
  use_pseudonym: z.boolean().default(false),
});

export const mutatePostArgumentsSchema = z.object({
  postArgs: mutatePostSchema,
  optionArgs: mutatePostOptionsSchema,
});

export type MutatePost = z.infer<typeof mutatePostSchema>;
export type MutatePostEdit = z.infer<typeof mutatePostPartialSchema>;
export type MutatePostOptions = z.infer<typeof mutatePostOptionsSchema>;
export type MutatePostArguments = z.infer<typeof mutatePostArgumentsSchema>;
export type Post = z.infer<typeof postSchema>;
export type PostAuthor = z.infer<typeof postSchema.shape.authors.element>;

export type PostWithComments = Post & {
  comments: PostComment[];
}


export const postCommentReplySchema = z.object({
  id: z.string().uuid(), // UUID
  comment_id: z.string().uuid(), // UUID
  content: z.string(),
  number_id: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  authors: z.array(authorSchema)
});

export type PostCommentReply = z.infer<typeof postCommentReplySchema>;

export const postCommentSchema = z.object({
  id: z.string().uuid(), // UUID
  postId: z.string().uuid(), // UUID
  content: z.string(),
  number_id: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
  replies: z.array(postCommentReplySchema),
});

export type PostComment = z.infer<typeof postCommentSchema>;


