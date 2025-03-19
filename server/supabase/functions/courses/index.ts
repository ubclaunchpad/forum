import { Context, Hono } from "jsr:@hono/hono";
import { AccountStatusValue, ACCOUNT_STATUS_VALUES } from "@shared/mod.ts";
import { createMiddleware } from "jsr:@hono/hono/factory";
import { cors } from 'jsr:@hono/hono/cors';
import { createCourse } from "./controller/create_course_activity.ts";
import { getCourse } from "./controller/get_course_activity.ts";
import { addUserToCourse } from "./controller/add_course_member_activity.ts";
import {
  NotFoundError,
} from "../_shared/errors.ts";
import { validateUserFromToken } from "../_shared/utils/auth.ts";
import { getUserCourses } from "./controller/get_all_courses_activity.ts";


const functionName = "courses";
const app = new Hono().basePath(`/${functionName}`); 

app.use("*", cors({
  origin: ["http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Authorization", "Content-Type", "*"],
  exposeHeaders: ["Authorization", "Content-Type"],
}));

const validateUser = async (c: Context) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (c.req.path.endsWith("/users") && c.req.method === "POST") {
    return null;
  }
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const user = await validateUserFromToken(token);
    return user;
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
}

type UserVariables = {
  user: any;
};

const authMiddleware = createMiddleware<{
  Variables: UserVariables;
}>(async (c: Context<{ Variables: UserVariables }>, next: () => Promise<void>) => {
  console.log("authMiddleware");
  const user = await validateUser(c);
  c.set('user', user);
  await next();
});

app.use("*", authMiddleware);


// Get course by course ID
app.get("/:course_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id } = c.req.param();
    const user = await getCourse(course_id);
    return c.json(user);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create new course
app.post("/", async (c) => {
  // try {
  //   const body = await c.req.json();

  //   const validationResult = newCourseSchema.safeParse(body);
  //   if (!validationResult.success) {
  //     return c.json({
  //       error: "Validation failed",
  //       details: validationResult.error.errors,
  //     }, 400);
  //   }

  //   const course = await createCourse(validationResult.data);
  //   return c.json(course, 201);
  // } catch (error) {
  //   if (error instanceof Error) {
  //     return c.json({ error: error.message }, 500);
  //   }
  //   console.error(error);
  //   return c.json({ error: "Internal server error" }, 500);
  // }
});

// Add user to course
app.post("/:course_id/members/:user_id", async (c: Context<{ Variables: UserVariables}>) => {
  // try {
  //   // const { course_id } = c.req.param("course_id");
  //   // const { user_id } = c.req.param("user_id");
  //   // const success = addUserToCourse(course_id, user_id);
  //   // return c.json({ success });
  // } catch (error: any) {
  //   return c.json({ error: error.message || "Failed to register user to course" }, 500);
  // }
});

app.get("/", async (c: Context<{ Variables: UserVariables }>) => {
  const user = c.var.user;
  const courses = await getUserCourses(user.id);
  console.log(courses);
  return c.json({
    courses: courses
  });
});



export { app };

Deno.serve(app.fetch);
