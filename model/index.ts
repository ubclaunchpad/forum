import { Context, Hono } from "jsr:@hono/hono";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from "jsr:@hono/hono/cors";
import { jobSchema } from "./type.ts";
import { processDocumentJob } from "./runners/embed.ts";
import {
  generateReport,
  generateReportForAllCourses,
} from "./runners/report.ts";
import { z } from "@forum/shared";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://forumai.me", "*"],
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
    console.log(c.req.path);
    console.log("authMiddleware");
    await next();
  },
);

app.get("/", async (c: Context) => {
  return c.json({ message: "Server is running" });
});

app.use("/jobs/*", authMiddleware);

app.post("/jobs/embed", async (c: Context) => {
  console.log("embed job received");
  let body = null;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const parsedJobs = z.array(jobSchema).safeParse(body);
  if (!parsedJobs.success) {
    console.error(parsedJobs.error);
    return c.json(
      { error: "Invalid job", details: parsedJobs.error.errors },
      400,
    );
  }

  await processDocumentJob(parsedJobs);
  return c.json({ success: true });
});

app.post("/jobs/reports", async (c: Context) => {
  console.log("report job received");
  generateReportForAllCourses();
  console.log("Sent for processing");
  return c.json({ success: true });
});

app.post("/jobs/reports/course/:courseId", async (c: Context) => {
  console.log("report job received");
  const courseId = c.req.param("courseId");
  if (!courseId) {
    return c.json({ error: "Course ID is required" }, 400);
  }
  generateReport(courseId, { rangeInHours: 24 });
  console.log("Sent for processing");
  return c.json({ success: true });
});

export { app };

Deno.serve(app.fetch);
