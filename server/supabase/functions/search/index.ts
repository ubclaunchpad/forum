import { Context, Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts"; // This is required for the Supabase AI SDK
import { streamText } from "jsr:@hono/hono/streaming";
import { supa } from "../_shared/db.ts";
import OpenAI from "jsr:@openai/openai";
import { z } from "@shared/mod.ts";
import { authMiddleware } from "../_shared/utils/auth.ts";
import { zodResponseFormat } from "jsr:@openai/openai/helpers/zod";
const session = new Supabase.ai.Session("gte-small");

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const functionName = "search";
const app = new Hono().basePath(`/${functionName}`);
const MATCH_THRESHOLD = 0.1;

const ThreadOutput = z.object({
  name: z.string().describe(
    "The title of the thread that captures the essence of the question and past context",
  ),
  meta: z.object({
    question: z.object({
      type: z.enum(["question", "clarification", "elaboration", "other"])
        .describe("The type of question that the user asked"),
      question: z.string().describe("The question that the user asked"),
      questionLanguage: z.string().describe(
        "The language of the question that the user asked",
      ),
    }).describe("The question that the user asked"),
  }).describe("The meta data of the question that the user asked"),
});

// const session = new Supabase.ai.Session("gte-small");


app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://forumai.me", "*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type", "*", "Origin", "Accept"],
    exposeHeaders: ["Authorization", "Content-Type", "*"],
  }),
);

app.use("*", authMiddleware as any);

const sql = postgres(
  // `SUPABASE_DB_URL` is a built-in environment variable
  Deno.env.get("SUPABASE_DB_URL")!,
);

app.post("/courses/:courseId/ask", async (c: Context) => {
  const courseId = c.req.param("courseId");
  const { query } = await c.req.json();
  const shouldStream = c.req.query("stream") === "true";
  const { threadId } = await c.req.json();

  const { context, text: question, sources } = await delegateSearch(
    query,
    courseId,
    threadId,
  );

  if (!shouldStream) {
    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "assistant", content: context }, {
        role: "user",
        content: question,
      }],
    });
    return c.json({
      sources: sources,
      question: question,
      answer: result.choices[0].message.content,
    });
  }

  return streamText(c, async (apiStream) => {
    let fullAnswer = "";
    const myUUID = crypto.randomUUID();
    const partialWithSources = {
      sources: sources,
      question: question,
      checkPoint: "Gathered sources",
      thread_id: threadId || myUUID,
    };
    await apiStream.writeln(JSON.stringify(partialWithSources));

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "assistant", content: context }, {
        role: "user",
        content: question,
      }],
      stream: true,
    });

    for await (const chunk of stream) {
      const partial = {
        text: chunk.choices[0].delta.content,
        checkPoint: "Generating response",
      };
      fullAnswer += chunk.choices[0].delta.content;
      await apiStream.writeln(JSON.stringify(partial));
    }

    await apiStream.writeln(JSON.stringify({
      text: fullAnswer,
      checkPoint: "Done",
    }));

    if (!threadId) {
      const prompt = `
      genreate a thread name for the following question:
      ${question}
      assuming the question is matched to these sources:
      ${sources.map((s) => `-: ${s.content}`).join("\n")}
      `;

      const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(ThreadOutput, "thread"),
        max_tokens: 1000,
      });

      const threadData = completion.choices[0].message.parsed;
      const { error: threadError } = await supa.from("search_threads").insert({
        id: myUUID,
        name: threadData?.name || question,
        user_id: c.get("user").id,
        course_id: courseId,
      }).select().single();

      if (threadError) {
        console.error(threadError);
      }
    }

    const { error } = await supa.from("search_history").insert({
      thread_id: threadId || myUUID,
      query: question,
      answer: fullAnswer,
      sources: sources,
    });
    if (error) {
      console.error(error);
    }
  });
});

app.get("/courses/:courseId/searches/report", async (c: Context) => {
  const courseId = c.req.param("courseId");
  const { data, error } = await supa.from("search_analysis").select("*").eq(
    "course_id",
    courseId,
  ).single();
  if (error) {
    console.error(error);
    return c.json({ error: "Error fetching report" }, 500);
  }
  return c.json({ report: data });
});

app.post("/courses/:courseId/searches/report", async (c: Context) => {
  const courseId = c.req.param("courseId");
  const req = await fetch(`${Deno.env.get("JOB_API")}/jobs/reports/course/${courseId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return c.json({ success: true });
});

app.get("/courses/:courseId/textsearch", async (c: Context) => {
  const courseId = c.req.param("courseId");
  const query = c.req.query("query");

  if (!query) {
    return c.json({ error: "Query is required" }, 400);
  }

  const { results, error } = await performTextSearch(query, courseId);
  if (error) {
    console.error(error);
    return c.json({ error: "Error fetching matches" }, 500);
  }
  return c.json({ results: results });
});

async function delegateSearch(
  text: string,
  courseId: string,
  threadId?: string,
) {
  let queryToEmbed = text;
  let pastGist = null;

  let thread = null;
  if (threadId) {
    const { data, error } = await supa.from("search_history").select("*").eq(
      "thread_id",
      threadId,
    );
    if (error) {
      console.error(error);
    }
    thread = data || [];
    pastGist = "Here are the past questions and answers: " +
      thread.map((t) => `${t.query}\n${t.answer}`).join("\n");
    const prompt = `
  ${pastGist}

  Here is the new question:
  ${text}

  Generate a new question combining the past questions and answers into a single question that breifly captures the essence of the new question and past context (question/answers).
  The new question should be concise and to the point.
  `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    queryToEmbed = response.choices[0].message.content || text;
  }

  // console.log("queryToEmbed", queryToEmbed);
  // const embedding = await client.embeddings.create({
  //   model: "text-embedding-3-small",
  //   input: queryToEmbed,
  //   encoding_format: "float",
  //   dimensions: 384,
  // });

  const embedding = await session.run(queryToEmbed, {
    mean_pool: true,
    normalize: true,
  }) as any;

  const embeddingArray = `[${embedding.toString()}]`;
  // const embeddingArray = `[${embedding.data[0].embedding.toString()}]`;

  // console.log("embeddingArray", embeddingArray);

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
  LIMIT 20
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

  const textSearchResults = [];

  if (res.length === 0) {
    const { results } = await performTextSearch(queryToEmbed, courseId);
    textSearchResults.push(...results);
  }

  const context = `
${
    queryToEmbed !== text
      ? `
 This is a question that has been paraphrased from your past responses to the user's questions for more clarity: ${queryToEmbed}
 You will be answering it.
`
      : `${text}`
  }

Expectations:

- Answer this question with also using the sources below if relevant.
- Your answers should be concise but when the question is asking to elaborate or a follow up use your judgment to figure out the correct manner of response.
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
  ${
    textSearchResults.map((r) =>
      `- ${r.entity_id} of type ${r.entity_type} is and content: ${r.content}`
    ).join("\n")
  }
  `;

  // console.log("context", context);

  return {
    context,
    text,
    sources: [...res, ...textSearchResults],
    pastGist,
    queryToEmbed,
  };
}

app.get("/threads/user/:userId", async (c: Context) => {
  const userId = c.req.param("userId");
  const courseId = c.req.query("course_id");

  if (c.get("user").id !== userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!courseId) {
    return c.json({ error: "Course ID is required" }, 400);
  }

  const { data, error } = await supa.from("search_threads").select("*").eq(
    "course_id",
    courseId,
  ).eq("user_id", userId);

  if (error) {
    console.error(error);
    return c.json({ error: "Error fetching threads" }, 500);
  }

  return c.json({ threads: data });
});

export { app };

Deno.serve(app.fetch);

async function performTextSearch(query: string, courseId: string) {
  if (!query) {
    return { error: "Query is required", results: [] };
  }

  const formattedQuery = query.split(" ").join(" & ");
  const { data: matches, error } = await supa.from("embeddings").select("*").eq(
    "course_id",
    courseId,
  )
    .textSearch("fts", formattedQuery).limit(15);

  if (error) {
    console.error(error);
    return { error: "Error fetching matches", results: [] };
  }

  if (!matches) {
    return { results: [], error: "No matches found" };
  }

  const docMatches = matches.filter((m) => m.entity_type === "document");
  const postMatches = matches.filter((m) => m.entity_type === "post");

  const docIds = docMatches.map((m) => m.entity_id);
  const postIds = postMatches.map((m) => m.entity_id);

  const [docResults, postResults] = await Promise.all([
    supa.from("documents").select("*, files(*)").in("id", docIds),
    supa.from("posts").select("*").in("id", postIds),
  ]);

  const docs = docResults.data;
  const posts = postResults.data;

  const results = matches.map((m) => {
    if (m.entity_type === "document") {
      const doc = docs?.find((d) => d.id === m.entity_id);
      return {
        ...doc,
        content: m.content,
        entity_type: "document",
        course_id: courseId,
        title: doc?.files.name,
        type: doc?.files.type,
        entity_id: doc?.id,
      };
    } else {
      const post = posts?.find((p) => p.id === m.entity_id);
      return {
        ...post,
        content: m.content,
        entity_type: "post",
        course_id: courseId,
        title: post?.title,
        type: "post",
        entity_id: post?.id,
      };
    }
  });

  return { results, error };
}
