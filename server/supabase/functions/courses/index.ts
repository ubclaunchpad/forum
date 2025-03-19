import { Context, Hono } from "jsr:@hono/hono";
import { AccountStatusValue, ACCOUNT_STATUS_VALUES } from "@shared/mod.ts";
import { createCourse } from "./controller/create_course_activity.ts";
import { getCourse } from "./controller/get_course_activity.ts";
import { addUserToCourse } from "./controller/add_course_member_activity.ts";
import {
  NotFoundError,
} from "../_shared/errors.ts";
import { authMiddleware, UserVariables } from "../_shared/utils/auth.ts";
import { InputValidationError } from '../_shared/errors';
import { 
  isUserInstructorInCourse, 
  isUserMemberOfCourse, 
  getRoleInCourse, 
  getUserPermissionsInCourse
} from "./controller/utils.ts";
import { 
  newCourseSchema,
  instructorRole,
  studentRole
  PermissionError,
  updateCourseReqSchema,
  defaultRoleSchema,
  DefaultRoles
} from '../../../../shared/schema/course.ts';

const functionName = "courses";
const app = new Hono().basePath(`/${functionName}`); 

app.use("*", cors({
  origin: ["http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Authorization", "Content-Type", "*"],
  exposeHeaders: ["Authorization", "Content-Type"],
}));

app.use("*", authMiddleware);

// Get course by course ID
app.get("/:course_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id } = c.req.param();
    const course = await getCourse(course_id);
    return c.json({ course: course }, 200);
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

// Get all courses for user
app.get("/", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const user = c.var.user;
    const courses = await getAllCoursesForUser(user.id);
    return c.json({ courses: courses }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create new course
app.post("/", async (c: Context<{ Variable: UserVariables}>) => {
  try {
    const newCoursedata = await c.req.json();
    const user = c.var.user;

    const validationResult = newCourseSchema.safeParse(newCourseData);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors,
      }, 400);
    }

    const course = await createCourse(validationResult.data, user.id);
    return c.json({ course: course }, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete course
app.delete("/:course_id", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const { course_id } = c.req.param();
    const user = c.var.user;
    
    if (!isUserInstructorInCourse(user_id, course_id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    deleteCourse(course_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instance of PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500)
});

// Update course
app.put("/:course_id", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const { course_id } = c.req.param("course_id");
    const newCourseData = await c.req.json();
    const user = c.var.user;
    
    const validationResult = updateCourseReqSchema.safeParse(newCourseData);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors,
      }, 400);
    }

    if (!isUserInstructorInCourse(user_id, course_id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updatedCourse = updateCourse(updateCourseData, course_id);
    return c.json({ course: updatedCourse }, 200);
  } catch (error) {
    console.error(error);
    if (error instance of NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error" }, 500)
});

// Add user to course
app.post("/:course_id/members/:user_id", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const { course_id, user_id } = c.req.param("course_id");
    const caller = c.var.user;
    const role = (await c.req.json()).role;

    if (role == undefined) {
      role = studentRole;
    } else {
      const validationResult = defaultRoleSchema.safeParse(role);
      if (!validationResult.success) {
        return c.json({
          error: "Validation failed",
          details: validationResult.error.errors,
        }, 400);
      }
    }

    const permissions = getUserPermissionsInCourse(caller.id, course_id);
    if (!permissions.can_invite[role]) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    addUserToCourse(course_id, user_id, role);
    return c.json(200);
  } catch (error: any) {
    console.error(error);
    if (error instance of NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instance of InputValidationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Remove user from course
app.delete("/:course_id/members/:user_id", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const { course_id, user_id } = c.req.param();
    const caller = c.var.user;

    const userRole = getRoleInCourse(user_id, course_id);
    const permissions = getUserPermissionsInCourse(caller.id, course_id);
    if (!permissions.can_invite[userRole]) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    removeCourseMember(course_id, user_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instance of NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instance of InputValidationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500)
});

// List members of course
app.get("/:course_id/members", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const { course_id } = c.req.param();
    const caller = c.var.user;

    if (!isUserMemberOfCourse(caller.id, course_id)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const members = getCourseMembers(course_id);
    return c.json({ members: members }, 200);
  } catch (error) {
    console.error(error);
    if (error instance of NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error" }, 500)
});
