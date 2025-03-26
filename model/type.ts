import { z } from "@forum/shared";

const MAX_WORDS = 512;

export const jobSchema = z.object({
    jobId: z.number(),
    sourceTable: z.string(),
    entityId: z.string(),
    entityType: z.string(),
    contentColumns: z.string(),
  });


export type Job = z.infer<typeof jobSchema>;


export type ThreadData = {
    thread_name: string;
    thread_id: string;
    created_at: string;
    user_id: string;
    queries: {
      query: string;
      answer: string;
      created_at: string;
      sources: {
        type: string;
        id: string;
      }[];
    }[];
  };
  

export type PageResult = {
    pageNumber: number;
    chunks: {
      content: string[];
      embedding: number[];
    }[];
  };
  