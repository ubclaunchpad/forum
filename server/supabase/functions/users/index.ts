import { Hono } from "jsr:@hono/hono";
import { AccountStatusValue, ACCOUNT_STATUS_VALUES, newUserSchema } from "@shared/mod.ts";
import {
  approveUserAccount,
  deleteUserById,
  deleteUserInvite,
  getAllUsers,
  getAllUsersAccountStatus,
  getUserAccountStatus,
  getUserById,
  inviteUserToApplication,
  userController,
} from "./controller.ts";
import {
  NotFoundError,
} from "../_shared/errors.ts";

const functionName = "users";
const app = new Hono().basePath(`/${functionName}`); 

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

    const validationResult = newUserSchema.safeParse(body);
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
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user by ID
app.get("/:id", async (c) => {
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

// Invite user to application
app.post("/:id/invite", async (c) => {
  try {
    const { id } = c.req.param();
    await inviteUserToApplication(id, '');
    return c.json({ message: "User invited successfully" }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

// Delete user invite
app.delete("/:id/invite", async (c) => {
  try {
    const { id } = c.req.param();
    await deleteUserInvite(id);
    return c.json({ message: "User invite deleted successfully" }, 200);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return c.json({ error: error.message }, 404);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

// Get user account status
app.get("/:id/status", async (c) => {
  try {
    const { id } = c.req.param();
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
    const includeProfile = c.req.query("includeProfile") === "true";
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
      includeProfile,
    );
    return c.json(statuses);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
  }
});

export { app };

Deno.serve(app.fetch);
