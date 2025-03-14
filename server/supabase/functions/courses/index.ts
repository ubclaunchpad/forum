import { Context, Hono } from "jsr:@hono/hono";
import { AccountStatusValue, ACCOUNT_STATUS_VALUES } from "@shared/mod.ts";
import { createCourse } from "./controller/create_course_activity.ts";
import { getCourse } from "./controller/get_course_activity.ts";
import { addUserToCourse } from "./controller/add_course_member_activity.ts";
import {
  NotFoundError,
} from "../_shared/errors.ts";

const functionName = "courses";
const app = new Hono().basePath(`/${functionName}`); 

// Get all users
// app.get("/", async (c) => {
//   try {
//     const users = await getAllUsers();
//     return c.json(users);
//   } catch (error) {
//     if (error instanceof Error) {
//       return c.json({ error: error.message }, 500);
//     }
//     return c.json({ error: "Internal server error" }, 500);
//   }
// });
type UserVariables = {
  user: any;
};


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