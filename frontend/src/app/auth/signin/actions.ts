"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signin(data: Record<string, unknown>) {
  const supabase = await createClient();

  const { email, password } = data as { email: string; password: string };
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  console.log(error);

  if (error) {
    redirect("/auth/signin?error=unable-to-sign-in");
    return;
  }

  revalidatePath("/", "layout");
  redirect("/forum/courses");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Google Sign-In Error:", error);
    redirect("/auth/signin?error=google-auth-failed");
  }

  return data;
}
