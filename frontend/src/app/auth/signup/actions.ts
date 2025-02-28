"use server";

import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signup(user_data: Record<string, unknown>) {
  const res = await fetch(`${getApiUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user_data),
  });

  const response_data = await res.json();

  if (!res.ok) {
    return { ok: false, error: response_data.detail };
  }

  return { ok: true };
}

export async function signUpWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=signup`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google Sign-Up Error:", error);
    redirect("/auth/signup?error=google-auth-failed");
  }

  return data;
}
