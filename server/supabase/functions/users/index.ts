import { Context, Hono } from "jsr:@hono/hono";
import { cors } from 'jsr:@hono/hono/cors';
import { AccountStatusValue, ACCOUNT_STATUS_VALUES, profileWithoutId, emailPasswordSchema } from "@shared/mod.ts";
import {
  approveUserAccount,
  deleteUserById,
  getAllUsers,
  getAllUsersAccountStatus,
  getUserAccountStatus,
  getUserById,
  userController,
} from "./controller.ts";
import {
  NotFoundError,
} from "../_shared/errors.ts";
import { authMiddleware, UserVariables } from "../_shared/utils/auth.ts";

const functionName = "users";
const app = new Hono().basePath(`/${functionName}`); 

app.use("*", cors({
  origin: ["http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: ["Authorization", "Content-Type", "*"],
  exposeHeaders: ["Authorization", "Content-Type"],
}));

app.use("*", authMiddleware as any);

// Get all users
app.get("/", async (c) => {
  try {
    const users = await getAllUsers();
    return c.json(users);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create new user
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const validationResult = emailPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json({
        error: "Validation failed",
        details: validationResult.error.errors,
      }, 400);
    }
    const user = await userController.createUserViaEmailPassword(validationResult.data);
    return c.json(user, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user by ID
app.get("/:id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { id } = c.req.param();
    const user = await getUserById(id);
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

// Delete user
app.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    await deleteUserById(id);
    return c.json({ message: "User deleted successfully" }, 200);
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

// Get user account status
app.get("/:id/status", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const user2 = c.var.user;

    const { id } = c.req.param();
    if (user2.id !== id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const status = await getUserAccountStatus(id);
    return c.json(status);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

app.post("/:id/status", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const user = c.var.user;
    const { id } = c.req.param();
    if (user.id !== id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const hasStatus = await getUserAccountStatus(id);
    if (hasStatus) {
      return c.json({ error: "User already has a status" }, 400);
    }
    const statusData = await userController.initializeUserAccountStatus(id);
    return c.json({ status: statusData }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

app.post("/:id/activate", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const data = profileWithoutId.safeParse(body);
    if (!data.success) {
      return c.json({ error: data.error.message }, 400);
    }
    await userController.activateAccountAndProfile(id, data.data);
    await userController.activateAccountAndProfile(id, data.data);
    return c.json({ message: "User account activated successfully" }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

// Approve user account
app.post("/admin/approve/:id", async (c) => {
  try {
    const { id } = c.req.param();
    await approveUserAccount(id);
    return c.json({ message: "User account approved successfully" }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

// Get all users account status
app.get("/admin/status", async (c) => {
  try {
    const rawStatuses = c.req.query("statusesToInclude")?.split(",");
    if (!rawStatuses) {
      return c.json({ error: "statusesToInclude is required" }, 400);
    }
    const statusesToInclude = rawStatuses.filter((status): status is AccountStatusValue => 
      ACCOUNT_STATUS_VALUES.includes(status as AccountStatusValue)
    );
    if (statusesToInclude.length === 0) {
      return c.json({ error: "No valid statuses provided" }, 400);
    }
    const statuses = await getAllUsersAccountStatus(
      statusesToInclude,
    );
    return c.json(statuses);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});


app.post("/:id/photo", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { id } = c.req.param();
    const user = c.var.user;
    if (user.id !== id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const body = await c.req.parseBody();
    const file = body.file;
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    if (file instanceof File) {
      await userController.updateUserPhoto(id, file);
      return c.json({ message: "Photo uploaded successfully" }, 200);
    }
    return c.json({ error: "Invalid file type" }, 400);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});


app.patch("/:id", async (c: Context<{ Variables: UserVariables }>) => {
  try {
    const { id } = c.req.param();
    const user = c.var.user;
    if (user.id !== id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const data = await c.req.json();
    const updatedUser = await userController.updateUserProfile(id, data);
    return c.json(updatedUser, 200);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { app };

Deno.serve(app.fetch);
