"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getApiUrl } from "@/utils/helpers";

export type UserStatus = "pending_invite" | "pending_setup" | "active";

export async function checkUserStatus() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const response = await fetch(`${getApiUrl()}/users/user/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user status");
    }

    const data = await response.json();

    if (data.status === "active") {
      redirect("/");
    }

    const userData = {
      status: data.status as UserStatus,
      firstName: "",
      lastName: "",
    };

    if (data.status === "pending_setup") {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        const fullName = user.user_metadata.full_name;
        userData.firstName = fullName.split(" ")[0] || "";
        userData.lastName = fullName.split(" ").slice(1).join(" ") || "";
      }
    }

    return userData;
  } catch (error) {
    console.error("Status check error:", error);
    throw new Error("Failed to check user status");
  }
}

export async function finishSetup(formData: {
  firstName: string;
  lastName: string;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth/signin");
  }

  try {
    const response = await fetch(`${getApiUrl()}/users/user/finish-setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to complete setup");
    }

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Setup error:", error);
    throw error;
  }
}
