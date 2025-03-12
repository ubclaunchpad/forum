"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getApiUrl } from "@/utils/helpers";

export type UserStatus =
  | "active"
  | "inactive"
  | "waiting_for_approval"
  | "approve_on_login";

export async function checkUserStatus() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const id = session.user.id;
    const url = `${getApiUrl()}/users/${id}/status`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user status");
    }

    let data = await response.json();

    if (data == null || data.status == null) {
      const resp2 = await fetch(`${getApiUrl()}/users/${id}/status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!resp2.ok) {
        throw new Error("Failed to fetch user status");
      }

      data = await resp2.json();

      if (data == null || data.status == null) {
        throw new Error("Failed to fetch user status");
      }
      data = data.status;
    }

    if (data.status === "active") {
      redirect("/forum/courses");
    }

    const userData = {
      status: data.status as UserStatus,
      firstName: "",
      lastName: "",
    };

    return userData;
  } catch (error) {
    console.error("Status check error:", error);
    throw new Error("Failed to check user status");
  }
}

export async function finishSetup(formData: {
  firstName: string;
  lastName: string;
  username: string;
  pronouns: string;
  timezone: string;
  bio: string;
  displayName: string;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const id = session.user.id;
    const response = await fetch(`${getApiUrl()}/users/${id}/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: session.user.email,
        username: formData.username,
        pronouns: formData.pronouns,
        timezone: formData.timezone,
        bio: formData.bio,
        social_links: null,
        display_name: formData.displayName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to complete setup");
    }

    revalidatePath("/", "layout");
    redirect("/forum/courses");
  } catch (error) {
    console.error("Setup error:", error);
    throw error;
  }
}
