import { z } from "@shared/mod.ts";
import { supa } from "../_shared/db.ts";
import {
  DEFAULT_FILE_MANAGER_OPTIONS,
  fileManager,
} from "../_shared/utils/fileManager.ts";
import { WebPDFLoader } from "npm:@langchain/community/document_loaders/web/pdf";
import "jsr:@supabase/functions-js/edge-runtime.d.ts"; // This is required for the Supabase AI SDK
import { Document } from "npm:@langchain/core/documents.js";

const fileManagerInstance = fileManager(supa)(DEFAULT_FILE_MANAGER_OPTIONS);

const MAX_WORDS = 500;
const session = new Supabase.ai.Session("gte-small");

type PageResult = {
  pageNumber: number;
  chunks: {
    content: string[];
    embedding: number[];
  }[];
};

export const jobSchema = z.object({
  jobId: z.number(),
  sourceTable: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  contentColumns: z.string(),
});

type Job = z.infer<typeof jobSchema>;

export const documentJobHandler = async (job: Job) => {
  console.log("documentJobHandler", job);
  const { sourceTable, entityId, entityType } = job;
  // Get the file id and other metadata
  // console.log("sourceTable", sourceTable);
  // console.log("entityId", entityId);
  // console.log("entityType", entityType);
  const { data, error } = await supa.from(sourceTable).select("*, files(*)").eq(
    "id",
    entityId,
  ).single();
  // console.log("data", data);
  // console.log("error", error);

  if (error) {
    throw new Error(error.message);
  }

  const { bucket: bucket_name, path } = data.files;
  const fileInBuckePath = path.replace(`${bucket_name}/`, "");

  // Get the file blob
  const fileBlob = await fileManagerInstance.buckets.usingBucket(bucket_name)
    .getFileData(fileInBuckePath);

  if (!fileBlob) {
    throw new Error(
      `File not found in bucket - ${bucket_name} - ${fileInBuckePath}`,
    );
  }

  // Convert the file blob to page embeddings
  const pageEmbeddings = await blobToPageEmbeddings(fileBlob);

  // Insert the page embeddings into the database
  const flattenedEmbeddingEntries = pageEmbeddings.flatMap((page) =>
    page.chunks.map((chunk) => ({
      entity_type: entityType,
      entity_id: entityId,
      chunk_index: page.pageNumber,
      content: chunk.content,
      embedding: chunk.embedding,
      course_id: data.course_id,
    }))
  );

  const { error: embeddingError } = await supa.from("embeddings").insert(
    flattenedEmbeddingEntries,
  );
  console.log("embeddingError", embeddingError);

  if (embeddingError) {
    throw new Error(embeddingError.message);
  }

  return data;
};

async function blobToPageEmbeddings(blob: Blob): Promise<PageResult[]> {
  const startTime = Date.now();
  console.log("job.file run");
  const loader = new WebPDFLoader(blob);

  let documents: Document[] = [];
  try {
    documents = await loader.load();
  } catch (error) {
    console.error("Error loading documents:", error);
  }

  const results: PageResult[] = [];

  const batchSize = 50;
  const batches = Math.ceil(documents.length / batchSize);
  for (let i = 0; i < batches; i++) {
    const batch = documents.slice(i * batchSize, (i + 1) * batchSize);
    const pagePromises = batch.map(async (document) => {
      return await handlePage(document);
    });
    const pagesResults = await Promise.all(pagePromises);
    results.push(...pagesResults);
    console.log(
      `Processed batch ${i + 1} of ${batches} aka ${batch.length} documents`,
    );
  }
  const stats = results.reduce((acc, curr) => {
    return acc + curr.chunks.length;
  }, 0);

  const endTime = Date.now();
  console.log(`Time taken: ${(endTime - startTime) / 1000} seconds`);
  console.log(`Pages: ${results.length}`);
  console.log(`Chunks: ${stats}`);
  console.log(`Total word count: ${stats * MAX_WORDS}`);
  return results;
}

const handlePage = async (document: Document): Promise<PageResult> => {
  const content = document.pageContent;
  const pageNumber = document.metadata.loc.pageNumber as number;
  const contentWords = content.split(" ");
  const ACTUAL_MAX_WORDS = MAX_WORDS * 0.8;
  const parts = Math.ceil(contentWords.length / ACTUAL_MAX_WORDS);
  const contentParts = [];
  for (let i = 0; i < parts; i++) {
    const part = contentWords.slice(
      i * ACTUAL_MAX_WORDS,
      (i + 1) * ACTUAL_MAX_WORDS,
    ).join(" ");
    contentParts.push(part);
  }
  const contentPartPromises = contentParts.map(async (part) => {
    const embedding = await session.run(part, {
      mean_pool: true,
      normalize: true,
    });
    return {
      embedding: embedding as number[],
      content: part,
    };
  });

  const contentPartEmbeddings = await Promise.all(contentPartPromises);

  return {
    pageNumber,
    chunks: contentPartEmbeddings,
  };
};
