import { Context, Hono } from "jsr:@hono/hono";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from 'jsr:@hono/hono/cors';
// import { validateUserFromToken } from "../_shared/utils/auth.ts";
import { supa } from "../_shared/db.ts";
import { z } from "@shared/mod.ts";
import postgres from 'https://deno.land/x/postgresjs@v3.4.5/mod.js'
import "jsr:@supabase/functions-js/edge-runtime.d.ts" // This is required for the Supabase AI SDK

const functionName = "search";
const app = new Hono().basePath(`/${functionName}`); 

const session = new Supabase.ai.Session('gte-small');

app.use("*", cors({
  origin: ["http://localhost:3000", "*"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Authorization", "Content-Type", "*"],
  exposeHeaders: ["Authorization", "Content-Type"],
}));


type UserVariables = {
  user: any;
};


const authMiddleware = createMiddleware<{
  Variables: UserVariables;
}>(async (c: Context<{ Variables: UserVariables }>, next: () => Promise<void>) => {;
  // const user = await validateUser(c);
  // c.set('user', user);
  console.log("authMiddleware");
  await next();
});

app.use("*", authMiddleware);


const sql = postgres(
  // `SUPABASE_DB_URL` is a built-in environment variable
  Deno.env.get('SUPABASE_DB_URL')!
)

const MATCH_THRESHOLD = 0.78;
app.post("/", async (c: Context) => {
  const { text } = await c.req.json();

  const embedding = await session.run(text, {
    mean_pool: true,
    normalize: true,
  }) as any

  const embeddingArray = `[${embedding.toString()}]`;

  const res = await sql`
  select 
    entity_id,
    entity_type,
    content,
    (embedding <=> ${embeddingArray}) as similarity_score
  from embeddings
  where embedding <=> ${embeddingArray} < ${1 - MATCH_THRESHOLD}::float
  order by embedding <=> ${embeddingArray} asc
  limit 10
  `;

  return c.json(res);
  
});


export { app };

Deno.serve(app.fetch);
