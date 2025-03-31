import { WebPDFLoader } from "npm:@langchain/community/document_loaders/web/pdf";
import * as pdfParse from "npm:pdf-parse"; // Keep -> required for WebPDFLoader
import type { Document } from "npm:@langchain/core/documents.js";
import { getOpenAIClient, getSupabaseClient, sql } from "../util.ts";
import type { Job, PageResult } from "../type.ts";

const EMBEDDING_QUEUE_NAME = "embedding_jobs";
const MAX_WORDS = 5000;

const client = getOpenAIClient();
const supa = getSupabaseClient();

export async function documentJobHandler(job: Job) {
  const { sourceTable, entityId, entityType } = job;
  const { data, error } = await supa.from(sourceTable).select("*, files(*)").eq(
    "id",
    entityId,
  ).single();

  if (error) {
    // console.warn(
    //   `Error fetching ${sourceTable} - ${entityId} - ${error.message}`,
    // );
    return;
  }

  const { bucket: bucket_name, path } = data.files;
  const fileInBucketPath = path.replace(`${bucket_name}/`, "");
  const { data: fileBlob, error: fileBlobError } = await supa.storage.from(
    bucket_name,
  ).download(fileInBucketPath);

  if (fileBlobError) {
    console.warn(
      `Error fetching file from bucket - ${bucket_name} - ${fileInBucketPath} - ${fileBlobError.message}`,
    );
    return;
  }

  if (!fileBlob) {
    console.warn(
      `File not found in bucket - ${bucket_name} - ${fileInBucketPath}`,
    );
    return;
  }

  // Convert the file blob to page embeddings
  let pageEmbeddings: PageResult[] = [];
  try {
    pageEmbeddings = await blobToPageEmbeddings(fileBlob);
  } catch (error) {
    console.warn("Error embedding file:", error);
    return;
  }

  // Insert the page embeddings into the database
  const flattenedEmbeddingEntries = pageEmbeddings.flatMap((page) =>
    page.chunks.map((
      chunk: { content: string | string[]; embedding: number[] },
      index,
    ) => ({
      entity_type: entityType,
      entity_id: entityId,
      chunk_index: index,
      content: typeof chunk.content === "string"
        ? chunk.content
        : chunk.content.join(" "),
      embedding: chunk.embedding,
      course_id: data.course_id,
    }))
  );

  const { error: embeddingError } = await supa.from("embeddings").insert(
    flattenedEmbeddingEntries,
  );
  if (embeddingError) {
    console.warn(
      `Error inserting embeddings - ${embeddingError.message}`,
    );
  }
}

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
    // const pagesResults: PageResult[] = [];
    // for (const document of batch) {
    //   console.log("HERE2");
    //   pagesResults.push(await handlePage(document));
    // }
    results.push(...pagesResults);
    console.log(
      `Processed batch ${i + 1} of ${batches} / ${batch.length} documents`,
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

async function handlePage(document: Document): Promise<PageResult> {
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

  //   const contentPartEmbeddings = [];
  //   for (const part of contentParts) {
  //     const embedding = await client.embeddings.create({
  //       model: "text-embedding-3-small",
  //       input: part,
  //       encoding_format: "float",
  //     });
  //     console.log("HERE");
  //     console.log("embedding", embedding);
  //     contentPartEmbeddings.push({
  //       embedding: embedding.data[0].embedding as number[],
  //       content: part,
  //     });
  //   }
  //   return {
  //     pageNumber,
  //     chunks: contentPartEmbeddings,
  //   };

  const contentPartPromises = contentParts.map(async (part) => {
    try {
      // const embedding = await session.run(part, {
      //   mean_pool: true,
      //   normalize: true,
      // });
      const embedding = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: part,
        encoding_format: "float",
      });
      // console.log("embedding", embedding);
      return {
        embedding: embedding.data[0].embedding as number[],
        // embedding: embedding as number[],
        content: part,
      };
    } catch (error) {
      console.warn("Error embedding part:", error);
      return {
        embedding: [],
        content: part,
      };
    }
  });
  try {
    const contentPartEmbeddings = await Promise.all(contentPartPromises);
    console.log("contentPartEmbeddings", contentPartEmbeddings.length);
    return {
      pageNumber,
      chunks: contentPartEmbeddings,
    };
  } catch (error) {
    console.warn("Error embedding page:", error);
    return {
      pageNumber,
      chunks: [],
    };
  }
}

export async function processAllJob(parsedJobs: any) {
  const jobRequests = parsedJobs.data;
  for (const jobRequest of jobRequests) {
    
    const { jobId, sourceTable, entityId, entityType, contentColumns} = jobRequest;

    console.log(
      `jobId: ${jobId} failed, entityId: ${entityId}, entityType: ${entityType} contentColumns: ${contentColumns}`,
    );
    if (sourceTable === "posts") {
      try {
        await postJobHandler(jobRequest);
        await sql`
      select pgmq.delete(${EMBEDDING_QUEUE_NAME}, ${jobId}::bigint)
      `;
      } catch (error) {
        console.log(
          `jobId: ${jobId} failed, entityId: ${entityId}, entityType: ${entityType}`,
        );
        console.error(error);
      }
    } else if (sourceTable === "documents") {
      try {
        await documentJobHandler(jobRequest);
        await sql`
      select pgmq.delete(${EMBEDDING_QUEUE_NAME}, ${jobId}::bigint)
      `;
      } catch (error) {
        console.log(
          `jobId: ${jobId} failed, entityId: ${entityId}, entityType: ${entityType}`,
        );
        console.error(error);
        // return c.json({ error: "Failed to process document" }, 500);
      }
    }
  }
}

export async function postJobHandler(job: Job) {
  const { entityId, entityType, sourceTable} = job;
  const { data, error } = await supa
    .from(sourceTable)
    .select("*")
    .eq("id", entityId)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  if (!data) {
    console.info("No data found");
    return;
  }

  const { content, title } = data;

  const contentWords = content.split(" ");
  const ACTUAL_MAX_WORDS = MAX_WORDS * 0.8;
  const parts = Math.ceil(contentWords.length / ACTUAL_MAX_WORDS);
  const contentParts = [];
  const embeddingsEntries = [];
  for (let i = 0; i < parts; i++) {
    const part = contentWords.slice(
      i * ACTUAL_MAX_WORDS,
      (i + 1) * ACTUAL_MAX_WORDS,
    ).join(" ");
    contentParts.push(part);
    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: `${title}: ${part}`,
      encoding_format: "float",
    });
    embeddingsEntries.push({
      entity_type: entityType,
      entity_id: entityId,
      chunk_index: i,
      content: part,
      course_id: data.course_id,
      embedding: embedding.data[0].embedding as number[],
    });
  }

  const { error: embeddingError } = await supa.from("embeddings").insert(
    embeddingsEntries,
  );

  if (embeddingError) {
    console.log("embeddingError", embeddingError);
    console.warn(
      `Error inserting embeddings - ${embeddingError.message}`,
    );
  }
}
