import { Context, Hono } from "jsr:@hono/hono";
import { cors } from 'jsr:@hono/hono/cors';
import { AccountStatusValue, ACCOUNT_STATUS_VALUES, baseTagSchema } from "@shared/mod.ts";
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
import { getAllTags } from "./controller/get_all_tags_activity.ts";
import { NestedTag, Tag, tagPermissionsSchema, updateTagSchema } from "@shared/schema/tag.ts";
import { getTag, getTagNested } from "../_shared/utils/tag_helper.ts";
import { createTag } from "./controller/create_tag_activity.ts";
import { updateTag } from "./controller/update_tag_activity.ts";
import { deleteTag } from "./controller/delete_tag_activity.ts";

const functionName = "courses";
const app = new Hono().basePath(`/${functionName}`); 

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
    const course_id = c.req.param("course_id");
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

// Get all tags of course
app.get("/:course_id/tags", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const course_id = c.req.param("course_id");
    const user = c.var.user;

    if (!(await isUserMemberOfCourse(user.id, course_id))) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tags = await getAllTags(course_id);
    return c.json({ tags: tags }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get tag
app.get("/:course_id/tags/:tag_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { course_id, tag_id } = c.req.param();
    const nested = c.req.query("nested");
    const user = c.var.user;

    if (!(await isUserMemberOfCourse(user.id, course_id))) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tag: Tag | NestedTag = nested ? await getTagNested(tag_id) : await getTag(tag_id);
    return c.json({ tag: tag }, 200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create a tag
app.post("/:course_id/tags", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const course_id = c.req.param("course_id");
    const user = c.var.user;
    const newTagData = await c.req.json();

    if (!newTagData.permissions) {
      newTagData.permissions = tagPermissionsSchema.parse({});
    }

    const validationResult = baseTagSchema.safeParse(newTagData);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors,
      }, 400);
    }

    const completeNewTagData = validationResult.data;

    const permissions = await getUserPermissionsInCourse(user.id, course_id);
    if (!permissions.can_create_tags) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const tag = await createTag(completeNewTagData, course_id);
    return c.json({ tag: tag }, 200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error"}, 500);
  }
});

// Update tag
// Note that if user wants to update permission or can_use_tag, they must pass the whole permission/can_use_tag object
app.put("/:course_id/tags/:tag_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const course_id = c.req.param("course_id");
    const tag_id = c.req.param("tag_id");
    const user = c.var.user;
    const updateTagData = await c.req.json();

    const validationResult = updateTagSchema.safeParse(updateTagData);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors,
      }, 400);
    }

    const completeUpdateTagData = validationResult.data;

    const permissions = await getUserPermissionsInCourse(user.id, course_id);
    if (!permissions.can_edit_tags) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await updateTag(completeUpdateTagData, tag_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    return c.json({ error: "Internal server error"}, 500);
  }
});

// Delete tag
app.delete("/:course_id/tags/:tag_id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const course_id = c.req.param("course_id");
    const tag_id = c.req.param("tag_id");
    const user = c.var.user;

    const permissions = await getUserPermissionsInCourse(user.id, course_id);
    if (!permissions.can_delete_tags) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await deleteTag(tag_id, course_id);
    return c.json(200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { app };
Deno.serve(app.fetch);
