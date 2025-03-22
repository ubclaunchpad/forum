import { Context, Hono } from "jsr:@hono/hono";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from "jsr:@hono/hono/cors";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts"; // This is required for the Supabase AI SDK
import { stream } from "jsr:@hono/hono/streaming";
import { openai } from "npm:@ai-sdk/openai";
import { generateText, streamText } from "npm:ai";

const functionName = "search";
const app = new Hono().basePath(`/${functionName}`);
const MATCH_THRESHOLD = 0.78;

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

const sql = postgres(
  // `SUPABASE_DB_URL` is a built-in environment variable
  Deno.env.get("SUPABASE_DB_URL")!,
);

app.post("/courses/:courseId", async (c: Context) => {
  const courseId = c.req.param("courseId");
  const { query } = await c.req.json();

  const { context, text: question, sources } = await delegateSearch(query, courseId);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    maxTokens: 1000,
    messages: [{ role: "assistant", content: context }, {
      role: "user",
      content: question,
    }],
  });

  return stream(c, (stream) => stream.pipe(result.toDataStream()));
});

app.get("/courses/:courseId", async (c: Context) => {
  const courseId = c.req.param("courseId");
  const text = c.req.query("query");
  console.log(text);
  if (!text) {
    return c.json({
      error: "text is required",
    }, 400);
  }

  // const startTime = performance.now();

  const { context, text: question, sources } = await delegateSearch(text, courseId);
  // let endTime = performance.now();
  // let duration = endTime - startTime;
  // console.log(`Time taken: ${duration} milliseconds to find sources`);

  if (sources.length === 0) {
    return c.json({
      result: "No sources found within the course",
      sources: [],
      text: question,
    }, 200);
  }

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    maxTokens: 1000,
    messages: [{ role: "assistant", content: context }, {
      role: "user",
      content: question,
    }],
  });

  // endTime = performance.now();
  // duration = endTime - startTime;
  // console.log(`Time taken: ${duration} milliseconds to generate response`);

  return c.json({
    text: question,
    sources: sources.map((s) => ({
      entity_id: s.entity_id,
      entity_type: s.entity_type,
    })),
    result: result.text,
  });
});

async function delegateSearch(text: string, courseId: string) {
  const embedding = await session.run(text, {
    mean_pool: true,
    normalize: true,
  }) as any;

  const embeddingArray = `[${embedding.toString()}]`;

  const res = await sql`
  WITH entity_ids AS (
    -- Get all post IDs for the course
    SELECT id AS entity_id
    FROM posts
    WHERE course_id = ${courseId}
    
    UNION ALL
    
    -- Get all document IDs for the course
    SELECT id AS entity_id
    FROM documents
    WHERE course_id = ${courseId}
  )
  
  SELECT 
    e.entity_id,
    e.entity_type,
    e.content,
    (e.embedding <=> ${embeddingArray}) AS similarity_score
  
  FROM embeddings e
  -- Join with our entity_ids to filter only relevant embeddings
  JOIN entity_ids ei ON e.entity_id = ei.entity_id
  -- Additional vector similarity filtering
  WHERE e.embedding <=> ${embeddingArray} < ${1 - MATCH_THRESHOLD}::float
  -- Order by similarity (closest matches first)
  ORDER BY e.embedding <=> ${embeddingArray} ASC
  LIMIT 10
  `;

  const sourcesWithSimilarity = res.map((r) => {
    const { similarity_score, ...rest } = r;
    let confidence = "";
    if (similarity_score < 0.1) {
      confidence = "Very relevant";
    } else if (similarity_score < 0.3) {
      confidence = "Relevant";
    } else if (similarity_score < 0.5) {
      confidence = "Somewhat relevant";
    } else {
      confidence = "Probaly not relevant";
    }
    return { ...rest, confidence } as {
      entity_id: string;
      entity_type: string;
      content: string;
      confidence: string;
    };
  });

  console.log(sourcesWithSimilarity.map((s) => s.confidence));
  console.log(res.map((s) => s.similarity_score));

  const context = `
Question and extra information: ${text}

- Answer this question with also using the sources below if relevant.
- Your answers should be concised but when the question is asking to elaborate or a follow up use your judgment to figure out the correct manner of response.
- This means you should not have to end with a "conclusion" paragraph. For example questions that are like a typical search engine should be straightforward. e.g. Where is this book? answer: Yuu can find the book here.
- You are contextually aware of the course, the user and other members in the course.
- Concise is always preferred. Only explain if user insists or the question is not straightforward.

- Only keep inline citations. number the citations. for each citation it has to be [number](<entity_type>_<entity_id>)
- Format needs to be markdown. any markdown styles are allowed however avoid using h1, h2. only h3 and beyond. Exclude img, video, audio, etc.
- Some questions will not have direct answers; provide your best response based on your own knowledge and the sources provided. However, if not able to answer, say so and ask a followup. Be detailed in what would help you answer the question.
- Some questions might ask you about finding or redirecting. Give them the options hyperlinked so they can go to these. Example are finding a certain note, date range of posts, etc.

- Be smart in terms of the topics of your answer and the asked question. If the question is about a certain topic, that is not related to the course or the resources, refuse to answer and ask user to ask a question related to what you can answer.
- Your tone should be friendly and engaging and linguistically appropriate in the language you are responding in. Do not mimic user's tone. If user insists on a certain tone it still needs to be proper and not offensive or culturally inappropriate.
- Wh questions such as when, what, where, who should by default be concise and direct. But use your best judgement to figure out the correct manner of response.

SOURCES:
${
    sourcesWithSimilarity.map((r) =>
      `- ${r.entity_id} of type ${r.entity_type} is ${r.confidence} and content: ${r.content}`
    ).join("\n")
  }
  `;

  return {
    context,
    text,
    sources: res,
  };
}

export { app };

Deno.serve(app.fetch);
