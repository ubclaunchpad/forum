import { Context, Hono } from "jsr:@hono/hono";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from "jsr:@hono/hono/cors";
// import { validateUserFromToken } from "../_shared/utils/auth.ts";
import { z } from "@shared/mod.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import { documentJobHandler } from "./jobHandler.ts";

const functionName = "embed";
const app = new Hono().basePath(`/${functionName}`);
const session = new Supabase.ai.Session("gte-small");

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type", "*"],
    exposeHeaders: ["Authorization", "Content-Type"],
  }),
);

const sql = postgres(
  // `SUPABASE_DB_URL` is a built-in environment variable
  Deno.env.get("SUPABASE_DB_URL")!,
);

type UserVariables = {
  user: any;
};

const authMiddleware = createMiddleware<{
  Variables: UserVariables;
}>(
  async (
    c: Context<{ Variables: UserVariables }>,
    next: () => Promise<void>,
  ) => {
    // const user = await validateUser(c);
    // c.set('user', user);
    console.log("authMiddleware");
    await next();
  },
);

app.use("*", authMiddleware);

// less than 512 tokens
const MAX_WORDS = 512;
const QUEUE_NAME = "embedding_jobs";

export const jobSchema = z.array(z.object({
  jobId: z.coerce.number(),
  sourceTable: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  contentColumns: z.string(),
  file: z.instanceof(File).optional(),
}));

app.post("/", async (c: Context) => {
  // console.log("embed job received");
  const body = await c.req.json();
  // console.log("body", body);
  const parsedJobs = jobSchema.safeParse(body);
  if (!parsedJobs.success) {
    console.error(parsedJobs.error);
    return c.json(
      { error: "Invalid job", details: parsedJobs.error.errors },
      400,
    );
  }

  const jobRequests = parsedJobs.data;
  for (const jobRequest of jobRequests) {
    const { jobId, sourceTable, entityId, entityType, contentColumns } =
      jobRequest;

    if (sourceTable === "texts") {
      // const { data } = await supa.from(sourceTable).select("*").eq(
      //   "id",
      //   entityId,
      // ).single();

      // console.log("data", data);
      // if (!data) {
      //   return c.json({ error: "Text not found" }, 404);
      // }

      // const { data: embeddingData } = await supa.from("embeddings").select("*")
      //   .eq("entity_id", entityId).eq("entity_type", entityType).single();

      // const document = data as any;
      // const contentData = [];
      // for (const column of contentColumns.split(",")) {
      //   contentData.push(document[column]);
      // }
      // const content = contentData.join("\n");
      // const words = content.split(" ");
      // if (words.length > 0.9 * MAX_WORDS) {
      //   return c.json({ error: "Content is too long" }, 400);
      // }

      // const embedding = await session.run(content, {
      //   mean_pool: true,
      //   normalize: true,
      // });

      // const { error: updatedEmbeddingError } = await supa.from("embeddings")
      //   .upsert({
      //     entity_type: entityType,
      //     entity_id: entityId,
      //     content: content,
      //     embedding: embedding,
      //     created_at: embeddingData?.created_at, // original created_at
      //     updated_at: new Date().toISOString(),
      //   });

      await sql`
  select pgmq.delete(${QUEUE_NAME}, ${jobId}::bigint)
  `;

      // if (updatedEmbeddingError) {
      //   console.log("Could not save embedding", updatedEmbeddingError);
      //   console.error(updatedEmbeddingError);
      //   return c.json({ error: "Failed to update embedding" }, 500);
      // }

      return c.json({ success: true });
    } else if (sourceTable === "post") {
      return c.json({ error: "Post embedding not implemented" }, 501);
    } else if (sourceTable === "documents") {
      try {
        console.log("processing document job", jobRequest);
        await documentJobHandler(jobRequest);
        await sql`
      select pgmq.delete(${QUEUE_NAME}, ${jobId}::bigint)
      `;
        return c.json({ success: true });
      } catch (error) {
        console.error(error);
        return c.json({ error: "Failed to process document" }, 500);
      }
    }
  }
});

app.post("/batch", async (c: Context) => {
  const { texts } = await c.req.json();

  texts.forEach((text: string, index: number) => {
    const words = text.split(" ");
    if (words.length > 0.9 * MAX_WORDS) {
      return c.json({ error: "Text at index " + index + " is too long" }, 400);
    }
  });

  const promises = texts.map(async (text: string) => {
    const words = text.split(" ");
    const embedding = await session.run(text, {
      mean_pool: true,
      normalize: true,
    });
    return {
      text: text,
      words: words.length,
      embedding: embedding,
    };
  });

  const embeddings = await Promise.all(promises);
  return c.json(embeddings);
});

export { app };

Deno.serve(app.fetch);
