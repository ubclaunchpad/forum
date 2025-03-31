import { Context, Hono } from "jsr:@hono/hono";
import { cors } from 'jsr:@hono/hono/cors';
import { authMiddleware, UserVariables } from "../_shared/utils/auth.ts";
import { documentHandler } from "./documentController.ts";
import { uuidSchema } from "@shared/mod.ts";
const functionName = "documents";
const app = new Hono().basePath(`/${functionName}`); 

const documentController = documentHandler();

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

// Get all documents for course
app.get("/courses/:courseId", async (c) => {
  try {
    const { courseId } = c.req.param();
    const courseIdParsed = uuidSchema.safeParse(courseId);
    if (!courseIdParsed.success) {
      return c.json({ error: "Invalid course ID" }, 400);
    }
    const documents = await documentController.withCourse(courseIdParsed.data).getAllDocuments();
    return c.json({
      documents: documents
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});


// Create new document
app.post("/courses/:courseId", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { courseId } = c.req.param();
    const courseIdParsed = uuidSchema.safeParse(courseId);
    if (!courseIdParsed.success) {
      return c.json({ error: "Invalid course ID" }, 400);
    }
    const formData = await c.req.formData();
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    const userid = c.get("user").id;
    const document = await documentController.withCourse(courseIdParsed.data).createDocument({description, file, createdBy: userid });
    return c.json(document);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
    
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/document/:id/signed_url", async (c) => {
  const { id } = c.req.param();
  const document = await documentController.withCourse(id).getDocumentById(id);
  return c.json(document);
});

app.delete("/document/:id", async (c) => {
  const { id } = c.req.param();
  const document = await documentController.withCourse(id).deleteDocument(id);
  return c.json(document);
});

// app.get("/:id", async (c) => {
//   // TODO: get document by id - if user is in course, return document, if not, return error
// });

// app.delete("/:id", async (c) => {
//   // TODO: delete document by id - if user is in course, delete document, if not, return error
// });

// app.patch("/:id", async (c) => {
//   // TODO: update document by id - if user is in course, update document, if not, return error
// });


export { app };

Deno.serve(app.fetch);
