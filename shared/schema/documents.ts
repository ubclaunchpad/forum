
import { z } from "../deps.ts";
import { uuidSchema } from "./general.ts";

export const newDocumentRequestSchema = z.object({
  description: z.string(),
  file: z.instanceof(File).refine((file) => file.size > 0, {
    message: "File is required",
  }),
});

export type NewDocumentRequest = z.infer<typeof newDocumentRequestSchema>;



export const newDocumentUploadSchema = newDocumentRequestSchema.extend({
  createdBy: uuidSchema,
});

export type NewDocumentUpload = z.infer<typeof newDocumentUploadSchema>;

export const getDocumentSchema = z.object({
  id: uuidSchema,
  description: z.string(),
  file_id: uuidSchema,
  created_at: z.string(),
  updated_at: z.string(),
  course_id: uuidSchema,
  created_by: uuidSchema,
  file: z.object({
    id: uuidSchema,
    name: z.string(),
    path: z.string(),
    size: z.number(),
    type: z.string(),
    bucket: z.string(),
  }),
});

export type GetDocument = z.infer<typeof getDocumentSchema>;

