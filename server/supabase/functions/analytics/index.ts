import { Context, Hono } from "jsr:@hono/hono";
import { cors } from "jsr:@hono/hono/cors";
import { supa } from "../_shared/db.ts";
import { validateUserFromToken } from "../_shared/utils/auth.ts";

const functionName = "analytics";
const app = new Hono().basePath(`/${functionName}`);

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://forumai.me", "*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Authorization", "Content-Type", "*"],
    exposeHeaders: ["Authorization", "Content-Type"],
  }),
);


app.use("*", async (c, next) => {
  await next();
});


export const validateUser = async (c: Context) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const user = await validateUserFromToken(token);
    return user;
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

app.get("/course/:courseId", async (c: Context) => {
  const user = await validateUser(c)
  const courseId = c.req.param("courseId");
  const { data, error } = await supa.from("search_analysis").select("*").eq("course_id", courseId).single();
  return c.json(data);
});

export { app };

Deno.serve(app.fetch);