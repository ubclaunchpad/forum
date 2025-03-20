import { Context, Hono } from "jsr:@hono/hono";
import { cors } from 'jsr:@hono/hono/cors';
import { AccountStatusValue, ACCOUNT_STATUS_VALUES } from "@shared/mod.ts";
import { createCourse } from "./controller/create_course_activity.ts";
import { getCourse } from "./controller/get_course_activity.ts";
import { addUserToCourse } from "./controller/add_course_member_activity.ts";
import { removeCourseMember } from "./controller/remove_course_member_activity.ts";
import { updateCourse } from "./controller/update_course_activity.ts";
import { deleteCourse } from "./controller/delete_course_activity.ts";
import { getUserCourses } from "./controller/get_all_courses_activity.ts";
import { getCourseMembers } from "./controller/get_course_members_activity.ts";
import { authMiddleware, UserVariables } from "../_shared/utils/auth.ts";
import { NotFoundError, InputValidationError, PermissionError } from '../_shared/errors.ts';
import { 
  isUserInstructorInCourse, 
  isUserMemberOfCourse, 
  getRoleInCourse, 
  getUserPermissionsInCourse
} from "../_shared/utils/permission_manager.ts";
import { 
  courseBaseSchema,
  instructorRole,
  studentRole,
  updateCourseReqSchema,
  defaultRoleSchema,
  DefaultRoles,
  Permissions
} from '../../../../shared/schema/course.ts';

const functionName = "courses";
const app = new Hono().basePath(`/${functionName}`); 

app.use("*", cors({
  origin: ["http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Authorization", "Content-Type", "*"],
  exposeHeaders: ["Authorization", "Content-Type"],
}));

app.use("*", authMiddleware as any);

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
    const courses = await getUserCourses(user.id);
    return c.json({ courses: courses }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create new course
app.post("/", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const newCourseData = await c.req.json();
    console.log(newCourseData)
    const user = c.var.user;

    const validationResult = courseBaseSchema.safeParse(newCourseData);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors
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
    
    if (!(await isUserInstructorInCourse(user.id, course_id))) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await deleteCourse(course_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instanceof PermissionError) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update course
app.put("/:course_id", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const course_id = c.req.param("course_id");
    const updateCourseData = await c.req.json();
    const user = c.var.user;
    
    const validationResult = updateCourseReqSchema.safeParse(updateCourseData);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors,
      }, 400);
    }

    if (!(await isUserInstructorInCourse(user.id, course_id))) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await updateCourse(updateCourseData, course_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Add user to course
app.post("/:course_id/members/:user_id", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const course_id= c.req.param("course_id");
    const user_id = c.req.param("user_id");
    const caller = c.var.user;
    let role = (await c.req.json()).role;

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

    console.info(`course: ${course_id}\nuser_id: ${user_id}\ncaller id: ${caller.id}\nrole: ${role}`)

    const permissions = await getUserPermissionsInCourse(caller.id, course_id) as Permissions;
    if (!permissions.can_invite[role]) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await addUserToCourse(course_id, user_id, role);
    return c.json(200);
  } catch (error: any) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof InputValidationError) {
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

    const userRole = await getRoleInCourse(user_id, course_id);
    const permissions = await getUserPermissionsInCourse(caller.id, course_id);
    if (!permissions.can_invite[userRole]) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await removeCourseMember(course_id, user_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof InputValidationError) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// List members of course
app.get("/:course_id/members", async (c: Context<{ Variables: UserVariables}>) => {
  try {
    const { course_id } = c.req.param();
    const caller = c.var.user;

    if (!(await isUserMemberOfCourse(caller.id, course_id))) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const members = await getCourseMembers(course_id);
    return c.json({ members: members }, 200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { app };
Deno.serve(app.fetch);