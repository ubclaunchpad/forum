"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signin(data: Record<string, unknown>) {
  const supabase = await createClient();

  const { email, password } = data as { email: string; password: string };
  const { error } = await (
    await supabase
  ).auth.signInWithPassword({ email, password });

  console.log(error);

  if (error) {
    redirect("/auth/signin?error=unable-to-sign-in");
    return;
  }

  revalidatePath("/", "layout");
  redirect("/forum/courses");
}
